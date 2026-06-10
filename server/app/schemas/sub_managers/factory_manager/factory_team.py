from pydantic import BaseModel
from typing import List
from enum import Enum
from typing import Optional

class WorkerRole(str, Enum):
    worker = "worker"
    operator = "operator"
    supervisor = "supervisor"

class worker_create(BaseModel):
    name: str
    role: WorkerRole
    factory_id: int
    email: Optional[str] = None
    phone: Optional[str] = None
    hourly_rate: Optional[float] = 15.0


class get_worker(BaseModel):
    id: int
    name: str
    role: str
    factory_id: int
    email: Optional[str]
    phone: Optional[str]
    hourly_rate: float

    class Config:
        from_attributes = True



class team_create(BaseModel):
    production_id: int
    workers: List[int]  

class worker_update(BaseModel):
    name: Optional[str] = None
    role: Optional[WorkerRole] = None
    factory_id: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    hourly_rate: Optional[float] = None


    






