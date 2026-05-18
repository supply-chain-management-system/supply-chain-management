from sqlalchemy.orm import Session
from app.models.sub_managers.factory_manager.factory_machinery import Machine
from app.schemas.sub_managers.factory_manager.factory_machine import MachineCreate, MachineUpdate


def create_machine(db: Session, machine: MachineCreate):
    db_machine = Machine(**machine.dict())
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine


def get_machines(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Machine).offset(skip).limit(limit).all()


def get_machine(db: Session, machine_id: int):
    return db.query(Machine).filter(Machine.id == machine_id).first()


def update_machine(db: Session, machine_id: int, machine: MachineUpdate):
    db_machine = get_machine(db, machine_id)
    if not db_machine:
        return None

    for key, value in machine.dict(exclude_unset=True).items():
        setattr(db_machine, key, value)

    db.commit()
    db.refresh(db_machine)
    return db_machine


def delete_machine(db: Session, machine_id: int):
    db_machine = get_machine(db, machine_id)
    if not db_machine:
        return None

    db.delete(db_machine)
    db.commit()
    return db_machine