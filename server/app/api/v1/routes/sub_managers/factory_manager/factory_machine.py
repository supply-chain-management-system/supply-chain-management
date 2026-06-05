from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from app.db.deps import get_db, get_tenant_db
from app.models.sub_managers.factory_manager.factory_machinery import Machine, MachineAssignment
from app.models.sub_managers.factory_manager.teams import Worker
from app.schemas.sub_managers.factory_manager.factory_machine import (
    MachineCreate, MachineResponse, MachineUpdate,
    MachineAssignmentCreate, MachineAssignmentResponse
)
from app.services.sub_managers.factory_manager.factory_machine import (
    create_machine as create_machine_service,
    get_machine as get_machine_service,
    get_machines as get_machines_service,
    update_machine as update_machine_service,
    delete_machine as delete_machine_service,
)

router = APIRouter(prefix="/machines", tags=["Machines"])


@router.post("/", response_model=MachineResponse)
def create_machine(machine: MachineCreate, db: Session = Depends(get_tenant_db)):
    return create_machine_service(db, machine)


@router.get("/", response_model=list[MachineResponse])
def read_machines(skip: int = 0, limit: int = 100, db: Session = Depends(get_tenant_db)):
    return get_machines_service(db, skip, limit)


@router.post("/assignments", response_model=MachineAssignmentResponse)
def create_assignment(data: MachineAssignmentCreate, db: Session = Depends(get_tenant_db)):
    try:
        machine = db.query(Machine).filter(Machine.id == data.machine_id).first()
        if not machine:
            raise HTTPException(status_code=404, detail="Machine not found")
        worker = db.query(Worker).filter(Worker.id == data.worker_id).first()
        if not worker:
            raise HTTPException(status_code=404, detail="Worker not found")
            
        new_assignment = MachineAssignment(
            machine_id=data.machine_id,
            worker_id=data.worker_id,
            assignment_date=data.assignment_date,
            notes=data.notes,
            status=data.status or "pending"
        )
        db.add(new_assignment)
        db.commit()
        db.refresh(new_assignment)
        
        return MachineAssignmentResponse(
            id=new_assignment.id,
            machine_id=new_assignment.machine_id,
            worker_id=new_assignment.worker_id,
            assignment_date=new_assignment.assignment_date,
            notes=new_assignment.notes,
            status=new_assignment.status,
            machine_name=machine.name,
            worker_name=worker.name
        )
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/assignments", response_model=List[MachineAssignmentResponse])
def get_assignments(db: Session = Depends(get_tenant_db)):
    try:
        assignments = db.query(MachineAssignment).all()
        result = []
        for assign in assignments:
            machine = db.query(Machine).filter(Machine.id == assign.machine_id).first()
            worker = db.query(Worker).filter(Worker.id == assign.worker_id).first()
            result.append(MachineAssignmentResponse(
                id=assign.id,
                machine_id=assign.machine_id,
                worker_id=assign.worker_id,
                assignment_date=assign.assignment_date,
                notes=assign.notes,
                status=assign.status,
                machine_name=machine.name if machine else "Unknown Machine",
                worker_name=worker.name if worker else "Unknown Worker"
            ))
        return result
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{machine_id}", response_model=MachineResponse)
def read_machine(machine_id: int, db: Session = Depends(get_tenant_db)):
    db_machine = get_machine_service(db, machine_id)
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return db_machine


@router.put("/{machine_id}", response_model=MachineResponse)
def update_machine(machine_id: int, machine: MachineUpdate, db: Session = Depends(get_tenant_db)):
    db_machine = update_machine_service(db, machine_id, machine)
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return db_machine


@router.delete("/{machine_id}")
def delete_machine(machine_id: int, db: Session = Depends(get_tenant_db)):
    db_machine = delete_machine_service(db, machine_id)
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return {"message": "Machine deleted successfully"}



