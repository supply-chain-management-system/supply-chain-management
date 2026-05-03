from sqlalchemy import Column,Integer,String,ForeignKey,Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum

class Worker(Base):
    __tablename__='workers'

    id=Column(Integer,primary_key=True,index=True)
    name=Column(String,nullable=False)
    role=Column(String,nullable=False)
    factory_id=Column(Integer,ForeignKey('factories.id'))
    
    factory=relationship('Factory')


class  worker_role(str,enum.Enum):
     Worker='worker'
     Operator='operator' 
     Supervisor='supervisor'



class Productionteam(Base):
    __tablename__='production_team'

    id=Column(Integer,primary_key=True,index=True)
    team_name=Column(String,nullable=False)
    production_id=Column(Integer,ForeignKey('production.id'))
    worker_id=Column(Integer,ForeignKey('workers.id'))
    role=Column(Enum(worker_role),default=worker_role.Worker)
    production=relationship('Production')
    worker=relationship('Worker')

