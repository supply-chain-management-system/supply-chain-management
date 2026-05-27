from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.deps import get_db, get_tenant_db
from app.services.auth.dependancy import get_current_user
from app.models.auth.user import User
from app.models.business_manager.team import WarehouseManager
from app.models.company_auth.managers import InviteToken
from app.models.sub_managers.logistics_manager.domain import Vehicle, Shipment, LogisticsActivity

router = APIRouter(
    prefix="/logistics-dashboard",
    tags=["Logistics Dashboard"]
)

class VehicleCreate(BaseModel):
    fleet_id: str
    stop_warehouse_id: Optional[int] = None
    stop_warehouse_name: str
    capacity_kg: float
    vehicle_type: str = "Truck"
    driver_name: Optional[str] = None
    status: str = "Active"

class VehicleUpdate(BaseModel):
    fleet_id: Optional[str] = None
    stop_warehouse_id: Optional[int] = None
    stop_warehouse_name: Optional[str] = None
    capacity_kg: Optional[float] = None
    vehicle_type: Optional[str] = None
    driver_name: Optional[str] = None
    status: Optional[str] = None

class ShipmentCreate(BaseModel):
    tracking_number: str
    destination: str
    driver_name: str
    weight_kg: float
    status: str = "Pending"
    eta: Optional[datetime] = None

class ShipmentUpdate(BaseModel):
    tracking_number: Optional[str] = None
    destination: Optional[str] = None
    driver_name: Optional[str] = None
    weight_kg: Optional[float] = None
    status: Optional[str] = None
    eta: Optional[datetime] = None

class ActivityCreate(BaseModel):
    event_text: str
    status_type: str = "info"

def serialize_vehicle(vehicle: Vehicle):
    return {
        "id": vehicle.fleet_id,
        "stop_warehouse_id": vehicle.stop_warehouse_id,
        "stop_warehouse_name": vehicle.stop_warehouse_name,
        "capacity_kg": int(vehicle.capacity_kg),
        "vehicle_type": vehicle.vehicle_type,
        "driver_name": vehicle.driver_name,
        "status": vehicle.status
    }

def serialize_warehouse_stand(warehouse_id, name, location=None, source="warehouse"):
    return {
        "id": warehouse_id,
        "name": name,
        "location": location,
        "source": source
    }

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_tenant_db), current_user: User = Depends(get_current_user)):
    active_vehicles = db.query(Vehicle).filter(Vehicle.status == "Active").count()
    deliveries_today = db.query(Shipment).filter(Shipment.status == "Delivered").count()
    pending_shipments = db.query(Shipment).filter(Shipment.status.in_(["Pending", "In Transit", "Delayed"])).count()
    critical_alerts = db.query(LogisticsActivity).filter(LogisticsActivity.status_type == "error").count()

    # Create dummy data if table is completely empty to match UI on first run
    if active_vehicles == 0 and pending_shipments == 0:
        return {
            "stats": [
                {
                    "label": "Active Vehicles",
                    "value": "42",
                    "delta": "+3 today",
                    "deltaUp": True,
                    "sparkData": [30, 38, 42, 35, 50, 44, 60, 55, 65, 42],
                    "green": True,
                },
                {
                    "label": "Deliveries Today",
                    "value": "128",
                    "delta": "+12%",
                    "deltaUp": True,
                    "sparkData": [80, 95, 88, 110, 105, 120, 115, 122, 128, 128],
                    "green": False,
                },
                {
                    "label": "Pending Shipments",
                    "value": "15",
                    "delta": "-2 cleared",
                    "deltaUp": True,
                    "sparkData": [22, 20, 25, 18, 17, 20, 16, 18, 17, 15],
                    "green": False,
                },
                {
                    "label": "Critical Alerts",
                    "value": "3",
                    "delta": "+1",
                    "deltaUp": False,
                    "sparkData": [1, 2, 1, 3, 2, 4, 2, 3, 4, 3],
                    "green": False,
                },
            ]
        }
        
    return {
        "stats": [
            {
                "label": "Active Vehicles",
                "value": str(active_vehicles),
                "delta": "Live Data",
                "deltaUp": True,
                "sparkData": [30, 38, 42, 35, 50, 44, 60, 55, 65, 42],
                "green": True,
            },
            {
                "label": "Deliveries Today",
                "value": str(deliveries_today),
                "delta": "Live Data",
                "deltaUp": True,
                "sparkData": [80, 95, 88, 110, 105, 120, 115, 122, 128, 128],
                "green": False,
            },
            {
                "label": "Pending Shipments",
                "value": str(pending_shipments),
                "delta": "Live Data",
                "deltaUp": True,
                "sparkData": [22, 20, 25, 18, 17, 20, 16, 18, 17, 15],
                "green": False,
            },
            {
                "label": "Critical Alerts",
                "value": str(critical_alerts),
                "delta": "Live Data",
                "deltaUp": False,
                "sparkData": [1, 2, 1, 3, 2, 4, 2, 3, 4, 3],
                "green": False,
            },
        ]
    }

