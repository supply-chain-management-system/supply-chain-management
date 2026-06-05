from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import BaseTenant

class Vehicle(BaseTenant):
    __tablename__ = "logistics_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    fleet_id = Column(String, unique=True, index=True, nullable=False)
    route = Column(String, nullable=True)
    fuel_level = Column(Float, default=100.0)
    distance_driven_km = Column(Float, default=0.0)
    stop_warehouse_id = Column(Integer, nullable=True)
    stop_warehouse_name = Column(String, nullable=False)
    capacity_kg = Column(Float, nullable=False)
    vehicle_type = Column(String, default="Truck")
    driver_name = Column(String, nullable=True)
    status = Column(String, default="Active")  # Active, Idle, Maintenance
    
    # Optional: relate to a logistics manager or hub if needed later
    manager_id = Column(Integer, ForeignKey("logistics_managers.id"), nullable=True)

class Shipment(BaseTenant):
    __tablename__ = "logistics_shipments"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String, unique=True, index=True, nullable=False)
    destination = Column(String, nullable=False)
    driver_name = Column(String, nullable=False)
    weight_kg = Column(Float, nullable=False)
    status = Column(String, default="Pending")  # Pending, In Transit, Delivered, Delayed
    eta = Column(DateTime, nullable=True)
    on_time = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

class LogisticsActivity(BaseTenant):
    __tablename__ = "logistics_activities"

    id = Column(Integer, primary_key=True, index=True)
    event_text = Column(String, nullable=False)
    event_time = Column(DateTime, default=datetime.utcnow)
    status_type = Column(String, default="info")  # success, info, warning, error

class LogisticsSetting(BaseTenant):
    __tablename__ = "logistics_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, unique=True, index=True, nullable=False)
    setting_value = Column(String, nullable=False)
