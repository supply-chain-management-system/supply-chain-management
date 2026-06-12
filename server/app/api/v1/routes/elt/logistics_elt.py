from fastapi import APIRouter, Depends, HTTPException
from clickhouse_driver import Client
from typing import Generator, Optional

router = APIRouter(prefix='/elt_logistics', tags=['elt_logistics'])

def get_clickhouse_client() -> Generator[Client, None, None]:
    client = Client(
        host='clickhouse',
        user='default',
        password='mypassword',
        port=9000
    )
    try:
        yield client
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")
    finally:
        try:
            client.disconnect()
        except Exception:
            pass


@router.get("/vehicles/{tenant_id}")
def get_vehicles(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        id,
        argMax(fleet_id, processed_at) as fleet_id,
        argMax(route, processed_at) as route,
        argMax(fuel_level, processed_at) as fuel_level,
        argMax(stop_warehouse_id, processed_at) as stop_warehouse_id,
        argMax(stop_warehouse_name, processed_at) as stop_warehouse_name,
        argMax(capacity_kg, processed_at) as capacity_kg,
        argMax(vehicle_type, processed_at) as vehicle_type,
        argMax(driver_name, processed_at) as driver_name,
        argMax(status, processed_at) as status
    FROM analytics.{safe_tenant}_logistics_vehicles
    GROUP BY id
    ORDER BY fleet_id ASC
    """
    try:
        result = client.execute(query)
    except Exception as e:
        if "Code: 60" in str(e) or "Unknown table" in str(e):
            return []
        raise HTTPException(status_code=500, detail=str(e))
        
    return [
        {
            "id": row[0],
            "fleet_id": row[1],
            "route": row[2],
            "fuel_level": float(row[3]) if row[3] is not None else 100.0,
            "stop_warehouse_id": row[4],
            "stop_warehouse_name": row[5],
            "capacity_kg": float(row[6]) if row[6] is not None else 0.0,
            "vehicle_type": row[7],
            "driver_name": row[8],
            "status": row[9]
        }
        for row in result
    ]


@router.get("/shipments/{tenant_id}")
def get_shipments(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        id,
        argMax(tracking_number, processed_at) as tracking_number,
        argMax(destination, processed_at) as destination,
        argMax(driver_name, processed_at) as driver_name,
        argMax(weight_kg, processed_at) as weight_kg,
        argMax(status, processed_at) as status,
        argMax(eta, processed_at) as eta,
        argMax(created_at, processed_at) as created_at
    FROM analytics.{safe_tenant}_logistics_shipments
    GROUP BY id
    ORDER BY created_at DESC
    """
    try:
        result = client.execute(query)
    except Exception as e:
        if "Code: 60" in str(e) or "Unknown table" in str(e):
            return []
        raise HTTPException(status_code=500, detail=str(e))
        
    return [
        {
            "id": row[0],
            "tracking_number": row[1],
            "destination": row[2],
            "driver_name": row[3],
            "weight_kg": float(row[4]) if row[4] is not None else 0.0,
            "status": row[5],
            "eta": row[6].strftime("%Y-%m-%d %H:%M:%S") if row[6] and hasattr(row[6], 'strftime') else str(row[6]) if row[6] else None,
            "created_at": row[7].strftime("%Y-%m-%d %H:%M:%S") if row[7] and hasattr(row[7], 'strftime') else str(row[7]) if row[7] else None
        }
        for row in result
    ]


@router.get("/activities/{tenant_id}")
def get_activities(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        id,
        argMax(event_text, processed_at) as event_text,
        argMax(event_time, processed_at) as event_time,
        argMax(status_type, processed_at) as status_type
    FROM analytics.{safe_tenant}_logistics_activities
    GROUP BY id
    ORDER BY event_time DESC
    LIMIT 30
    """
    try:
        result = client.execute(query)
    except Exception as e:
        if "Code: 60" in str(e) or "Unknown table" in str(e):
            return []
        raise HTTPException(status_code=500, detail=str(e))
        
    return [
        {
            "id": row[0],
            "event_text": row[1],
            "event_time": row[2].strftime("%H:%M %p") if row[2] and hasattr(row[2], 'strftime') else str(row[2]) if row[2] else None,
            "status_type": row[3]
        }
        for row in result
    ]


@router.get("/overview/{tenant_id}")
def get_overview(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    
    summary = {
        "active_vehicles": 0,
        "deliveries_today": 0,
        "pending_shipments": 0,
        "critical_alerts": 0,
    }
    
    # 1. Active vehicles count
    try:
        res = client.execute(f"SELECT count() FROM (SELECT argMax(status, processed_at) as status FROM analytics.{safe_tenant}_logistics_vehicles GROUP BY id) WHERE status = 'Active'")
        summary["active_vehicles"] = res[0][0] if res else 0
    except Exception:
        pass
        
    # 2. Deliveries Completed
    try:
        res = client.execute(f"SELECT count() FROM (SELECT argMax(status, processed_at) as status FROM analytics.{safe_tenant}_logistics_shipments GROUP BY id) WHERE status = 'Delivered'")
        summary["deliveries_today"] = res[0][0] if res else 0
    except Exception:
        pass
        
    # 3. Pending shipments
    try:
        res = client.execute(f"SELECT count() FROM (SELECT argMax(status, processed_at) as status FROM analytics.{safe_tenant}_logistics_shipments GROUP BY id) WHERE status = 'Pending'")
        summary["pending_shipments"] = res[0][0] if res else 0
    except Exception:
        pass
        
    # 4. Critical alerts
    try:
        res = client.execute(f"SELECT count() FROM analytics.{safe_tenant}_logistics_activities WHERE status_type = 'error'")
        summary["critical_alerts"] = res[0][0] if res else 0
    except Exception:
        pass
        
    return summary


@router.get("/shipment-history/{tenant_id}")
def get_shipment_history(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        toStartOfDay(processed_at) as day,
        argMax(status, processed_at) as status,
        count() as count
    FROM analytics.{safe_tenant}_logistics_shipments
    GROUP BY day, status
    ORDER BY day ASC
    """
    try:
        result = client.execute(query)
    except Exception as e:
        if "Code: 60" in str(e) or "Unknown table" in str(e):
            return []
        raise HTTPException(status_code=500, detail=str(e))
        
    return [
        {
            "day": row[0].strftime("%Y-%m-%d") if hasattr(row[0], 'strftime') else str(row[0]),
            "status": row[1],
            "count": row[2]
        }
        for row in result
    ]
