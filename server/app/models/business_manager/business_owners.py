from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base # (Using the fixed import from earlier)

from sqlalchemy.orm import relationship
from app.db.database import BaseTenant



class BusinessOwners(BaseTenant):
    __tablename__ = "business_owners"
    __table_args__ = {"schema": None}
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    business_id = Column(Integer, ForeignKey("companies.id"))
