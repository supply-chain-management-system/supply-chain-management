from pydantic import BaseModel, ConfigDict
from typing import Optional

class WarehouseCreate(BaseModel):
    name: str
    location: Optional[str] = None

class WarehouseOut(BaseModel):
    id: int
    name: str
    location: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class RackCreate(BaseModel):
    name: str
    warehouse_id: int

class RackOut(BaseModel):
    id: int
    name: str
    warehouse_id: int
    model_config = ConfigDict(from_attributes=True)

class ProductCreate(BaseModel):
    name: str
    sku: str

class ProductOut(BaseModel):
    id: int
    name: str
    sku: str
    model_config = ConfigDict(from_attributes=True)

class InventoryUpdate(BaseModel):
    product_id: int
    rack_id: int
    quantity: int
    type: str 

class InventoryOut(BaseModel):
    id: int
    product_id: int
    rack_id: int
    quantity: int
    model_config = ConfigDict(from_attributes=True)

class FactoryOut(BaseModel):
    id: int
    name: str
    company_id: int
    company_name: Optional[str] = None 

    class Config:
        from_attributes = True