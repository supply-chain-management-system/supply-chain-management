from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import BaseTenant


class BusinessCard(BaseTenant):
    __tablename__ = "business_cards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    size = Column(String, nullable=False)
    tagline = Column(String, nullable=True)
    email = Column(String, nullable=False)
    description = Column(String, nullable=True)
    color = Column(String, nullable=False, default="#185FA5")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
