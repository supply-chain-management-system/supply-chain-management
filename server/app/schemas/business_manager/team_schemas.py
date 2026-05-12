from pydantic import BaseModel, EmailStr
from typing import Optional

# What React sends us
class ManagerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    shift: Optional[str] = "Day"
    department: Optional[str] = "Assembly"
    factory_id: Optional[int] = None
    # We will set 'role' automatically in the route

# What we send back to React
class ManagerOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    shift: str
    department: str
    role: str
    is_used: bool

    class Config:
        from_attributes = True

# Mock schema for Analytics
class AnalyticsOut(BaseModel):
    efficiency_score: int
    batches_completed: int
    avg_cycle_time: str
    on_time_rate: str
    reliability: str
    safety_incidents: int