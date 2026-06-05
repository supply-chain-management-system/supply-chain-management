from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship

from app.db.database import BaseTenant,Base



class Warehouse(BaseTenant):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    capacity = Column(Float, default=10000.0)
    contact_number = Column(String, nullable=True)
    status = Column(String, default="active")

    racks = relationship("Rack", back_populates="warehouse")


class Rack(BaseTenant):
    __tablename__ = "racks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    zone = Column(String, nullable=True)
    max_weight = Column(Float, default=5000.0)
    rows = Column(Integer, default=5)

    warehouse = relationship("Warehouse", back_populates="racks")


class Product(BaseTenant):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, nullable=False)
    type = Column(String, default="finished_good", server_default="finished_good", nullable=False)
    cost = Column(Float, default=0.0)
    price = Column(Float, default=0.0)
    weight = Column(Float, default=1.0)
    min_stock_level = Column(Integer, default=10)



class Inventory_ware(BaseTenant):
    __tablename__ = "inventory_ware"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"))
    rack_id = Column(Integer, ForeignKey("racks.id"))

    quantity = Column(Integer, default=0)
    batch_number = Column(String, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    status = Column(String, default="available")


class BillOfMaterials(BaseTenant):
    __tablename__ = "bill_of_materials"

    id = Column(Integer, primary_key=True, index=True)
    finished_product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    material_product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity_required = Column(Float, default=1.0)
