from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base, BaseTenant


# ══════════════════════════════════════════════════════════
#  FACTORY MANAGER — Dedicated model
#  Connected to BusinessCard via business_card_id FK
# ══════════════════════════════════════════════════════════
class FactoryManager(BaseTenant):
    __tablename__ = "factory_managers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)

    shift = Column(String, default="Day")               # Day | Night | Swing
    department = Column(String, default="Assembly")      # Assembly | Quality Control | Logistics

    business_id = Column(Integer, nullable=True)
    factory_id = Column(Integer, nullable=True)          # FK to factory entity
    business_card_id = Column(Integer, ForeignKey("business_cards.id", ondelete="CASCADE"), nullable=True)

    # Card specific fields (like BusinessCard)
    size = Column(String, default="Standard")
    tagline = Column(String, nullable=True)
    description = Column(String, nullable=True)
    color = Column(String, default="#185FA5")

    role = Column(String, default="factory_manager")     # factory_manager | factory_manager_member
    is_used = Column(Boolean, default=False)             # Tracks if user accepted invite
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to BusinessCard
    business_card = relationship("BusinessCard", foreign_keys=[business_card_id], lazy="joined")


# ══════════════════════════════════════════════════════════
#  WAREHOUSE MANAGER — Dedicated model
#  Connected to BusinessCard via business_card_id FK
# ══════════════════════════════════════════════════════════
class WarehouseManager(BaseTenant):
    __tablename__ = "warehouse_managers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)

    shift = Column(String, default="Day")                # Day | Night | Swing
    zone = Column(String, default="General Storage")     # Dry Goods | Cold Storage | Inbound | Outbound | Hazmat | General Storage
    department = Column(String, default="General Storage") # Kept for frontend compat

    business_id = Column(Integer, nullable=True)
    warehouse_id = Column(Integer, nullable=True)        # FK to warehouse entity
    business_card_id = Column(Integer, ForeignKey("business_cards.id", ondelete="CASCADE"), nullable=True)

    # Card specific fields
    size = Column(String, default="Standard")
    tagline = Column(String, nullable=True)
    description = Column(String, nullable=True)
    color = Column(String, default="#185FA5")

    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    business_card = relationship("BusinessCard", foreign_keys=[business_card_id], lazy="joined")


# ══════════════════════════════════════════════════════════
#  LOGISTICS MANAGER — Dedicated model
#  Connected to BusinessCard via business_card_id FK
# ══════════════════════════════════════════════════════════
class LogisticsManager(BaseTenant):
    __tablename__ = "logistics_managers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)

    shift = Column(String, default="Day")                # Day | Night | Swing
    route = Column(String, default="Local")              # Local | Regional | Long Haul | Last Mile | Cross-Border
    department = Column(String, default="Local")         # Kept for frontend compat

    business_id = Column(Integer, nullable=True)
    hub_id = Column(Integer, nullable=True)              # FK to logistics hub entity
    business_card_id = Column(Integer, ForeignKey("business_cards.id", ondelete="CASCADE"), nullable=True)

    # Card specific fields
    size = Column(String, default="Standard")
    tagline = Column(String, nullable=True)
    description = Column(String, nullable=True)
    color = Column(String, default="#185FA5")

    is_active = Column(Boolean, default=False)           # Tracks if user registered
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    business_card = relationship("BusinessCard", foreign_keys=[business_card_id], lazy="joined")


# ══════════════════════════════════════════════════════════
#  SUPPLY MANAGER — Dedicated model for Supplier co-managers
#  Connected to BusinessCard via business_card_id FK
#  Different from the Supplier model (supplier_manager/supplier.py) which is
#  a vendor/company record. SupplyManager represents the
#  person in YOUR team who manages supplier relationships.
# ══════════════════════════════════════════════════════════
class SupplyManager(BaseTenant):
    __tablename__ = "supply_managers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)

    # Supply-specific fields
    category = Column(String, default="Electronics")     # Electronics | Raw Material | Hydraulics | Plastics | Chemicals | Packaging | Textiles | Machinery
    region = Column(String, default="Domestic")          # Domestic | International | Asia-Pacific | Europe | Americas
    department = Column(String, default="Procurement")   # Kept for frontend compat

    business_id = Column(Integer, nullable=True)
    supplier_id = Column(Integer, nullable=True)         # Links to a Supplier record if assigned
    business_card_id = Column(Integer, ForeignKey("business_cards.id", ondelete="CASCADE"), nullable=True)

    # Card specific fields
    size = Column(String, default="Standard")
    tagline = Column(String, nullable=True)
    description = Column(String, nullable=True)
    color = Column(String, default="#185FA5")

    is_active = Column(Boolean, default=False)           # Tracks if user registered
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    business_card = relationship("BusinessCard", foreign_keys=[business_card_id], lazy="joined")