from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import BaseTenant

class MaterialRequest(BaseTenant):
    __tablename__ = "material_requests"

    id = Column(Integer, primary_key=True)

    product_id = Column(Integer, ForeignKey("products.id"))

    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))

    factory_id = Column(Integer, ForeignKey("factories.id"))

    requested_by = Column(Integer, ForeignKey("users.id"))

    quantity = Column(Integer)

    status = Column(String, default="pending")