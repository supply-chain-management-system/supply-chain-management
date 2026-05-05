from sqlalchemy import  Column,Integer,String,Enum,ForeignKey,DateTime

from app.db.database import Base
from sqlalchemy.sql import  func  
import enum
from sqlalchemy.orm import relationship




class Factory(Base):
    __tablename__='factories'    

    id=Column(Integer,primary_key=True,index=True)
    name=Column(String,nullable=False)
    company_id=Column(Integer,ForeignKey('companies.id'))

    company=relationship('Company') 
    productions=relationship('Production',back_populates='factory')



class Production_status(str,enum.Enum):
    PENDING='pending'
    PROGRESS='progress'
    COMPLETED='completed'



class Production(Base):
    
    __tablename__='production'

    id=Column(Integer,primary_key=True,index=True)
    product_name=Column(String,nullable=False)
    target_qty=Column(Integer,default=0)
    output_qty=Column(Integer,default=0)
    status=Column(Enum(Production_status),default=Production_status.PENDING)
    factory_id=Column(Integer,ForeignKey('factories.id'),nullable=False)
    created_by=Column(Integer,ForeignKey('users.id'),nullable=False)
    created_at=Column(DateTime(timezone=True),server_default=func.now())

    factory=relationship('Factory',back_populates='productions')
    creator = relationship("User")


