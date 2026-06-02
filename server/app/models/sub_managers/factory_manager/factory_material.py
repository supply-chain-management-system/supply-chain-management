from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.database import BaseTenant

class TransactionType(str, PyEnum):
    RESTOCK = "RESTOCK"
    PRODUCTION_DISPATCH = "PRODUCTION_DISPATCH"
class Factory_Material(BaseTenant):
    __tablename__ = "factory_materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    current_stock = Column(Float, default=0.0)
    unit = Column(String, nullable=False)
    low_stock_threshold = Column(Float, default=10.0)

    last_restocked = Column(DateTime, nullable=True)

    transactions = relationship(
        "Factory_MaterialTransaction",
        back_populates="material",
        cascade="all, delete"
    )


class Factory_MaterialTransaction(BaseTenant):
    __tablename__ = "factory_material_transactions"

    id = Column(Integer, primary_key=True, index=True)

    material_id = Column(Integer, ForeignKey("factory_materials.id"), nullable=False)

    transaction_type = Column(
        Enum(TransactionType, name="transaction_type_enum"),
        nullable=False
    )

    quantity = Column(Float, nullable=False)

    production_id = Column(Integer, ForeignKey("production.id"), nullable=True)

    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)

    material = relationship("Factory_Material", back_populates="transactions")
    production = relationship("Production", back_populates="material_transactions")