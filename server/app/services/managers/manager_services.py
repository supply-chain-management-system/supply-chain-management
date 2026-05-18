from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.auth.user import User, UserAssignment, RoleEnum
from app.models.owner_models.business_card import BusinessCard
from app.schemas.owner_schemas.business_card import BusinessCardResponse

def serialize_manager(manager: User):
    return {
        "id": manager.id,
        "name": manager.name,
        "email": manager.email,
        "role": manager.role.value if manager.role else None,
        "business_id": manager.business_id,
        "is_active": manager.is_active,
        "is_verified": manager.is_verified,
        "created_at": manager.created_at,
    }

def build_card_response(
    card: BusinessCard, managers_by_business: dict[str, list[User]]
):
    card_data = BusinessCardResponse.model_validate(card).model_dump()
    card_data["managers"] = [
        serialize_manager(manager)
        for manager in managers_by_business.get(str(card.id), [])
    ]
    return card_data

def query_business_assignees(
    app_db: Session,
    business_ids: list[str],
    company_id: int,
    roles: list[RoleEnum | str] | None = None,
):
    normalized_ids = [str(business_id).strip() for business_id in business_ids]

    query = (
        app_db.query(User, UserAssignment.category_id.label("assigned_business_id"))
        .join(UserAssignment, User.id == UserAssignment.user_id)
        .filter(
            UserAssignment.company_id == company_id,
            UserAssignment.category == "business",
            func.trim(UserAssignment.category_id).in_(normalized_ids),
        )
    )

    if roles:
        query = query.filter(UserAssignment.role.in_(roles))

    return query.order_by(User.created_at.desc()).all()

def query_business_managers(app_db: Session, business_ids: list[str], company_id: int):
    return query_business_assignees(
        app_db,
        business_ids,
        company_id,
        [RoleEnum.business_manager, "business_manager"],
    )
