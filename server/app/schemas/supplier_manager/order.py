from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderBase(BaseModel):
    supplier_id: int
    total_amount: float
    status: str = "pending"
    expected_delivery: Optional[datetime] = None
    business_id: Optional[int] = 1

class OrderCreate(OrderBase):
    pass

class OrderOut(OrderBase):
    id: int
    order_date: datetime

    class Config:
        from_attributes = True
