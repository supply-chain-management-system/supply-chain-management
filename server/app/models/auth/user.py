from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    registration_number = Column(String, unique=True, index=True)
    address = Column(String)
    industry = Column(String)

    users = relationship("User", back_populates="company")


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)

    company = relationship("Company", back_populates="users")
    role = relationship("Role", back_populates="users")
