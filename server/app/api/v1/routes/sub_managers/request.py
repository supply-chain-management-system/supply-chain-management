from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.models.sub_managers.request import MaterialRequest
from app.schemas.sub_managers.request import (
    MaterialRequestCreate,
    MaterialRequestOut,
)

router = APIRouter()


@router.post("/request", response_model=MaterialRequestOut)
def create_material_request(
    data: MaterialRequestCreate,
    db: Session = Depends(get_db),
):

    request = MaterialRequest(
        product_id=data.product_id,
        sender_type=data.sender_type,
        sender_id=data.sender_id,
        receiver_type=data.receiver_type,
        receiver_id=data.receiver_id,
        quantity=data.quantity,
    )

    db.add(request)
    db.commit()
    db.refresh(request)
    return request


@router.get("/request", response_model=list[MaterialRequestOut])
def get_material_requests(
    db: Session = Depends(get_db)
):
    return db.query(MaterialRequest).all()