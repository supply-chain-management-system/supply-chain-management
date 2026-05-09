from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import BaseTenant



class Warehouse(BaseTenant):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)

    racks = relationship("Rack", back_populates="warehouse")


class Rack(BaseTenant):
    __tablename__ = "racks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))

    warehouse = relationship("Warehouse", back_populates="racks")


class Product(BaseTenant):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, nullable=False)



class Inventory_ware(BaseTenant):
    __tablename__ = "inventory_ware"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"))
    rack_id = Column(Integer, ForeignKey("racks.id"))

    quantity = Column(Integer, default=0)