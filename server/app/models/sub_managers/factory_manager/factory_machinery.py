from app.db.database import BaseTenant
from sqlalchemy import Integer,String,ForeignKey,Column,DateTime,Float,event
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

class Machine(BaseTenant):
    __tablename__='machines'
    __table_args__ = {"schema": None}

    id=Column(Integer,primary_key=True,index=True)
    machine_code = Column(String, unique=True, nullable=True)
    name=Column(String,nullable=False)
    status = Column(String, default="active")
    purchase_date=Column(DateTime(timezone=True),server_default=func.now())
    expiry_date=Column(DateTime)

    last_maintenance_date = Column(DateTime)
    next_maintenance_date = Column(DateTime)

    # Advanced Fields
    factory_id = Column(Integer, ForeignKey('factories.id'), nullable=True)
    serial_number = Column(String, nullable=True)
    model_number = Column(String, nullable=True)
    operating_hours = Column(Float, default=0.0)
    location = Column(String, default="Bay 1")
    efficiency = Column(Float, default=100.0)
    category = Column(String, default="General")

    assignments = relationship("MachineAssignment", back_populates="machine", cascade="all, delete-orphan")


class MachineAssignment(BaseTenant):
    __tablename__ = "machine_assignments"
    __table_args__ = {"schema": None}

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    assignment_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    notes = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, in-progress, completed

    machine = relationship("Machine", back_populates="assignments")
    worker = relationship("Worker")


@event.listens_for(Machine,'after_insert')
def generate_machinecode(mappe,connection,target):
    code=f"MC-{target.id:04d}"
    connection.execute(
        Machine.__table__.update().where(Machine.id==target.id).values(machine_code=code)
    )

   
