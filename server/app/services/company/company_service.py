from app.services.auth.dependancy import get_current_user
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from sqlalchemy import text

from app.models.company.company import Company
from app.models.auth.user import User, RoleEnum

from app.schemas.company.company import CompanySetupSchema

from app.services.company.schema_service import (
    generate_unique_schema,
    generate_public_id,
)
from fastapi import Depends
from app.db.database import BaseTenant


def setup_company(
    db: Session,
    data: CompanySetupSchema,
    current_user: User = Depends(get_current_user),
) -> dict:

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
        owner_email=current_user.email,
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
    from app.models.business_manager.business_owners import BusinessOwners
    from app.models.owner_models.business_card import BusinessCard

    for table in BaseTenant.metadata.tables.values():
        table.schema = schema_name

    BaseTenant.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        conn.execute(text("SET search_path TO public"))
    print(current_user.company_id)

    db_user = db.query(User).filter(User.id == current_user.id).first()
    print(db_user.email)
    db_user.company_id = company.id
    db_user.role = RoleEnum.owner
    db_user.is_approved_company = True

    db.commit()

    db.refresh(company)

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
