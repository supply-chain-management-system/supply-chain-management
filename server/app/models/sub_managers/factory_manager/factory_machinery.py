from app.db.database import Base
from sqlalchemy import Integer,String,ForeignKey,Column,DateTime,event
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Machine(Base):
    __tablename__='machines'

    id=Column(Integer,primary_key=True,index=True)
    machine_code = Column(String, unique=True, nullable=False)
    name=Column(String,nullable=False)
    status = Column(String, default="active")
    purchade_date=Column(DateTime(timezone=True),server_default=func.now())
    expiry_date=Column(DateTime)
    last_maintanance_date=Column(DateTime)
    next_maintanance_date=Column(DateTime)

@event.listens_for(Machine,'after_insert')
def generate_machinecode(mappe,connection,target):
    code=f"MC-{target.id:04d}"
    connection.execute(
        Machine.__table__.update().where(Machine.id==target.id).values(machine_code=code)
    )

   
