
from typing import Optional

from pydantic import BaseModel


class production_create(BaseModel):
    product_name: str
    target_qty: int
    factory_id: int
    created_by: Optional[int] = None
    status: str = "pending"
    priority: Optional[str] = "medium"
    notes: Optional[str] = None


class productget(BaseModel):
    id: int
    product_name: str
    target_qty: int
    output_qty: int
    status: str
    factory_id: int
    scrap_qty: int
    priority: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class production_update(BaseModel):
    product_name: Optional[str] = None
    target_qty: Optional[int] = None
    output_qty: Optional[int] = None
    factory_id: Optional[int] = None
    created_by: Optional[str] = None
    status: str = "pending"
    scrap_qty: Optional[int] = None
    priority: Optional[str] = None
    notes: Optional[str] = None


class production_complete(BaseModel):
    output_qty: int
    scrap_qty: Optional[int] = 0
    notes: Optional[str] = None



