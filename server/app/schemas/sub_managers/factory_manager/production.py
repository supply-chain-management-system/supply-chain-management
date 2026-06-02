
from typing import Optional

from pydantic import BaseModel


class production_create(BaseModel):
    product_name:str
    target_qty:int
    factory_id:int
    created_by: Optional[int] = None
    status: str = "pending"


class productget(BaseModel):
    id:int
    product_name:str
    target_qty:int
    output_qty:int
    status:str
    factory_id:int

    class config:
        from_attributes=True



from typing import Optional


class production_update(BaseModel):
    product_name: Optional[str] = None
    target_qty: Optional[int] = None
    output_qty: Optional[int] = None
    factory_id: Optional[int] = None
    created_by: Optional[str] = None
    status: str = "pending"


class production_complete(BaseModel):
    output_qty: int