@router.get("/shipments")
def get_shipments(db: Session = Depends(get_tenant_db), current_user: User = Depends(get_current_user)):
    shipments = db.query(Shipment).order_by(Shipment.id.desc()).limit(5).all()
    if not shipments:
        return [
            { "id": '#SHP-1001', "destination": 'New York, NY',    "driver": 'James K.', "weight": '2.4 t', "status": 'In Transit', "eta": 'Today 2:30 PM'     },
            { "id": '#SHP-1002', "destination": 'Los Angeles, CA', "driver": 'Maria S.', "weight": '1.8 t', "status": 'Pending',    "eta": 'Tomorrow 10:00 AM' },
            { "id": '#SHP-1003', "destination": 'Chicago, IL',     "driver": 'Tom R.',   "weight": '3.1 t', "status": 'Delivered',  "eta": 'Today 9:15 AM'     },
            { "id": '#SHP-1004', "destination": 'Houston, TX',     "driver": 'Sara L.',  "weight": '0.9 t', "status": 'In Transit', "eta": 'Today 4:45 PM'     },
            { "id": '#SHP-1005', "destination": 'Phoenix, AZ',     "driver": 'Mark D.',  "weight": '2.0 t', "status": 'Delayed',    "eta": 'Tomorrow 3:00 PM'  },
        ]
    return [
        {
            "id": f"#SHP-1{s.id:03d}",
            "destination": s.destination,
            "driver": s.driver_name,
            "weight": f"{s.weight_kg} kg",
            "status": s.status,
            "eta": s.eta.strftime("%b %d, %H:%M") if s.eta else "N/A"
        } for s in shipments
    ]

@router.get("/activities")
def get_activities(db: Session = Depends(get_tenant_db), current_user: User = Depends(get_current_user)):
    activities = db.query(LogisticsActivity).order_by(LogisticsActivity.id.desc()).limit(5).all()
    if not activities:
        return [
            { "icon": "CheckCircle2", "green": True,  "text": 'SHP-1003 delivered to Chicago, IL',     "time": '9:15 AM'  },
            { "icon": "Truck",        "green": True,  "text": 'SHP-1001 departed Nashville depot',      "time": '8:42 AM'  },
            { "icon": "AlertTriangle","green": False, "text": 'SHP-1005 delayed — traffic on I-10',    "time": '8:10 AM'  },
            { "icon": "RefreshCw",    "green": False, "text": 'Warehouse stand queue updated automatically', "time": '7:55 AM' },
            { "icon": "Circle",       "green": False, "text": 'SHP-1002 queued for departure',          "time": '7:30 AM' },
        ]
    return [
        {
            "icon": "Circle", # Mapping icons is dynamic in frontend based on status_type
            "green": a.status_type == "success",
            "text": a.event_text,
            "time": a.event_time.strftime("%H:%M %p")
        } for a in activities
    ]

@router.get("/warehouse-stands")
def get_warehouse_stands(
    app_db: Session = Depends(get_db),
    tenant_db: Session = Depends(get_tenant_db),
    current_user: User = Depends(get_current_user)
):
    warehouse_cards = tenant_db.query(WarehouseManager).order_by(WarehouseManager.id.asc()).all()
    stands = [
        serialize_warehouse_stand(
            manager.warehouse_id or manager.id,
            manager.name,
            manager.zone or manager.department or "Warehouse Manager Card",
            "warehouse_manager_card"
        )
        for manager in warehouse_cards
    ]

    legacy_cards = (
        app_db.query(InviteToken)
        .filter(InviteToken.role == "warehouse_manager_card")
        .order_by(InviteToken.id.asc())
        .all()
    )

    existing_ids = {stand["id"] for stand in stands}
    for legacy in legacy_cards:
        stand_id = legacy.factory_id or legacy.id
        if stand_id not in existing_ids:
            stands.append(
                serialize_warehouse_stand(
                    stand_id,
                    legacy.name,
                    legacy.department or "Legacy Warehouse Manager Card",
                    "legacy_warehouse_manager_card"
                )
            )

    return stands

@router.get("/vehicles")
def get_vehicles(db: Session = Depends(get_tenant_db), current_user: User = Depends(get_current_user)):
    vehicles = db.query(Vehicle).limit(100).all()
    if not vehicles:
        return [
            { "id": 'TRK-001', "stop_warehouse_id": 1, "stop_warehouse_name": 'Main Warehouse', "capacity_kg": 2400, "vehicle_type": 'Box Truck', "driver_name": 'James K.', "status": 'Active' },
            { "id": 'TRK-004', "stop_warehouse_id": 2, "stop_warehouse_name": 'South Depot', "capacity_kg": 1800, "vehicle_type": 'Van', "driver_name": 'Maria S.', "status": 'Active' },
            { "id": 'TRK-007', "stop_warehouse_id": 1, "stop_warehouse_name": 'Main Warehouse', "capacity_kg": 3100, "vehicle_type": 'Flatbed', "driver_name": 'Tom R.', "status": 'Idle' },
            { "id": 'TRK-012', "stop_warehouse_id": None, "stop_warehouse_name": 'Service Centre', "capacity_kg": 900, "vehicle_type": 'Mini Truck', "driver_name": None, "status": 'Maintenance' },
        ]
    return [serialize_vehicle(v) for v in vehicles]

