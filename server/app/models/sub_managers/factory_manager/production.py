from sqlalchemy import  Column,Integer,String,Enum,ForeignKey,DateTime,Text
from app.db.database import BaseTenant

from sqlalchemy.sql import  func  
import enum
from sqlalchemy.orm import relationship




class Factory(BaseTenant):
    __tablename__='factories'   
    __table_args__ = {"schema": None} 

    id=Column(Integer,primary_key=True,index=True)
    name=Column(String,nullable=False)
    company_id = Column(Integer)
    

    # company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    productions=relationship('Production',back_populates='factory')



class Production_status(str,enum.Enum):
    PENDING='pending'
    PROGRESS='progress'
    COMPLETED='completed'



class Production(BaseTenant):
    
    __tablename__='production'


    id=Column(Integer,primary_key=True,index=True)
    product_name=Column(String,nullable=False)
    target_qty=Column(Integer,default=0)
    output_qty=Column(Integer,default=0)
    status=Column(Enum(Production_status),default=Production_status.PENDING)
    factory_id=Column(Integer,ForeignKey('factories.id'),nullable=False)
    created_by=Column(Integer)
    created_at=Column(DateTime(timezone=True),server_default=func.now())
    scrap_qty=Column(Integer,default=0)
    priority=Column(String,default="medium")
    notes=Column(Text,nullable=True)

    factory=relationship('Factory',back_populates='productions')
    material_transactions = relationship("Factory_MaterialTransaction", back_populates="production", cascade="all, delete")
    

    doc=Column(Text,nullable=True)




# class producion_documentation(BaseTenant):
#     __tablename__='production_documentation'
#     id=Column(Integer,primary_key=True,index=True)
#     production_id=Column(Integer,ForeignKey('production.id'),nullable=False)
#     document_url=Column(String,nullable=False)