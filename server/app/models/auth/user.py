from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum
from sqlalchemy import DateTime
from datetime import datetime
from app.models.company.company import Company
from sqlalchemy.sql import func


class RoleEnum(str, enum.Enum):
    admin = "admin"
    owner = "owner"
    business_manager = "business_manager"
    warehouse_manager = "warehouse_manager"
    factory_manager = "factory_manager"
    logistics_manager = "logistics_manager"
    co_manager = "co_manager"
    supply_manager = "supply_manager"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)
    otp_code = Column(String, nullable=True)
    otp_expiry = Column(DateTime, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    company = relationship("Company", back_populates="users")
    role = Column(Enum(RoleEnum))
    business_id = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_approved_company = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(String, primary_key=True)

    invited_email = Column(String, nullable=False, index=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    business_id = Column(String, nullable=True)

    role = Column(Enum(RoleEnum), nullable=False)

    category = Column(String, nullable=False)

    category_id = Column(String, nullable=False)

    invited_by = Column(String, nullable=False)

    owner_email = Column(String, nullable=False)

    accepted = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company")
