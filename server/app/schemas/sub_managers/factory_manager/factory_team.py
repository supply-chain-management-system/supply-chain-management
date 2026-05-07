from pydantic import BaseModel
from typing import List
from enum import Enum


class worker_create(BaseModel):
    name:str
    role:str
    factory_id:int








class get_worker(BaseModel):
    id:int
    name:str
    role:str
    factory_id:int

    class config:
        from_attributes=True



class WorkerRole(str, Enum):
    worker = "worker"
    operator = "operator"
    supervisor = "supervisor"


class team_create(BaseModel):
    production_id: int
    workers: List[int]  


    






