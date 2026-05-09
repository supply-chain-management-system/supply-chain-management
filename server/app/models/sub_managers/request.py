from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import BaseTenant

class MaterialRequest(BaseTenant):
    __tablename__ = "material_requests"

    id = Column(Integer, primary_key=True)

    product_id = Column(Integer, ForeignKey("products.id"))

    sender_type = Column(String)

    sender_id = Column(Integer)

    receiver_type = Column(String)

    receiver_id = Column(Integer)

    quantity = Column(Integer)

    status = Column(String, default="pending")