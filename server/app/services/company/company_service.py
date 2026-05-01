from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.company.company import Company
from app.models.auth.user import User
from app.schemas.company.company import CompanySetupSchema


def setup_company(db: Session, data: CompanySetupSchema, current_user: User) -> dict:

    if current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already belong to a company.",
        )

    company = Company(
        name=data.name,
        industry=data.industry,
        mode=data.is_mode,
        address=data.address,
        registration_number=data.registration_number,
        is_active=True,
        is_verified=False,
    )
    db.add(company)
    db.flush()

    current_user.company_id = company.id
    current_user.role = "owner"

    db.commit()
    db.refresh(company)
    db.refresh(current_user)

    return {
        "message": "Company created successfully",
        "company": {
            "id": company.id,
            "name": company.name,
            "industry": company.industry,
            "is_mode": company.mode,
            "is_verified": company.is_verified,
        },
    }
