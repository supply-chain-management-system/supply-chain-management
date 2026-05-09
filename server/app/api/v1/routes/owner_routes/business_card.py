# app/api/v1/routes/business_card.py

from fastapi import APIRouter, Depends, HTTPException, status
from app.models.auth.user import User
from app.services.auth.dependancy import get_current_user
from sqlalchemy.orm import Session

from app.db.deps import get_tenant_db
from app.models.owner_models.business_card import BusinessCard
from app.schemas.owner_schemas.business_card import (
    BusinessCardCreate,
    BusinessCardUpdate,
    BusinessCardResponse,
)
from app.services.auth.dependancy import require_role

router = APIRouter(prefix="/business-cards", tags=["Business Cards"])


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
):
    cards = db.query(BusinessCard).order_by(BusinessCard.created_at.desc()).all()

    return cards


@router.get(
    "/{card_id}",
    response_model=BusinessCardResponse,
)
def get_business_card(
    card_id: int,
    db: Session = Depends(get_tenant_db),
):
    card = db.query(BusinessCard).filter(BusinessCard.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Business card not found")

    return card


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
