from pydantic import BaseModel,ConfigDict


class MaterialRequestCreate(BaseModel):
    product_id: int
    sender_type: str
    sender_id: int
    receiver_type: str
    receiver_id: int
    quantity: int


class MaterialRequestOut(BaseModel):
    id: int
    product_id: int
    sender_type: str
    sender_id: int
    receiver_type: str
    receiver_id: int
    quantity: int
    status: str
    model_config = ConfigDict(from_attributes=True)


   