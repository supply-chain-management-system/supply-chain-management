from sqlalchemy import Column,Integer,String,ForeignKey,Enum
from sqlalchemy.orm import relationship
from app.db.database import BaseTenant
import enum





class  worker_role(str,enum.Enum):
     Worker='worker'
     Operator='operator' 
     Supervisor='supervisor'

class worker_status(str,enum.Enum):
    Active='active'
    Leave='leave'

class Worker(BaseTenant):
    __tablename__='workers'
    __table_args__ = {"schema": None}

    id=Column(Integer,primary_key=True,index=True)
    name=Column(String,nullable=False)
    role=Column(Enum(worker_role),default=worker_role.Worker)
    status=Column(Enum(worker_status),default=worker_status.Active)
    factory_id=Column(Integer,ForeignKey('factories.id'))
    
    factory=relationship('Factory')





class Productionteam(BaseTenant):
    __tablename__='production_team'
    __table_args__ = {"schema": None}

    id=Column(Integer,primary_key=True,index=True)
    team_name=Column(String,nullable=True)
    production_id=Column(Integer,ForeignKey('production.id'))
    worker_id=Column(Integer,ForeignKey('workers.id'))
    role=Column(Enum(worker_role),default=worker_role.Worker)
    production=relationship('Production')
    worker=relationship('Worker')

