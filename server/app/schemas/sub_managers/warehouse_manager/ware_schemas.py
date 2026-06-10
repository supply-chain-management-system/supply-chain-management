from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class WarehouseCreate(BaseModel):
    name: str
    location: Optional[str] = None
    capacity: Optional[float] = 10000.0
    contact_number: Optional[str] = None
    status: Optional[str] = "active"

class WarehouseOut(BaseModel):
    id: int
    name: str
    location: Optional[str]
    capacity: Optional[float]
    contact_number: Optional[str]
    status: Optional[str]
    model_config = ConfigDict(from_attributes=True)

class RackCreate(BaseModel):
    name: str
    warehouse_id: int
    zone: Optional[str] = None
    max_weight: Optional[float] = 5000.0
    rows: Optional[int] = 5

class RackOut(BaseModel):
    id: int
    name: str
    warehouse_id: int
    zone: Optional[str]
    max_weight: Optional[float]
    rows: Optional[int]
    model_config = ConfigDict(from_attributes=True)

class ProductCreate(BaseModel):
    name: str
    sku: str
    type: Optional[str] = "finished_good"
    cost: Optional[float] = 0.0
    price: Optional[float] = 0.0
    weight: Optional[float] = 1.0
    min_stock_level: Optional[int] = 10

class ProductOut(BaseModel):
    id: int
    name: str
    sku: str
    type: str
    cost: float
    price: float
    weight: Optional[float]
    min_stock_level: int
    model_config = ConfigDict(from_attributes=True)

class BillOfMaterialsCreate(BaseModel):
    finished_product_id: int
    material_product_id: int
    quantity_required: float

class BillOfMaterialsOut(BaseModel):
    id: int
    finished_product_id: int
    material_product_id: int
    quantity_required: float
    model_config = ConfigDict(from_attributes=True)

class InventoryUpdate(BaseModel):
    product_id: int
    rack_id: int
    quantity: int
    type: str 
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    status: Optional[str] = "available"

class InventoryOut(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    rack_id: int
    rack_name: Optional[str] = None
    quantity: int
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    status: str
    model_config = ConfigDict(from_attributes=True)

class FactoryOut(BaseModel):
    id: int
    name: str
    company_id: int
    company_name: Optional[str] = None 

    class Config:
        from_attributes = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    type: Optional[str] = None
    cost: Optional[float] = None
    price: Optional[float] = None
    weight: Optional[float] = None
    min_stock_level: Optional[int] = None

class RackUpdate(BaseModel):
    name: Optional[str] = None
    warehouse_id: Optional[int] = None
    zone: Optional[str] = None
    max_weight: Optional[float] = None
    rows: Optional[int] = None

class InventoryDirectUpdate(BaseModel):
    quantity: Optional[int] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    status: Optional[str] = None