from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class MachineBase(BaseModel):
    machine_code: Optional[str] = None 
    name: str
    status: Optional[str] = "active"
    purchase_date: Optional[date] = None
    expiry_date : Optional[date] = None
    last_maintenance_date: Optional[date] = None
    next_maintenance_date: Optional[date] = None
    
    # Advanced fields
    factory_id: Optional[int] = None
    serial_number: Optional[str] = None
    model_number: Optional[str] = None
    operating_hours: Optional[float] = 0.0
    location: Optional[str] = "Bay 1"
    efficiency: Optional[float] = 100.0
    category: Optional[str] = "General"

class MachineUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    serial_number: Optional[str] = None
    model_number: Optional[str] = None
    operating_hours: Optional[float] = None
    efficiency: Optional[float] = None
    category: Optional[str] = None
    last_maintenance_date: Optional[date] = None
    next_maintenance_date: Optional[date] = None

class MachineCreate(MachineBase):
    pass

class MachineResponse(MachineBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MachineAssignmentCreate(BaseModel):
    machine_id: int
    worker_id: int
    assignment_date: datetime
    notes: Optional[str] = None
    status: Optional[str] = "pending"

class MachineAssignmentResponse(BaseModel):
    id: int
    machine_id: int
    worker_id: int
    assignment_date: datetime
    notes: Optional[str]
    status: str
    machine_name: Optional[str] = None
    worker_name: Optional[str] = None

    class Config:
        from_attributes = True