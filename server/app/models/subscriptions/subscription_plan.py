from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String
from sqlalchemy.sql import func

from app.db.database import Base


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    audience = Column(String(255), nullable=False)
    price_label = Column(String(50), nullable=True)
    monthly_price = Column(Integer, nullable=True)
    yearly_price = Column(Integer, nullable=True)
    period = Column(String(50), nullable=True)
    billing_note = Column(String(255), nullable=True)
    icon_key = Column(String(50), nullable=False)
    cta = Column(String(100), nullable=False)
    href = Column(String(255), nullable=False)
    is_popular = Column(Boolean, nullable=False, default=False)
    display_order = Column(Integer, nullable=False, default=0)
    features = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
