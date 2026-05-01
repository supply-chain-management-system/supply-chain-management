from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum
from sqlalchemy import DateTime
from datetime import datetime


class RoleEnum(str, enum.Enum):
    admin = "admin"
    owner = "owner"
    business_manager = "business_manager"
    warehouse_manager = "warehouse_manager"
    factory_manager = "factory_manager"
    logistics_manager = "logistics_manager"
    co_manager = "co_manager"


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)

    company = relationship("Company", back_populates="users")
    role = relationship("Role", back_populates="users")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_company_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
