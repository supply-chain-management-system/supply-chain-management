from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from models import Buseness_owners
from schemas import OwnerCreate
from core import hash_password

router = APIRouter()

@router.post("/add-owner")
def add_business_owner(owner: OwnerCreate, db: Session = Depends(get_db)):

    existing_user = db.query(Buseness_owners).filter(Buseness_owners.email == owner.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_owner = Buseness_owners(
        name=owner.name,
        email=owner.email,
        password=hash_password(owner.password),
        type="OWNER",
        business_id=owner.business_id
    )

    db.add(new_owner)
    db.commit()
    db.refresh(new_owner)

    return {
        "message": "Business owner created successfully",
        "user_id": new_owner.id
    }