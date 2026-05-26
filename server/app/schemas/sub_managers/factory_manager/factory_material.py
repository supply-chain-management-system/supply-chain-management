from enum import Enum
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class TransactionType(str, Enum):
    RESTOCK = "RESTOCK"
    PRODUCTION_DISPATCH = "PRODUCTION_DISPATCH"

class FactoryMaterialBase(BaseModel):
    name: str
    unit: str
    low_stock_threshold: float = 10.0
    current_stock: float = 0.0

class FactoryMaterialCreate(FactoryMaterialBase):
    pass

class FactoryMaterialUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    low_stock_threshold: Optional[float] = None
    current_stock: Optional[float] = None

class FactoryMaterialTransactionBase(BaseModel):
    transaction_type: TransactionType
    quantity: float
    production_id: Optional[int] = None

class FactoryMaterialTransactionCreate(FactoryMaterialTransactionBase):
    pass

class FactoryMaterialTransactionResponse(FactoryMaterialTransactionBase):
    id: int
    material_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class FactoryMaterialResponse(FactoryMaterialBase):
    id: int
    last_restocked: Optional[datetime] = None

    class Config:
        from_attributes = True

class FactoryMaterialDetailResponse(FactoryMaterialResponse):
    transactions: List[FactoryMaterialTransactionResponse] = []

    class Config:
        from_attributes = True
