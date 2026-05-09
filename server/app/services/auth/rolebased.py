from app.models.auth.user import User, RoleEnum
from app.schemas.auth.company import InviteRequest
from fastapi import HTTPException
from app.models.company.company import Company
from app.db.database import SessionLocal
from sqlalchemy import text


def build_recipients(
    current_user: User, payload: InviteRequest, business_owner_email: str
):

    recipients = set()

    recipients.add(business_owner_email)

    recipients.add(current_user.email)

    recipients.add(payload.email)

    if current_user.role == RoleEnum.owner:
        return list(recipients)

    if current_user.role == RoleEnum.business_manager:

        if payload.role == RoleEnum.owner:
            raise HTTPException(
                status_code=403, detail="Business manager cannot invite owner"
            )

        recipients.add(current_user.email)

        return list(recipients)

    recipients.add(current_user.email)

    return list(recipients)


def get_owner_email(schema_name: str):
    db = SessionLocal()

    company = db.query(Company).filter(Company.schema_name == schema_name).first()

    db.close()

    return company.owner_email if company else None
