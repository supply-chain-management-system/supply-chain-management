from fastapi import APIRouter, HTTPException, Depends, status, Response
import httpx
import uuid
import os
from dotenv import load_dotenv
from app.core.security import hash_password
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.schemas.auth.company import InviteRequest
from app.services.auth.dependancy import get_current_user

from app.models.auth.user import User, Invitation, UserAssignment


from app.services.auth.rolebased import (
    build_recipients,
    get_owner_email,
    validate_invite_permission,
)

from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone


from app.services.email_service import send_verification_otp_email
from .otp import generate_otp

from app.services.subscriptions.limit_checker import check_invite_limit

router = APIRouter(tags=["Company Invitations"])

load_dotenv()

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL")


@router.post("/invite/send")
@router.post("/invite/send/")
async def send_invite(
    payload: InviteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:

        print(
            f"Received invite request from user: {current_user.email} for {payload.email}"
        )

        existing_user = db.query(User).filter(User.email == payload.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists.",
            )

        validate_invite_permission(current_user, payload)

        if current_user.company_id and current_user.company.schema_name:
            check_invite_limit(db, current_user.company_id, current_user.company.schema_name, payload.role)

        event_id = str(uuid.uuid4())

        business_owner_email = get_owner_email(current_user.company.schema_name)

        recipients = build_recipients(
            current_user,
            payload,
            business_owner_email,
        )

        invite_link = f"{FRONTEND_URL}/invite/accept/{event_id}"
        print("hel",FRONTEND_URL)


        invite_category = "manager_card" if payload.manager_card_id else "business"
        invite_category_id = (
            str(payload.manager_card_id)
            if payload.manager_card_id
            else str(payload.business_id)
        )

        # STORE IN DATABASE
        invitation = Invitation(
            id=event_id,
            invited_email=payload.email,
            company_id=current_user.company_id,
            business_id=payload.business_id,
            role=payload.role,
            category=invite_category,
            category_id=invite_category_id,
            invited_by=current_user.email,
            owner_email=business_owner_email,
            accepted=False,
        )

        db.add(invitation)
        db.commit()
        db.refresh(invitation)

        print("Invitation stored successfully")

        # SEND TO N8N
        data = {
            "event_id": invitation.id,
            "event_type": "invite_created",
            "company_id": invitation.company_id,
            "business_id": invitation.business_id,
            "role": invitation.role.value,
            "invited_email": invitation.invited_email,
            "created_by": invitation.invited_by,
            "owner_email": invitation.owner_email,
            "invite_link": invite_link,
            "invite_recipient": recipients["invite_recipient"],
            "notification_recipients": recipients["notification_recipients"],
            "category": invitation.category,
            "category_id": invitation.category_id,
            "manager_card_id": payload.manager_card_id,
            "manager_card_name": payload.manager_card_name,
        }

        n8n_status = "skipped"
        n8n_error = None

        if N8N_WEBHOOK_URL:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        N8N_WEBHOOK_URL,
                        json=data,
                        timeout=20.0,
                    )

                print(response.status_code, response.text)

                if response.status_code in [200, 201]:
                    n8n_status = "sent"
                else:
                    n8n_status = "failed"
                    n8n_error = f"n8n returned {response.status_code}: {response.text}"
                    print(f"n8n invite dispatch failed: {n8n_error}")

            except Exception as e:
                n8n_status = "failed"
                n8n_error = str(e)
                print(f"n8n invite dispatch failed: {n8n_error}")
        else:
            n8n_error = "N8N_WEBHOOK_URL is not configured"
            print(n8n_error)

        return {
            "status": "success",
            "event_id": invitation.id,
            "n8n_status": n8n_status,
            "n8n_error": n8n_error,
        }

    except HTTPException as e:
        raise e

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


class InviteRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class InviteRegisterResponse(BaseModel):
    message: str
    user: dict


@router.post(
    "/invite/register/{token}",
    status_code=status.HTTP_201_CREATED,
    summary="Register via Invitation",
    description="Completes registration for an invited user using the invitation token.",
)
async def invite_register(
    token: str,
    body: InviteRegisterRequest,
    db: Session = Depends(get_db),
):
    invitation: Invitation | None = (
        db.query(Invitation).filter(Invitation.id == token).first()
    )

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found or invalid token.",
        )

    if invitation.accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This invitation has already been used.",
        )

    if invitation.invited_email.lower() != body.email.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email does not match the invited email address.",
        )

    existing_user = db.query(User).filter(User.email == body.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    otp = generate_otp()
    otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=3)

    new_user = User(
        name=body.name,
        email=body.email,
        password=hash_password(body.password),
        otp_code=otp,
        otp_expiry=otp_expiry,
        company_id=invitation.company_id,
        role=invitation.role,
        business_id=invitation.business_id,
        is_active=True,
        is_verified=False,
        is_approved_company=False,
    )

    db.add(new_user)
    db.flush()

    assignment = UserAssignment(
        user_id=new_user.id,
        company_id=invitation.company_id,
        role=invitation.role,
        category=invitation.category,
        category_id=invitation.category_id,
    )
    db.add(assignment)

    invitation.accepted = True

    db.commit()
    db.refresh(new_user)

    await send_verification_otp_email(new_user.email, new_user.name, otp=otp)

    return InviteRegisterResponse(
        message="Registration successful. Please verify your email with the OTP sent.",
        user={
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.name,
            "role": new_user.role.value if new_user.role else None,
            "company_id": new_user.company_id,
            "is_verified": new_user.is_verified,
            "invited_by": invitation.invited_by,
            "category": invitation.category,
            "category_id": invitation.category_id,
            "business_id": invitation.business_id,
        },
    )
