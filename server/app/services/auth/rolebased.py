from fastapi import HTTPException

from app.models.auth.user import User, RoleEnum
from app.schemas.auth.company import InviteRequest
from app.models.company.company import Company
from app.db.database import SessionLocal


def build_recipients(
    current_user: User,
    payload: InviteRequest,
    business_owner_email: str,
):

    return {
        "invite_recipient": payload.email,
        "notification_recipients": list({business_owner_email, current_user.email}),
    }


def get_owner_email(schema_name: str):

    db = SessionLocal()

    try:

        company = db.query(Company).filter(Company.schema_name == schema_name).first()

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        return company.owner_email

    finally:
        db.close()


def validate_invite_permission(
    current_user: User,
    payload: InviteRequest,
):

    current_role = current_user.role
    target_role = payload.role

    if target_role == RoleEnum.owner:

        raise HTTPException(status_code=403, detail="Cannot invite owner")

    if current_role == RoleEnum.owner:

        return True

    if current_role == RoleEnum.business_manager:

        if target_role == RoleEnum.business_manager:

            raise HTTPException(
                status_code=403,
                detail=("Business manager cannot " "invite another business manager"),
            )

        return True

    raise HTTPException(
        status_code=403,
        detail=("You do not have permission " "to invite users"),
    )
