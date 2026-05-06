from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class MachineBase(BaseModel):
    machine_code: str
    name: str
    type: str
   
   
    status: Optional[str] = "active"
    
    purchase_date: Optional[date] = None
    expiry_date : Optional[date] = None
    last_maintenance_date: Optional[date] = None
    next_maintenance_date: Optional[date] = None


class MachineCreate(MachineBase):
    pass


class MachineResponse(MachineBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True