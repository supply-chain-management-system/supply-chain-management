from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.database import Base


class CompanyMode(str, enum.Enum):
    personal = "personal"
    team = "team"
    enterprise = "enterprise"


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False, index=True)
    industry = Column(String, nullable=True)
    company_size = Column(String, nullable=True)

    mode = Column(Enum(CompanyMode), nullable=False)
    schema_name = Column(String, unique=True, nullable=False, index=True)
    public_id = Column(String(10), unique=True, index=True, nullable=False)
    registration_number = Column(String, unique=True, index=True, nullable=True)
    website = Column(String, nullable=True)
    address = Column(String, nullable=True)
    country = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_profile_complete = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="company")
