from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Boolean, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base,BaseTenant
from app.models.auth.user import User





class Inventory(BaseTenant):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    sku_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    qty = Column(Integer, default=0)
    threshold = Column(Integer, default=10)

    warehouse_id = Column(Integer, index=True)

    warehouse_id = Column(Integer, index=True) 



class Approval(BaseTenant):
    """
    This acts as the master 'System Requests' table.
    It tracks all AI-drafted actions and human requests.
    """
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # e.g., "Restock Request", "Purchase Order"
    
    # JSONB safely stores any dynamic data from the AI or frontend
    payload = Column(JSONB, nullable=False) 
    
    # Statuses: PENDING_WHM_APPROVAL, APPROVED, REJECTED
    status = Column(String, default="PENDING_WHM_APPROVAL", index=True) 
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # CRITICAL FIX: nullable=True allows the AI Agent to create tickets without a user account!
    requester_id = Column(Integer, index=True)
    reviewer_id = Column(Integer, index=True)

    # Relationships (Make sure app.models.auth.user.User exists!)
    # requester = relationship("User", foreign_keys=[requester_id])
    # reviewer = relationship("User", foreign_keys=[reviewer_id])