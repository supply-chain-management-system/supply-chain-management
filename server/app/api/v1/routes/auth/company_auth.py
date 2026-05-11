from fastapi import APIRouter, HTTPException, Depends
import httpx
import uuid
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.schemas.auth.company import InviteRequest

from app.services.auth.dependancy import get_current_user

from app.models.auth.user import User
from app.models.auth.user import Invitation

from app.services.auth.rolebased import (
    get_owner_email,
    validate_invite_permission,
)

router = APIRouter(tags=["Company Invitations"])

load_dotenv()

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL")


@router.post("/invite/send")
async def send_invite(
    payload: InviteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:

        print(
            f"Received invite request from user: "
            f"{current_user.email} for {payload.email}"
        )

        # VALIDATE PERMISSION
        validate_invite_permission(current_user, payload)

        print("Permission validated successfully")

        # GENERATE EVENT ID
        event_id = str(uuid.uuid4())

        # GET OWNER EMAIL
        business_owner_email = get_owner_email(current_user.company.schema_name)

        print(f"Business owner email: {business_owner_email}")

        # REMOVE DUPLICATE EMAILS
        recipients = list(
            set(
                [
                    payload.email,
                    current_user.email,
                    business_owner_email,
                ]
            )
        )

        print(f"Recipients: {recipients}")

        # CREATE INVITE LINK
        invite_link = f"{FRONTEND_URL}/invite/accept/{event_id}"

        print(f"Invite link: {invite_link}")

        # STORE INVITATION
        invitation = Invitation(
            id=event_id,
            invited_email=payload.email,
            company_id=current_user.company_id,
            business_id=payload.business_id,
            role=payload.role,
            category="business",
            category_id=str(payload.business_id),
            invited_by=current_user.email,
            owner_email=business_owner_email,
            accepted=False,
        )

        db.add(invitation)

        # FLUSH ONLY
        db.flush()

        print("Invitation stored temporarily")

        # WEBHOOK PAYLOAD
        data = {
            "event_id": invitation.id,
            "event_type": "invite_created",
            "company_id": invitation.company_id,
            "business_id": invitation.business_id,
            "role": invitation.role,
            "invited_email": invitation.invited_email,
            "created_by": invitation.invited_by,
            "owner_email": invitation.owner_email,
            "invite_link": invite_link,
            "recipients": recipients,
        }

        print(f"Sending data to n8n: {data}")

        # SEND TO N8N
        async with httpx.AsyncClient() as client:

            response = await client.post(
                N8N_WEBHOOK_URL,
                json=data,
                timeout=20.0,
            )

        print(f"Response from n8n: " f"{response.status_code} - {response.text}")

        # CHECK RESPONSE
        if response.status_code >= 400:

            db.rollback()

            raise HTTPException(
                status_code=500,
                detail=f"Failed to trigger n8n: {response.text}",
            )

        # COMMIT AFTER SUCCESS
        db.commit()

        # REFRESH OBJECT
        db.refresh(invitation)

        print("Invitation committed successfully")

        return {
            "status": "success",
            "message": "Invitation sent successfully",
            "event_id": invitation.id,
            "invite_link": invite_link,
            "recipients": recipients,
        }

    except httpx.RequestError as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not connect to n8n: {str(e)}",
        )

    except HTTPException as e:

        db.rollback()

        raise e

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
