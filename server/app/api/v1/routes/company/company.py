from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.deps import get_tenant_db
from app.schemas.company.company import CompanySetupSchema
from app.services.company.company_service import setup_company
from app.services.auth.dependancy import require_role
from app.models.auth.user import User
from app.models.business_manager.business_owners import BusinessOwners

router = APIRouter()


@router.post("/setup")
def create_company(
    data: CompanySetupSchema,
    current_user: User = Depends(require_role(["owner"])),
    db: Session = Depends(get_tenant_db),
):
    print(f"Received company setup request from user: {current_user.email}")
    return setup_company(db, data, current_user)


@router.post("/test-owner")
def create_owner(db: Session = Depends(get_tenant_db)):
    owner = BusinessOwners(
        name="Test User", email="test@example.com", password="123456"
    )

    db.add(owner)
    db.commit()
    db.refresh(owner)

    return {"message": "Owner created", "id": owner.id}


@router.get("/test-owner")
def get_owners(db: Session = Depends(get_tenant_db)):
    owners = db.query(BusinessOwners).all()

    return {
        "count": len(owners),
        "data": [{"id": o.id, "name": o.name, "email": o.email} for o in owners],
    }
