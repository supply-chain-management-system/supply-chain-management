from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Buseness_owners(Base):
    __tablename__ = "buseness_owners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    business_id = Column(Integer, ForeignKey("business.id"))