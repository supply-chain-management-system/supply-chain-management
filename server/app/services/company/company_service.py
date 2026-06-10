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
import uuid


def generate_unique_company_name(db: Session, base_name: str) -> str:
    name = base_name
    while True:
        existing = db.query(Company).filter(Company.name == name).first()
        if not existing:
            return name
        unique_id = uuid.uuid4().hex[:5]
        name = f"{base_name}_{unique_id}"


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
    
    unique_company_name = generate_unique_company_name(db, data.name)

    company = Company(
        name=unique_company_name,
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

    tenant_engine = engine.execution_options(schema_translate_map={None: schema_name})
    BaseTenant.metadata.create_all(bind=tenant_engine)

    with engine.begin() as conn:
        conn.execute(text("SET search_path TO public"))
    print(current_user.company_id)

    db_user = db.query(User).filter(User.id == current_user.id).first()
    print(db_user.email)
    db_user.company_id = company.id
    db_user.role = RoleEnum.owner
    db_user.is_approved_company = True

    # Create default free subscription
    from app.models.subscriptions.user_subscription import CompanySubscription
    company_sub = CompanySubscription(
        company_id=company.id,
        plan_slug="free",
        status="ACTIVE",
        billing_cycle="monthly",
    )
    db.add(company_sub)

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
