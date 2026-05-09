from pydantic import BaseModel
from typing import Optional

class WarehouseCreate(BaseModel):
    name: str
    location: Optional[str] = None


class WarehouseOut(BaseModel):
    id: int
    name: str
    location: Optional[str]

    class Config:
        orm_mode = True


class RackCreate(BaseModel):
    name: str
    warehouse_id: int


class RackOut(BaseModel):
    id: int
    name: str
    warehouse_id: int

    class Config:
        orm_mode = True

class ProductCreate(BaseModel):
    name: str
    sku: str


class ProductOut(BaseModel):
    id: int
    name: str
    sku: str

    class Config:
        orm_mode = True


class InventoryUpdate(BaseModel):
    product_id: int
    rack_id: int
    quantity: int
    type: str   # "IN" or "OUT"

class InventoryOut(BaseModel):
    id: int
    product_id: int
    rack_id: int
    quantity: int

    class Config:
        orm_mode = True