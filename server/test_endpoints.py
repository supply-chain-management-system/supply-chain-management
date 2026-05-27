import sys
import os
sys.path.append("/app")

from fastapi.testclient import TestClient
from app.main import app
from app.services.auth.dependancy import get_current_user
from app.models.auth.user import User
from app.db.database import SessionLocal
from app.models.company.company import Company
from app.models.sub_managers.logistics_manager.domain import Vehicle, Shipment, LogisticsActivity
from jose import jwt

db = SessionLocal()
# Find a user associated with a company
user = db.query(User).filter(User.company_id.isnot(None)).first()

if not user:
    company = db.query(Company).first()
    if company:
        user = User(
            name="Logistics Tester",
            email="test_logistics@example.com",
            company_id=company.id,
            role="logistics_manager",
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

if not user:
    print("❌ No user or company found. Database must be seeded first.")
    db.close()
    sys.exit(1)

company = db.query(Company).filter(Company.id == user.company_id).first()

# SETUP: Clean up any old test records in the tenant schema before starting
print(f"Cleaning up previous test data in schema '{company.schema_name}'...")
tenant_db = SessionLocal()
tenant_db.bind = tenant_db.bind.execution_options(schema_translate_map={None: company.schema_name})

old_vehicle = tenant_db.query(Vehicle).filter(Vehicle.fleet_id == "TEST-TRK-99").first()
if old_vehicle:
    tenant_db.delete(old_vehicle)
    
old_shipment = tenant_db.query(Shipment).filter(Shipment.tracking_number == "TRK-TEST-001").first()
if old_shipment:
    tenant_db.delete(old_shipment)
    
tenant_db.commit()
tenant_db.close()
db.close()

# Generate access token
SECRET_KEY = os.getenv("SECRET_KEY", "hve1rhfLe6NmBMr5s6GKx9tjneqWton8nwJST63r5-w")
ALGORITHM = "HS256"
token = jwt.encode({"sub": user.email}, SECRET_KEY, algorithm=ALGORITHM)

client = TestClient(app)
client.cookies.set("access_token", token)

# Override get_current_user to return our user
app.dependency_overrides[get_current_user] = lambda: user

def run_tests():
    print("🚀 Starting API integration tests with Tenant context...")
    print(f"User: {user.email}, Company ID: {user.company_id}, Schema: {company.schema_name}")

    headers = {
        "Content-Type": "application/json"
    }

    # 1. Test POST /vehicles
    print("\n1. Testing POST /api/v1/logistics-dashboard/vehicles")
    vehicle_payload = {
        "fleet_id": "TEST-TRK-99",
        "stop_warehouse_id": 1,
        "stop_warehouse_name": "Test Depot",
        "capacity_kg": 5000,
        "vehicle_type": "Refrigerated",
        "driver_name": "Test Driver",
        "status": "Active"
    }
    r = client.post("/api/v1/logistics-dashboard/vehicles", json=vehicle_payload, headers=headers)
    print("Response status:", r.status_code)
    print("Response data:", r.json())
    assert r.status_code == 201
    assert r.json()["id"] == "TEST-TRK-99"

    # 2. Test GET /vehicles
    print("\n2. Testing GET /api/v1/logistics-dashboard/vehicles")
    r = client.get("/api/v1/logistics-dashboard/vehicles", headers=headers)
    print("Response status:", r.status_code)
    print("Vehicles found:", len(r.json()))
    assert r.status_code == 200
    assert any(v["id"] == "TEST-TRK-99" for v in r.json())

    # 3. Test POST /shipments
    print("\n3. Testing POST /api/v1/logistics-dashboard/shipments")
    shipment_payload = {
        "tracking_number": "TRK-TEST-001",
        "destination": "Miami, FL",
        "driver_name": "Test Driver",
        "weight_kg": 3500.0,
        "status": "In Transit",
        "eta": "2026-05-27T15:00:00"
    }
    r = client.post("/api/v1/logistics-dashboard/shipments", json=shipment_payload, headers=headers)
    print("Response status:", r.status_code)
    print("Response data:", r.json())
    assert r.status_code == 201
    assert r.json()["destination"] == "Miami, FL"
    created_shipment_id = r.json()["id"] # e.g. "#SHP-1006"
    numeric_id = int(created_shipment_id.split("-1")[-1])

    # 4. Test GET /shipments
    print("\n4. Testing GET /api/v1/logistics-dashboard/shipments")
    r = client.get("/api/v1/logistics-dashboard/shipments", headers=headers)
    print("Response status:", r.status_code)
    print("Response data:", r.json())
    assert r.status_code == 200
    assert any(s["id"] == created_shipment_id for s in r.json())

    # 5. Test GET /stats
    print("\n5. Testing GET /api/v1/logistics-dashboard/stats (checking live query integration)")
    r = client.get("/api/v1/logistics-dashboard/stats", headers=headers)
    print("Response status:", r.status_code)
    print("Stats response:", r.json())
    assert r.status_code == 200
    active_vehicles_stat = next(s for s in r.json()["stats"] if s["label"] == "Active Vehicles")
    pending_shipments_stat = next(s for s in r.json()["stats"] if s["label"] == "Pending Shipments")
    print(f"Active Vehicles value: {active_vehicles_stat['value']}")
    print(f"Pending Shipments value: {pending_shipments_stat['value']}")
    assert int(active_vehicles_stat["value"]) >= 1
    assert int(pending_shipments_stat["value"]) >= 1

    # 6. Test PUT /shipments/{id}
    print(f"\n6. Testing PUT /api/v1/logistics-dashboard/shipments/{numeric_id}")
    update_payload = {
        "status": "Delivered"
    }
    r = client.put(f"/api/v1/logistics-dashboard/shipments/{numeric_id}", json=update_payload, headers=headers)
    print("Response status:", r.status_code)
    print("Response data:", r.json())
    assert r.status_code == 200
    assert r.json()["status"] == "Delivered"

    # 7. Test DELETE /shipments/{id}
    print(f"\n7. Testing DELETE /api/v1/logistics-dashboard/shipments/{numeric_id}")
    r = client.delete(f"/api/v1/logistics-dashboard/shipments/{numeric_id}", headers=headers)
    print("Response status:", r.status_code)
    assert r.status_code == 200

    # 8. Test DELETE /vehicles/{fleet_id}
    print("\n8. Testing DELETE /api/v1/logistics-dashboard/vehicles/TEST-TRK-99")
    r = client.delete("/api/v1/logistics-dashboard/vehicles/TEST-TRK-99", headers=headers)
    print("Response status:", r.status_code)
    assert r.status_code == 200

    print("\n✅ All tests passed successfully!")

if __name__ == "__main__":
    run_tests()
