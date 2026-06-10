# app/api/v1/routes/business_card.py

from fastapi import APIRouter, Depends, HTTPException, status
from app.models.auth.user import Invitation, RoleEnum, User
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.deps import get_db, get_tenant_db
from app.models.owner_models.business_card import BusinessCard
from app.schemas.owner_schemas.business_card import (
    BusinessCardCreate,
    BusinessManagerResponse,
    BusinessCardUpdate,
    BusinessCardResponse,
)
from app.services.auth.dependancy import require_role, get_current_user
from app.services.managers.manager_services import (
    serialize_manager,
    build_card_response,
    query_business_assignees,
    query_business_managers,
)

from app.services.subscriptions.limit_checker import check_business_limit

router = APIRouter(prefix="/business-cards", tags=["Business Cards"])


@router.post("/", dependencies=[Depends(require_role(["admin", "owner"]))])
def create_business_card(
    payload: BusinessCardCreate,
    db: Session = Depends(get_tenant_db),
    app_db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.company_id:
        check_business_limit(app_db, db, current_user.company_id)

    business_card = BusinessCard(**payload.model_dump())

    db.add(business_card)
    db.commit()
    db.refresh(business_card)

    return business_card


@router.get(
    "/",
    response_model=list[BusinessCardResponse],
)
def get_all_business_cards(
    db: Session = Depends(get_tenant_db),
    app_db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cards = db.query(BusinessCard).order_by(BusinessCard.created_at.desc()).all()

    business_ids = [str(card.id) for card in cards]

    managers_by_business: dict[str, list[User]] = {}
    if business_ids:
        managers_with_ids = query_business_managers(app_db, business_ids, current_user.company_id)

        for manager, assigned_business_id in managers_with_ids:
            manager.business_id = assigned_business_id
            managers_by_business.setdefault(str(assigned_business_id).strip(), []).append(
                manager
            )

    return [build_card_response(card, managers_by_business) for card in cards]


@router.get(
    "/managers/by-business/{card_id}",
    response_model=list[BusinessManagerResponse],
)
def get_business_card_managers(
    card_id: int,
    app_db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    managers_with_ids = query_business_managers(app_db, [str(card_id)], current_user.company_id)
    managers = []
    for manager, assigned_business_id in managers_with_ids:
        manager.business_id = assigned_business_id
        managers.append(manager)
    return [serialize_manager(manager) for manager in managers]


@router.get(
    "/managers/by-business/{card_id}/team",
)
def get_business_card_team(
    card_id: int,
    app_db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assigned_users = query_business_assignees(
        app_db,
        [str(card_id)],
        current_user.company_id,
        [
            RoleEnum.business_manager,
            RoleEnum.factory_manager,
            RoleEnum.warehouse_manager,
            RoleEnum.logistics_manager,
            RoleEnum.co_manager,
            RoleEnum.supply_manager,
            "business_manager",
            "factory_manager",
            "warehouse_manager",
            "logistics_manager",
            "co_manager",
            "supply_manager",
        ],
    )

    team = []
    for manager, assigned_business_id in assigned_users:
        manager.business_id = assigned_business_id
        team.append(serialize_manager(manager))

    pending_invites = (
        app_db.query(Invitation)
        .filter(
            Invitation.company_id == current_user.company_id,
            Invitation.category == "business",
            func.trim(Invitation.category_id) == str(card_id),
            Invitation.accepted == False,  # noqa: E712
            Invitation.role.in_(
                [
                    RoleEnum.business_manager,
                    RoleEnum.factory_manager,
                    RoleEnum.warehouse_manager,
                    RoleEnum.logistics_manager,
                    RoleEnum.co_manager,
                    RoleEnum.supply_manager,
                    "business_manager",
                    "factory_manager",
                    "warehouse_manager",
                    "logistics_manager",
                    "co_manager",
                    "supply_manager",
                ]
            ),
        )
        .order_by(Invitation.created_at.desc())
        .all()
    )

    for invite in pending_invites:
        role = invite.role.value if invite.role else None
        team.append(
            {
                "id": f"invite-{invite.id}",
                "name": invite.invited_email.split("@")[0],
                "email": invite.invited_email,
                "role": role,
                "business_id": invite.category_id,
                "is_active": False,
                "is_verified": False,
                "is_pending": True,
                "created_at": invite.created_at,
            }
        )

    return team


@router.get(
    "/{card_id}",
    response_model=BusinessCardResponse,
)
def get_business_card(
    card_id: int,
    db: Session = Depends(get_tenant_db),
    app_db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = db.query(BusinessCard).filter(BusinessCard.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Business card not found")

    managers_with_ids = query_business_managers(app_db, [str(card.id)], current_user.company_id)
    managers = []
    for manager, assigned_business_id in managers_with_ids:
        manager.business_id = assigned_business_id
        managers.append(manager)

    return build_card_response(card, {str(card.id): managers})


# UPDATE
@router.put(
    "/{card_id}",
    response_model=BusinessCardResponse,
)
def update_business_card(
    card_id: int,
    payload: BusinessCardUpdate,
    db: Session = Depends(get_tenant_db),
):
    card = db.query(BusinessCard).filter(BusinessCard.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Business card not found")

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(card, key, value)

    db.commit()
    db.refresh(card)

    return card


# DELETE
@router.delete(
    "/{card_id}",
    status_code=status.HTTP_200_OK,
)
def delete_business_card(
    card_id: int,
    db: Session = Depends(get_tenant_db),
):
    card = db.query(BusinessCard).filter(BusinessCard.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Business card not found")

    db.delete(card)
    db.commit()

    return {"message": "Business card deleted successfully"}



