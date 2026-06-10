from fastapi import APIRouter, Depends, HTTPException
from clickhouse_driver import Client
from typing import Generator, Optional

router = APIRouter(prefix='/elt_warehouse', tags=['elt_warehouse'])

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


@router.get("/warehouses/{tenant_id}")
def get_warehouses(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        id,
        argMax(name, processed_at) as name,
        argMax(location, processed_at) as location
    FROM analytics.{safe_tenant}_warehouses
    GROUP BY id
    ORDER BY name ASC
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
            "name": row[1],
            "location": row[2]
        }
        for row in result
    ]


@router.get("/racks/{tenant_id}")
def get_racks(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        r.id as id,
        argMax(r.name, r.processed_at) as name,
        argMax(r.warehouse_id, r.processed_at) as warehouse_id,
        w.name as warehouse_name
    FROM analytics.{safe_tenant}_racks r
    LEFT JOIN (
        SELECT id, argMax(name, processed_at) as name FROM analytics.{safe_tenant}_warehouses GROUP BY id
    ) w ON r.warehouse_id = w.id
    GROUP BY r.id, w.name
    ORDER BY name ASC
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
            "name": row[1],
            "warehouse_id": row[2],
            "warehouse_name": row[3] or "Unknown"
        }
        for row in result
    ]


@router.get("/products/{tenant_id}")
def get_products(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        id,
        argMax(name, processed_at) as name,
        argMax(sku, processed_at) as sku
    FROM analytics.{safe_tenant}_products
    GROUP BY id
    ORDER BY name ASC
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
            "name": row[1],
            "sku": row[2]
        }
        for row in result
    ]


@router.get("/inventory/{tenant_id}")
def get_inventory(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        i.id as id,
        i.product_id as product_id,
        i.rack_id as rack_id,
        i.quantity as quantity,
        p.name as product_name,
        r.name as rack_name,
        w.name as warehouse_name
    FROM (
        SELECT
            id,
            argMax(product_id, processed_at) as product_id,
            argMax(rack_id, processed_at) as rack_id,
            argMax(quantity, processed_at) as quantity
        FROM analytics.{safe_tenant}_inventory_ware
        GROUP BY id
    ) i
    LEFT JOIN (
        SELECT id, argMax(name, processed_at) as name FROM analytics.{safe_tenant}_products GROUP BY id
    ) p ON i.product_id = p.id
    LEFT JOIN (
        SELECT id, argMax(name, processed_at) as name, argMax(warehouse_id, processed_at) as warehouse_id FROM analytics.{safe_tenant}_racks GROUP BY id
    ) r ON i.rack_id = r.id
    LEFT JOIN (
        SELECT id, argMax(name, processed_at) as name FROM analytics.{safe_tenant}_warehouses GROUP BY id
    ) w ON r.warehouse_id = w.id
    ORDER BY i.quantity DESC
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
            "product_id": row[1],
            "rack_id": row[2],
            "quantity": row[3],
            "product_name": row[4] or "Unknown Product",
            "rack_name": row[5] or "Unknown Rack",
            "warehouse_name": row[6] or "Unknown Warehouse"
        }
        for row in result
    ]


@router.get("/overview/{tenant_id}")
def get_overview(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    
    summary = {
        "total_warehouses": 0,
        "total_racks": 0,
        "total_stock": 0,
        "low_stock_items": 0,
    }
    
    # 1. Total Warehouses
    try:
        res = client.execute(f"SELECT count(DISTINCT id) FROM analytics.{safe_tenant}_warehouses")
        summary["total_warehouses"] = res[0][0] if res else 0
    except Exception:
        pass
        
    # 2. Total Racks
    try:
        res = client.execute(f"SELECT count(DISTINCT id) FROM analytics.{safe_tenant}_racks")
        summary["total_racks"] = res[0][0] if res else 0
    except Exception:
        pass
        
    # 3. Total Stock
    try:
        res = client.execute(f"SELECT sum(quantity) FROM (SELECT argMax(quantity, processed_at) as quantity FROM analytics.{safe_tenant}_inventory_ware GROUP BY id)")
        summary["total_stock"] = int(res[0][0]) if res and res[0][0] is not None else 0
    except Exception:
        pass
        
    # 4. Low Stock Items (quantity < 20)
    try:
        res = client.execute(f"SELECT count() FROM (SELECT argMax(quantity, processed_at) as quantity FROM analytics.{safe_tenant}_inventory_ware GROUP BY id) WHERE quantity < 20")
        summary["low_stock_items"] = res[0][0] if res else 0
    except Exception:
        pass
        
    return summary


@router.get("/stock-history/{tenant_id}")
def get_stock_history(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        i.id as id,
        i.product_id as product_id,
        i.quantity as quantity,
        i.processed_at as processed_at,
        p.name as product_name
    FROM analytics.{safe_tenant}_inventory_ware i
    LEFT JOIN (
        SELECT id, argMax(name, processed_at) as name FROM analytics.{safe_tenant}_products GROUP BY id
    ) p ON i.product_id = p.id
    ORDER BY i.processed_at ASC
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
            "product_id": row[1],
            "quantity": row[2],
            "processed_at": row[3].strftime("%Y-%m-%d %H:%M:%S") if hasattr(row[3], 'strftime') else str(row[3]),
            "product_name": row[4] or "Unknown Product"
        }
        for row in result
    ]