@router.post("/vehicles", status_code=status.HTTP_201_CREATED)
def create_vehicle(data: VehicleCreate, db: Session = Depends(get_tenant_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Vehicle).filter(Vehicle.fleet_id == data.fleet_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this ID already exists.")
    
    new_vehicle = Vehicle(
        fleet_id=data.fleet_id,
        stop_warehouse_id=data.stop_warehouse_id,
        stop_warehouse_name=data.stop_warehouse_name,
        capacity_kg=data.capacity_kg,
        vehicle_type=data.vehicle_type,
        driver_name=data.driver_name,
        status=data.status
    )
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return serialize_vehicle(new_vehicle)

@router.put("/vehicles/{fleet_id}")
def update_vehicle(fleet_id: str, data: VehicleUpdate, db: Session = Depends(get_tenant_db), current_user: User = Depends(get_current_user)):
    vehicle = db.query(Vehicle).filter(Vehicle.fleet_id == fleet_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found.")
    
    if data.fleet_id is not None: vehicle.fleet_id = data.fleet_id
    if data.stop_warehouse_id is not None: vehicle.stop_warehouse_id = data.stop_warehouse_id
    if data.stop_warehouse_name is not None: vehicle.stop_warehouse_name = data.stop_warehouse_name
    if data.capacity_kg is not None: vehicle.capacity_kg = data.capacity_kg
    if data.vehicle_type is not None: vehicle.vehicle_type = data.vehicle_type
    if data.driver_name is not None: vehicle.driver_name = data.driver_name
    if data.status is not None: vehicle.status = data.status
    
    db.commit()
    db.refresh(vehicle)
    return serialize_vehicle(vehicle)

@router.delete("/vehicles/{fleet_id}")
def delete_vehicle(fleet_id: str, db: Session = Depends(get_tenant_db), current_user: User = Depends(get_current_user)):
    vehicle = db.query(Vehicle).filter(Vehicle.fleet_id == fleet_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found.")
    
    db.delete(vehicle)
    db.commit()
    return {"status": "success", "message": f"Vehicle {fleet_id} deleted."}

@router.post("/shipments", status_code=status.HTTP_201_CREATED)
def create_shipment(data: ShipmentCreate, db: Session = Depends(get_tenant_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Shipment).filter(Shipment.tracking_number == data.tracking_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Shipment with this tracking number already exists.")
    
    new_shipment = Shipment(
        tracking_number=data.tracking_number,
        destination=data.destination,
        driver_name=data.driver_name,
        weight_kg=data.weight_kg,
        status=data.status,
        eta=data.eta
    )
    db.add(new_shipment)
    db.commit()
    db.refresh(new_shipment)
    return {
        "id": f"#SHP-1{new_shipment.id:03d}",
        "destination": new_shipment.destination,
        "driver": new_shipment.driver_name,
        "weight": f"{new_shipment.weight_kg} kg",
        "status": new_shipment.status,
        "eta": new_shipment.eta.strftime("%b %d, %H:%M") if new_shipment.eta else "N/A"
    }

@router.put("/shipments/{shipment_id}")
def update_shipment(shipment_id: int, data: ShipmentUpdate, db: Session = Depends(get_tenant_db), current_user: User = Depends(get_current_user)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found.")
    
    if data.tracking_number is not None: shipment.tracking_number = data.tracking_number
    if data.destination is not None: shipment.destination = data.destination
    if data.driver_name is not None: shipment.driver_name = data.driver_name
    if data.weight_kg is not None: shipment.weight_kg = data.weight_kg
    if data.status is not None: shipment.status = data.status
    if data.eta is not None: shipment.eta = data.eta
    
    db.commit()
    db.refresh(shipment)
    return {
        "id": f"#SHP-1{shipment.id:03d}",
        "destination": shipment.destination,
        "driver": shipment.driver_name,
        "weight": f"{shipment.weight_kg} kg",
        "status": shipment.status,
        "eta": shipment.eta.strftime("%b %d, %H:%M") if shipment.eta else "N/A"
    }

@router.delete("/shipments/{shipment_id}")
def delete_shipment(shipment_id: int, db: Session = Depends(get_tenant_db), current_user: User = Depends(get_current_user)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found.")
    
    db.delete(shipment)
    db.commit()
    return {"status": "success", "message": f"Shipment {shipment_id} deleted."}

@router.post("/activities", status_code=status.HTTP_201_CREATED)
def create_activity(data: ActivityCreate, db: Session = Depends(get_tenant_db), current_user: User = Depends(get_current_user)):
    new_activity = LogisticsActivity(
        event_text=data.event_text,
        status_type=data.status_type
    )
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    return {
        "icon": "Circle",
        "green": new_activity.status_type == "success",
        "text": new_activity.event_text,
        "time": new_activity.event_time.strftime("%H:%M %p")
    }
