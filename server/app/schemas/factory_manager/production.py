


from pydantic import BaseModel


class production_create(BaseModel):
    product_name:str
    target_qty:int
    factory_id:int
    created_by:int


class productget(BaseModel):
    id:int
    product_name:str
    target_qty:int
    output_qty:int
    status:str
    factory_id:int

    class config:
        from_attributes=True



