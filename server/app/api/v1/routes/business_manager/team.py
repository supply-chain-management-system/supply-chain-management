# app/api/v1/routes/business_manager/team.py

from fastapi import APIRouter, HTTPException, Depends, status, Query
import httpx
import uuid
from sqlalchemy.orm import Session
from app.db.deps import get_db, get_tenant_db
from app.models.company_auth.managers import InviteToken 
from app.models.auth.user import Invitation, User
from app.services.auth.dependancy import get_current_user
from app.models.business_manager.team import (
    FactoryManager,
    WarehouseManager,
    LogisticsManager,
    SupplyManager,
)
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/business-manager/team", tags=["Business Manager Team"])

MANAGER_ROLES = {
    "factory_manager",
    "warehouse_manager",
    "logistics_manager",
    "supply_manager",
}

ROLE_MODEL = {
    "factory_manager": FactoryManager,
    "warehouse_manager": WarehouseManager,
    "logistics_manager": LogisticsManager,
    "supply_manager": SupplyManager,
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


def serialize_model_card(card, role: str, members: list[InviteToken]):
    department = getattr(card, "department", None)
    target_id = None

    if role == "factory_manager":
        target_id = card.factory_id
    elif role == "warehouse_manager":
        target_id = card.warehouse_id
        department = card.zone or card.department
    elif role == "logistics_manager":
        target_id = card.hub_id
        department = card.route or card.department
    elif role == "supply_manager":
        target_id = card.supplier_id
        department = card.category or card.department

    return {
        "id": card.id,
        "name": card.name,
        "role": role,
        "business_id": card.business_id,
        "business_card_id": card.business_card_id,
        "location": None,
        "shift": getattr(card, "shift", None),
        "department": department,
        "target_id": target_id,
        "member_limit": None,
        "description": card.description,
        "color": card.color,
        "created_at": card.created_at,
        "members": [serialize_invite(member) for member in members],
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
    app_db: Session = Depends(get_db),
    tenant_db: Session = Depends(get_tenant_db),
):
    result = []

    for role, model in ROLE_MODEL.items():
        cards = (
            tenant_db.query(model)
            .filter(model.business_card_id == business_card_id)
            .order_by(model.created_at.desc())
            .all()
        )

        card_ids = [str(card.id) for card in cards]
        members_by_card = {card_id: [] for card_id in card_ids}

        if card_ids:
            member_invites = (
                app_db.query(InviteToken)
                .filter(
                    InviteToken.extra_data.contains(
                        {
                            "type": "manager_card_member",
                            "business_card_id": business_card_id,
                            "manager_role": role,
                        }
                    )
                )
                .order_by(InviteToken.created_at.desc())
                .all()
            )

            for invite in member_invites:
                manager_card_id = str((invite.extra_data or {}).get("manager_card_id"))
                if manager_card_id in members_by_card:
                    members_by_card[manager_card_id].append(invite)

        result.extend(
            serialize_model_card(card, role, members_by_card.get(str(card.id), []))
            for card in cards
        )

    legacy_cards = (
        app_db.query(InviteToken)
        .filter(
            InviteToken.extra_data.contains(
                {"type": "manager_card", "business_card_id": business_card_id}
            )
        )
        .order_by(InviteToken.created_at.desc())
        .all()
    )

    legacy_card_ids = [card.id for card in legacy_cards]
    legacy_invites = (
        app_db.query(Invitation)
        .filter(
            Invitation.category == "manager_card",
            Invitation.category_id.in_([str(card_id) for card_id in legacy_card_ids]),
        )
        .order_by(Invitation.created_at.desc())
        .all()
    )

    legacy_members_by_card = {card_id: [] for card_id in legacy_card_ids}
    for invite in legacy_invites:
        card_id = int(invite.category_id)
        if card_id in legacy_members_by_card:
            legacy_members_by_card[card_id].append(invite)

    existing_keys = {
        (card.get("role"), card.get("business_card_id"), card.get("name"))
        for card in result
    }

    for card in legacy_cards:
        extra = card.extra_data or {}
        legacy_key = (extra.get("manager_role"), extra.get("business_card_id"), card.name)
        if legacy_key not in existing_keys:
            result.append(serialize_card(card, legacy_members_by_card.get(card.id, [])))

    return sorted(
        result,
        key=lambda card: card.get("created_at").isoformat() if card.get("created_at") else "",
        reverse=True,
    )


@router.post("/cards", status_code=status.HTTP_201_CREATED)
def create_manager_card(data: ManagerCardCreate, tenant_db: Session = Depends(get_tenant_db)):
    role = data.role.strip()
    if role not in MANAGER_ROLES:
        raise HTTPException(status_code=400, detail="Unsupported manager role.")

    token = str(uuid.uuid4())
    email = f"manager-card-{token}@local.invalid"
    common = {
        "name": data.name.strip(),
        "email": email,
        "shift": data.shift,
        "department": data.department,
        "business_id": data.business_id,
        "business_card_id": data.business_card_id,
        "size": "Manager Card",
        "tagline": data.location,
        "description": data.description,
        "color": data.color,
        "is_used": False,
    }

    if role == "factory_manager":
        card = FactoryManager(
            **common,
            factory_id=data.target_id,
        )
    elif role == "warehouse_manager":
        card = WarehouseManager(
            **common,
            zone=data.department or "General Storage",
            warehouse_id=data.target_id,
        )
    elif role == "logistics_manager":
        card = LogisticsManager(
            **common,
            route=data.department or "Local",
            hub_id=data.target_id,
            is_active=False,
        )
    elif role == "supply_manager":
        card = SupplyManager(
            **common,
            category=data.department or "Procurement",
            supplier_id=data.target_id,
            is_active=False,
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported manager role.")

    tenant_db.add(card)
    tenant_db.commit()
    tenant_db.refresh(card)

    return serialize_model_card(card, role, [])


def create_legacy_manager_card(data: ManagerCardCreate, db: Session):
    token = str(uuid.uuid4())
    return InviteToken(
        email=f"manager-card-{token}@local.invalid",
        role=f"{data.role.strip()}_card",
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


@router.post("/cards/{card_id}/invite", status_code=status.HTTP_201_CREATED)
async def invite_to_manager_card(
    card_id: int,
    data: ManagerCardInvite,
    role: str = Query(...),
    app_db: Session = Depends(get_db),
    tenant_db: Session = Depends(get_tenant_db),
    current_user: User = Depends(get_current_user),
):
    manager_role = role.strip()
    model = ROLE_MODEL.get(manager_role)
    if not model:
        raise HTTPException(status_code=400, detail="Unsupported manager role.")

    card = tenant_db.query(model).filter(model.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Manager card not found.")

    token = str(uuid.uuid4())
    invite = InviteToken(
        email=data.email,
        role=manager_role,
        token=token,
        name=data.email.split("@")[0],
        shift=getattr(card, "shift", None),
        department=getattr(card, "department", None),
        factory_id=(
            getattr(card, "factory_id", None)
            or getattr(card, "warehouse_id", None)
            or getattr(card, "hub_id", None)
            or getattr(card, "supplier_id", None)
        ),
        extra_data={
            "type": "manager_card_member",
            "business_id": card.business_id,
            "business_card_id": card.business_card_id,
            "manager_card_id": card.id,
            "manager_card_name": card.name,
            "manager_role": manager_role,
        },
    )

    app_db.add(invite)
    app_db.commit()
    app_db.refresh(invite)

    link = invite_link(token, manager_role, invite.factory_id)
    await dispatch_invite(
        {
            "email": data.email,
            "role": manager_role,
            "business_name": data.business_name,
            "invite_link": link,
            "target_id": invite.factory_id,
            "manager_card_id": card.id,
            "manager_card_name": card.name,
        }
    )

    return {
        "status": "success",
        "message": f"Invite for {manager_role} dispatched.",
        "invite_link": link,
        "invite": serialize_invite(invite),
    }

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
