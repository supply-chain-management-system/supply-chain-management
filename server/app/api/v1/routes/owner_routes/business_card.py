# app/api/v1/routes/business_card.py

from fastapi import APIRouter, Depends, HTTPException, status
from app.models.auth.user import RoleEnum, User
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.db.deps import get_db, get_tenant_db
from app.models.owner_models.business_card import BusinessCard
from app.schemas.owner_schemas.business_card import (
    BusinessCardCreate,
    BusinessManagerResponse,
    BusinessCardUpdate,
    BusinessCardResponse,
)
from app.services.auth.dependancy import require_role

router = APIRouter(prefix="/business-cards", tags=["Business Cards"])


def serialize_manager(manager: User):
    return {
        "id": manager.id,
        "name": manager.name,
        "email": manager.email,
        "role": manager.role.value if manager.role else None,
        "business_id": manager.business_id,
        "is_active": manager.is_active,
        "is_verified": manager.is_verified,
        "created_at": manager.created_at,
    }


def build_card_response(
    card: BusinessCard, managers_by_business: dict[str, list[User]]
):
    card_data = BusinessCardResponse.model_validate(card).model_dump()
    card_data["managers"] = [
        serialize_manager(manager)
        for manager in managers_by_business.get(str(card.id), [])
    ]
    return card_data


def query_business_managers(app_db: Session, business_ids: list[str]):
    normalized_ids = [str(business_id).strip() for business_id in business_ids]

    return (
        app_db.query(User)
        .filter(
            or_(
                User.role == RoleEnum.business_manager,
                User.role == "business_manager",
            ),
            func.trim(User.business_id).in_(normalized_ids),
        )
        .order_by(User.created_at.desc())
        .all()
    )


@router.post("/")
def create_business_card(
    payload: BusinessCardCreate,
    db: Session = Depends(get_tenant_db),
    dependencies=[Depends(require_role(["owner"]))],
):

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
):
    cards = db.query(BusinessCard).order_by(BusinessCard.created_at.desc()).all()

    business_ids = [str(card.id) for card in cards]

    managers_by_business: dict[str, list[User]] = {}
    if business_ids:
        managers = query_business_managers(app_db, business_ids)

        for manager in managers:
            managers_by_business.setdefault(str(manager.business_id).strip(), []).append(
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
):
    managers = query_business_managers(app_db, [str(card_id)])
    return [serialize_manager(manager) for manager in managers]


@router.get(
    "/{card_id}",
    response_model=BusinessCardResponse,
)
def get_business_card(
    card_id: int,
    db: Session = Depends(get_tenant_db),
    app_db: Session = Depends(get_db),
):
    card = db.query(BusinessCard).filter(BusinessCard.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Business card not found")

    managers = query_business_managers(app_db, [str(card.id)])

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
