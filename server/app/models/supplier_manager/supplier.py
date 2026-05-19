from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import BaseTenant

class Supplier(BaseTenant):
    __tablename__ = 'suppliers'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False) # e.g., Raw Materials, Electronics, Packaging
    contact_email = Column(String, nullable=False)
    phone = Column(String)
    lead_time_days = Column(Integer, default=7)
    rating = Column(Float, default=5.0) # 1.0 to 5.0 scale
    is_active = Column(Boolean, default=True)
    business_id = Column(Integer, default=1)
    manager_id = Column(Integer, ForeignKey("supply_managers.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
