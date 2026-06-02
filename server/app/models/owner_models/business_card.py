from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import BaseTenant


class BusinessCard(BaseTenant):
    __tablename__ = "business_cards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    size = Column(String, nullable=False)
    tagline = Column(String, nullable=True)
    email = Column(String, nullable=False)
    description = Column(String, nullable=True)
    color = Column(String, nullable=False, default="#185FA5")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ── Reverse relationships to all manager types ──────────
    factory_managers = relationship(
        "FactoryManager",
        foreign_keys="[FactoryManager.business_card_id]",
        back_populates="business_card",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    warehouse_managers = relationship(
        "WarehouseManager",
        foreign_keys="[WarehouseManager.business_card_id]",
        back_populates="business_card",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    logistics_managers = relationship(
        "LogisticsManager",
        foreign_keys="[LogisticsManager.business_card_id]",
        back_populates="business_card",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    supply_managers = relationship(
        "SupplyManager",
        foreign_keys="[SupplyManager.business_card_id]",
        back_populates="business_card",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
