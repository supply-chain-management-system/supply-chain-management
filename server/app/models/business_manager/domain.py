from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base
from app.models.auth.user import User

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact_email = Column(String, nullable=False)
    lead_time_days = Column(Integer, default=0)
    rating = Column(Integer, default=0)  # Or Float if you prefer 4.5 star ratings


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    sku_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    qty = Column(Integer, default=0)
    threshold = Column(Integer, default=10)
    warehouse_id = Column(Integer, index=True) # Will link to a future Warehouse model


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # e.g., "Purchase Order", "Stock Adjustment"
    
    # JSONB is perfect for storing varying request structures
    payload = Column(JSONB, nullable=False) 
    
    # DRAFT, PENDING_APPROVAL, APPROVED, REJECTED
    status = Column(String, default="PENDING_APPROVAL", index=True) 
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Links to the public users table 
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    requester = relationship("User", foreign_keys=[requester_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])


