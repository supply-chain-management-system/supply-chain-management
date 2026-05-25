from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.database import BaseTenant

class RawMaterialInventory(BaseTenant):
    __tablename__ = "raw_material_inventory"

    id = Column(Integer, primary_key=True, index=True)
    material_name = Column(String, nullable=False)
    category = Column(String, nullable=False) # e.g., Metal, Plastic, Fabric
    quantity = Column(Float, default=0.0)
    unit = Column(String, default="kg") # kg, units, liters, etc.
    min_threshold = Column(Float, default=10.0) # Reorder point
    
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    business_id = Column(Integer, default=1)

    supplier = relationship("Supplier")
