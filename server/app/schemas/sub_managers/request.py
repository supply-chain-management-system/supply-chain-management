from pydantic import BaseModel


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
    class Config:
        orm_mode = True