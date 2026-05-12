from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.db.database import Base,BaseTenant

class TeamManager(Base):
    __tablename__ = "team_managers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    
    # role can be 'factory_manager', 'warehouse_manager', 'logistics', 'supplier'
    role = Column(String, nullable=False) 
    
    # Specific card details
    shift = Column(String, default="Day")
    department = Column(String, default="Assembly")
    
    # Relationships to business structure
    business_id = Column(Integer, nullable=True)
    entity_id = Column(Integer, nullable=True) # e.g., factory_id, warehouse_id
    
    # Tracks if the user has accepted the n8n invite and logged in
    is_used = Column(Boolean, default=False)