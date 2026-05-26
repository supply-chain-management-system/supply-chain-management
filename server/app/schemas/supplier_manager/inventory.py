from pydantic import BaseModel
from typing import Optional

class InventoryBase(BaseModel):
    material_name: str
    category: str
    quantity: float
    unit: str
    min_threshold: float
    supplier_id: int
    business_id: Optional[int] = 1

class InventoryCreate(InventoryBase):
    pass

class InventoryOut(InventoryBase):
    id: int

    class Config:
        from_attributes = True
