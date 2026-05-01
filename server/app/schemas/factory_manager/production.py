


from pydantic import BaseModel


class production_create(BaseModel):
    product_name=str
    target_qty=int
    factory_id=int
    created_by=int
    