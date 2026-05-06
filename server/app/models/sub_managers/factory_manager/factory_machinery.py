from app.db.database import Base
from sqlalchemy import Integer,String,ForeignKey,Column,DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Machine(Base):
    __tablename__='machines'

    id=Column(int,primary_key=True,index=True)
    machine_code = Column(String, unique=True, nullable=False)
    name=Column(String,nullable=False)
    status = Column(String, default="active")
    purchade_date=Column(DateTime(timezone=True),server_default=func.now())
    expiry_date=Column(DateTime)
    last_maintanance_date=Column(DateTime)
    next_maintanance_date=Column(DateTime)

   
