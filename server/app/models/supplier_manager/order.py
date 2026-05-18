from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.database import BaseTenant
import datetime
import enum

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    RECEIVED = "received"
    CANCELLED = "cancelled"

class PurchaseOrder(BaseTenant):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    total_amount = Column(Float, nullable=False)
    status = Column(String, default=OrderStatus.PENDING)
    
    order_date = Column(DateTime, default=datetime.datetime.utcnow)
    expected_delivery = Column(DateTime, nullable=True)
    
    business_id = Column(Integer, default=1)

    supplier = relationship("Supplier")
