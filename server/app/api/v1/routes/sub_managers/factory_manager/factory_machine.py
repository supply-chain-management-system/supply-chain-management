from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from  app.api.deps import get_db
from app.schemas.sub_managers.factory_manager.factory_machine import MachineCreate, MachineResponse, MachineUpdate
from app.services.sub_managers.factory_manager.factory_machine import machine as crud

router = APIRouter(prefix="/machines", tags=["Machines"])


@router.post("/", response_model=MachineResponse)
def create_machine(machine: MachineCreate, db: Session = Depends(get_db)):
    return crud.create_machine(db, machine)


@router.get("/", response_model=list[MachineResponse])
def read_machines(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_machines(db, skip, limit)


@router.get("/{machine_id}", response_model=MachineResponse)
def read_machine(machine_id: int, db: Session = Depends(get_db)):
    db_machine = crud.get_machine(db, machine_id)
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return db_machine


@router.put("/{machine_id}", response_model=MachineResponse)
def update_machine(machine_id: int, machine: MachineUpdate, db: Session = Depends(get_db)):
    db_machine = crud.update_machine(db, machine_id, machine)
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return db_machine


@router.delete("/{machine_id}")
def delete_machine(machine_id: int, db: Session = Depends(get_db)):
    db_machine = crud.delete_machine(db, machine_id)
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return {"message": "Machine deleted successfully"}