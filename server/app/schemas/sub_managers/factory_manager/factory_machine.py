from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class MachineBase(BaseModel):
    machine_code: Optional[str] = None 
    name: str
  

   
   
    status: Optional[str] = "active"
    
    purchase_date: Optional[date] = None
    expiry_date : Optional[date] = None
    last_maintenance_date: Optional[date]=None
    next_maintenance_date: Optional[date]=None

class MachineUpdate(BaseModel):
    name: Optional[str]

    status: Optional[str]
    location: Optional[str]
    

class MachineCreate(MachineBase):
    pass


class MachineResponse(MachineBase):
    id: int

    class Config:
        from_attributes  = True