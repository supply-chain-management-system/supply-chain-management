from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.deps import get_tenant_db,get_db
from app.schemas.company.company import CompanySetupSchema
from app.services.company.company_service import setup_company
from app.services.auth.dependancy import require_role
from app.models.auth.user import User
from app.models.business_manager.business_owners import BusinessOwners
from sqlalchemy import text

router = APIRouter()


@router.post("/setup")
def create_company(
    data: CompanySetupSchema,
    current_user: User = Depends(require_role(["owner"])),
    db: Session = Depends(get_db),
):
    print(f"Received company setup request from user: {current_user.email}")
    return setup_company(db, data, current_user)


@router.post("/test-owner")
def create_owner(db: Session = Depends(get_tenant_db)):

    owner = BusinessOwners(
        name="Test User", email="test@example.com", password="123456"
    )

    current = db.execute(text("SELECT current_schema()")).scalar()

    print("CURRENT SCHEMA:", current)

    db.add(owner)

    db.commit()

    db.refresh(owner)

    rows = db.query(BusinessOwners).all()

    print(rows)

    return {"message": "Owner created", "id": owner.id}


@router.get("/test-owner")
def get_owners(db: Session = Depends(get_tenant_db)):
    owners = db.query(BusinessOwners).all()
    current = db.execute(text("SELECT current_schema()")).scalar()
    print("CURRENT SCHEMA:", current)

    return {
        "count": len(owners),
        "data": [{"id": o.id, "name": o.name, "email": o.email} for o in owners],
    }


from typing import List
from app.services.auth.dependancy import get_current_user

@router.get("/users", response_model=List[dict])
def get_company_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.company_id:
        return []
    # Query all users in the same company
    users = db.query(User).filter(User.company_id == current_user.company_id).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value if u.role else None,
            "is_active": u.is_active
        }
        for u in users
    ]

