
from typing import Optional

from pydantic import BaseModel


class production_create(BaseModel):
    product_name:str
    target_qty:int
    factory_id:int
    created_by: Optional[int] = None


class productget(BaseModel):
    id:int
    product_name:str
    target_qty:int
    output_qty:int
    status:str
    factory_id:int

    class config:
        from_attributes=True



