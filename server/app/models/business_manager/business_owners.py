from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base ,BaseTenant

from sqlalchemy.orm import relationship
from app.db.database import BaseTenant



class BusinessOwners(BaseTenant):
    __tablename__ = "business_owners"
    __table_args__ = {"schema": None}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    business_id = Column(Integer, ForeignKey("companies.id"))