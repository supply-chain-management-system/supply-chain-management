from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.company.company import Company
from app.models.auth.user import User, RoleEnum
from app.schemas.company.company import CompanySetupSchema
from app.services.company.schema_service import (
    generate_unique_schema,
    generate_public_id,
)
from app.db.database import Base
from sqlalchemy import text
from app.db.database import BaseTenant


def setup_company(db: Session, data: CompanySetupSchema, current_user: User) -> dict:

    if current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already belong to a company.",
        )

    schema_name = generate_unique_schema(db, data.name)
    public_id = generate_public_id()
    company = Company(
        name=data.name,
        industry=data.industry,
        mode=data.is_mode,
        address=data.address,
        registration_number=data.registration_number,
        schema_name=schema_name,
        public_id=public_id,
        is_active=True,
        is_verified=True,
    )
    db.add(company)
    db.flush()
    engine = db.get_bind()

    with engine.begin() as conn:
        conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'))

    BaseTenant.metadata.schema = schema_name
    from app.models.business_manager.business_owners import BusinessOwners

    BaseTenant.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        conn.execute(text('SET search_path TO public'))
    current_user.company_id = company.id
    current_user.role = RoleEnum.owner
    current_user.is_approved_company = True
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
