from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from app.db.deps import get_db, get_tenant_db
from app.models.sub_managers.factory_manager.factory_machinery import Machine, MachineAssignment
from app.models.sub_managers.factory_manager.teams import Worker
from app.models.sub_managers.factory_manager.production import Production
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
        
        worker = None
        if data.worker_id:
            worker = db.query(Worker).filter(Worker.id == data.worker_id).first()
            if not worker:
                raise HTTPException(status_code=404, detail="Worker not found")

        production = None
        if data.production_id:
            production = db.query(Production).filter(Production.id == data.production_id).first()
            if not production:
                raise HTTPException(status_code=404, detail="Production job not found")
            
        new_assignment = MachineAssignment(
            machine_id=data.machine_id,
            worker_id=data.worker_id,
            production_id=data.production_id,
            assignment_date=data.assignment_date,
            notes=data.notes,
            status=data.status or "pending",
            assignment_type=data.assignment_type or "maintenance"
        )
        db.add(new_assignment)
        
        # Automatically update machine status
        if data.assignment_type == "production":
            machine.status = "in-use"
        elif data.assignment_type == "maintenance":
            machine.status = "maintenance"
            
        db.commit()
        db.refresh(new_assignment)
        
        return MachineAssignmentResponse(
            id=new_assignment.id,
            machine_id=new_assignment.machine_id,
            worker_id=new_assignment.worker_id,
            production_id=new_assignment.production_id,
            assignment_date=new_assignment.assignment_date,
            notes=new_assignment.notes,
            status=new_assignment.status,
            assignment_type=new_assignment.assignment_type,
            machine_name=machine.name,
            worker_name=worker.name if worker else None,
            production_name=production.product_name if production else None
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
            worker = db.query(Worker).filter(Worker.id == assign.worker_id).first() if assign.worker_id else None
            production = db.query(Production).filter(Production.id == assign.production_id).first() if assign.production_id else None
            result.append(MachineAssignmentResponse(
                id=assign.id,
                machine_id=assign.machine_id,
                worker_id=assign.worker_id,
                production_id=assign.production_id,
                assignment_date=assign.assignment_date,
                notes=assign.notes,
                status=assign.status,
                assignment_type=assign.assignment_type or "maintenance",
                machine_name=machine.name if machine else "Unknown Machine",
                worker_name=worker.name if worker else None,
                production_name=production.product_name if production else None
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



