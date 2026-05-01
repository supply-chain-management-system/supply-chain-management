from sqlalchemy import  Column,Integer,String,Enum,DATETIME,ForeignKey
from db.database import Base
from sqlalchemy.sql import  func  
import enum
from auth.

from enum import Enum


class production_status(str,enum.Enum):
    PENDING='pending'
    PROGRESS='progress'
    COMPLETED='completed'



class Production(Base):
    __tablename__='production'

    id=Column(Integer,primary_key=True,index=True)
    product_name=Column(String,nullable=False)
    target_qty=Column(Integer,default=0)
    output_qty=Column(Integer,default=0)
    status=Column(Enum(production_status),default=production_status.PENDING)
    factory_id=Column(Integer,ForeignKey(''),nullable=False)
    created_by=Column(Integer,nullable=False)
    created_at=Column(DATETIME(timezone=True),onupdate=func.now)

