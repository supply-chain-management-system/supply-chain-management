from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from  app.db.deps import get_db

from app.schemas.sub_managers.factory_manager.factory_machine import MachineCreate, MachineResponse, MachineUpdate
from app.services.sub_managers.factory_manager.factory_machine import create_machine as  create_machine_service
from app.services.sub_managers.factory_manager.factory_machine import get_machine as  get_machine_service
from app.services.sub_managers.factory_manager.factory_machine import get_machines as get_machines_service
from app.services.sub_managers.factory_manager.factory_machine import update_machine as update_machine_service
from app.services.sub_managers.factory_manager.factory_machine import delete_machine as delete_machine_service
from app.services.sub_managers.factory_manager.
router = APIRouter(prefix="/machines", tags=["Machines"])


@router.post("/", response_model=MachineResponse)
def create_machine(machine: MachineCreate, db: Session = Depends(get_db)):
    return create_machine_service(db, machine)


@router.get("/", response_model=list[MachineResponse])
def read_machines(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return get_machines_service(db, skip, limit)


@router.get("/{machine_id}", response_model=MachineResponse)
def read_machine(machine_id: int, db: Session = Depends(get_db)):
    db_machine =get_machine_service(db, machine_id)
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return db_machine


@router.put("/{machine_id}", response_model=MachineResponse)
def update_machine(machine_id: int, machine: MachineUpdate, db: Session = Depends(get_db)):
    db_machine =update_machine_service(db, machine_id, machine)
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return db_machine


@router.delete("/{machine_id}")
def delete_machine(machine_id: int, db: Session = Depends(get_db)):
    db_machine =delete_machine_service(db, machine_id)
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return {"message": "Machine deleted successfully"}



