from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func
from app.db.database import DATABASE_URL
from app.models.auth.user import Invitation, RoleEnum

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

query = db.query(Invitation).filter(
    Invitation.company_id == 1,
    Invitation.category == "business",
    func.trim(Invitation.category_id) == str(2),
    Invitation.accepted == False,
    Invitation.role.in_(
        [
            RoleEnum.business_manager,
            RoleEnum.factory_manager,
            RoleEnum.warehouse_manager,
            RoleEnum.logistics_manager,
            RoleEnum.co_manager,
            RoleEnum.supply_manager,
            "business_manager",
            "factory_manager",
            "warehouse_manager",
            "logistics_manager",
            "co_manager",
            "supply_manager",
        ]
    )
).order_by(Invitation.created_at.desc())

print(query)
