# app/api/v1/routes/business_manager/team.py

from fastapi import APIRouter, HTTPException, Depends, status, Query
import httpx
import uuid
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.models.company_auth.managers import InviteToken 
from app.models.auth.user import Invitation, User
from app.schemas.auth.company import InviteRequest
from app.services.auth.dependancy import get_current_user
from app.api.v1.routes.auth.company_auth import send_invite
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/business-manager/team", tags=["Business Manager Team"])

MANAGER_ROLES = {
    "factory_manager",
    "warehouse_manager",
    "logistics_manager",
    "co_manager",
    "supply_manager",
}

class RefinedInviteSchema(BaseModel):
    email: EmailStr
    role: str # e.g., "Factory Manager"
    business_name: str = "NexusGrid"
    target_id: Optional[int] = None  # The specific Factory or Warehouse ID


class ManagerCardCreate(BaseModel):
    name: str
    role: str
    business_id: int
    business_card_id: int
    business_name: str = "NexusGrid"
    location: Optional[str] = None
    shift: Optional[str] = "Day"
    department: Optional[str] = None
    target_id: Optional[int] = None
    member_limit: Optional[int] = None
    description: Optional[str] = None
    color: Optional[str] = "#185FA5"


class ManagerCardInvite(BaseModel):
    email: EmailStr
    business_name: str = "NexusGrid"


def invite_link(token: str, role: str, target_id: Optional[int] = None) -> str:
    return f"http://localhost:5173/register?token={token}&role={role}&tid={target_id or 0}"


async def dispatch_invite(payload: dict):
    n8n_url = "http://127.0.0.1:5678/webhook/invite-user"
    async with httpx.AsyncClient() as client:
        try:
            await client.post(n8n_url, json=payload)
        except Exception as e:
            print(f"n8n Dispatch Error: {e}")


def serialize_invite(invite: InviteToken):
    extra = invite.extra_data or {}
    return {
        "id": invite.id,
        "email": invite.email,
        "name": invite.name,
        "role": invite.role,
        "token": invite.token,
        "is_used": invite.is_used,
        "created_at": invite.created_at,
        "extra_data": extra,
    }


def serialize_company_invite(invite: Invitation):
    return {
        "id": invite.id,
        "email": invite.invited_email,
        "name": invite.invited_email.split("@")[0],
        "role": invite.role.value if invite.role else None,
        "token": invite.id,
        "is_used": invite.accepted,
        "created_at": invite.created_at,
        "extra_data": {
            "type": "company_invitation",
            "business_id": invite.business_id,
            "manager_card_id": invite.category_id,
        },
    }


def serialize_card(card: InviteToken, members: list[InviteToken]):
    extra = card.extra_data or {}
    return {
        "id": card.id,
        "name": card.name,
        "role": extra.get("manager_role"),
        "business_id": extra.get("business_id"),
        "business_card_id": extra.get("business_card_id"),
        "location": extra.get("location"),
        "shift": card.shift or extra.get("shift"),
        "department": card.department or extra.get("department"),
        "target_id": card.factory_id or extra.get("target_id"),
        "member_limit": extra.get("member_limit"),
        "description": extra.get("description"),
        "color": extra.get("color"),
        "created_at": card.created_at,
        "members": [
            serialize_company_invite(member)
            if isinstance(member, Invitation)
            else serialize_invite(member)
            for member in members
        ],
    }


@router.get("/cards")
def get_manager_cards(
    business_card_id: int = Query(...),
    db: Session = Depends(get_db),
):
    cards = (
        db.query(InviteToken)
        .filter(
            InviteToken.extra_data.contains(
                {"type": "manager_card", "business_card_id": business_card_id}
            )
        )
        .order_by(InviteToken.created_at.desc())
        .all()
    )

    if not cards:
        return []

    card_ids = [card.id for card in cards]
    invites = (
        db.query(Invitation)
        .filter(
            Invitation.category == "manager_card",
            Invitation.category_id.in_([str(card_id) for card_id in card_ids]),
        )
        .order_by(Invitation.created_at.desc())
        .all()
    )

    members_by_card = {card_id: [] for card_id in card_ids}
    for invite in invites:
        card_id = int(invite.category_id)
        if card_id in members_by_card:
            members_by_card[card_id].append(invite)

    return [serialize_card(card, members_by_card.get(card.id, [])) for card in cards]


@router.post("/cards", status_code=status.HTTP_201_CREATED)
def create_manager_card(data: ManagerCardCreate, db: Session = Depends(get_db)):
    role = data.role.strip()
    if role not in MANAGER_ROLES:
        raise HTTPException(status_code=400, detail="Unsupported manager role.")

    token = str(uuid.uuid4())
    card = InviteToken(
        email=f"manager-card-{token}@local.invalid",
        role=f"{role}_card",
        token=token,
        name=data.name.strip(),
        shift=data.shift,
        department=data.department,
        factory_id=data.target_id,
        extra_data={
            "type": "manager_card",
            "manager_role": role,
            "business_id": data.business_id,
            "business_card_id": data.business_card_id,
            "business_name": data.business_name,
            "location": data.location,
            "shift": data.shift,
            "department": data.department,
            "target_id": data.target_id,
            "member_limit": data.member_limit,
            "description": data.description,
            "color": data.color,
        },
    )

    db.add(card)
    db.commit()
    db.refresh(card)

    return serialize_card(card, [])


@router.post("/cards/{card_id}/invite", status_code=status.HTTP_201_CREATED)
async def invite_to_manager_card(
    card_id: int,
    data: ManagerCardInvite,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = db.query(InviteToken).filter(InviteToken.id == card_id).first()
    if not card or (card.extra_data or {}).get("type") != "manager_card":
        raise HTTPException(status_code=404, detail="Manager card not found.")

    extra = card.extra_data or {}
    role = extra.get("manager_role")
    if role not in MANAGER_ROLES:
        raise HTTPException(status_code=400, detail="Manager card has an unsupported role.")

    payload = InviteRequest(
        business_id=int(extra.get("business_id") or extra.get("business_card_id")),
        role=role,
        email=data.email,
        manager_card_id=card_id,
        manager_card_name=card.name,
    )

    return await send_invite(payload=payload, current_user=current_user, db=db)

@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def create_context_aware_invite(data: RefinedInviteSchema, db: Session = Depends(get_db)):
    token = str(uuid.uuid4())
    
    # Save to DB with the target_id (ensure your InviteToken model has this column!)
    invite = InviteToken(
        email=data.email,
        role=data.role,
        token=token,
        name=data.email.split("@")[0],
        extra_data={"target_id": data.target_id},
    )
    db.add(invite)
    db.commit()

    # The link now carries the role and the specific target ID for the registration page
    link = invite_link(token, data.role, data.target_id)

    # Dispatch to n8n
    payload = {
        "email": data.email,
        "role": data.role,
        "business_name": data.business_name,
        "invite_link": link,
        "target_id": data.target_id
    }

    await dispatch_invite(payload)

    return {
        "status": "success",
        "message": f"Invite for {data.role} dispatched.",
        "invite_link": link # Useful for manual testing/copying
    }
