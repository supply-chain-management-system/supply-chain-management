from fastapi import APIRouter, Depends, HTTPException
from clickhouse_driver import Client
from typing import Generator, Optional

router = APIRouter(prefix='/elt_production', tags=['elt_production'])

def get_date_filter(range_val: str, start_date: str = None, end_date: str = None) -> str:
    if range_val in ("today", "yesterday"):
        return "processed_at >= subtractDays(today(), 1)"
    elif range_val == "30d":
        return "processed_at >= subtractDays(today(), 30)"
    elif range_val == "custom" and start_date:
        end_condition = f"AND processed_at <= toDateTime('{end_date}')" if end_date else ""
        return f"processed_at >= toDateTime('{start_date}') {end_condition}"
    else: # Default 7d
        return "processed_at >= subtractDays(today(), 7)"

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


@router.get("/production/{tenant_id}")
def get_production(
    tenant_id: str,
    range: Optional[str] = "7d",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    client: Client = Depends(get_clickhouse_client)
):
    print(f"Fetching production data for tenant: {tenant_id}, range: {range}")
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    date_filter = get_date_filter(range, start_date, end_date)
    time_group = "toStartOfHour(processed_at)" if range in ("today", "yesterday") else "toStartOfDay(processed_at)"
    
    query = f"""
    SELECT
        product_name,
        {time_group} AS day,
        avg(efficiency) AS efficiency,
        sum(output_qty) AS output_qty,
        sum(target_qty) AS target_qty,
        argMax(status, processed_at) AS status
    FROM analytics.{safe_tenant}_production
    WHERE {date_filter}
    GROUP BY product_name, day
    ORDER BY day ASC, product_name ASC
    """
    
    try:
        result = client.execute(query)
    except Exception as e:
        print(f"🔥 CLICKHOUSE EXECUTION ERROR: {repr(e)}")
        
        if "Code: 60" in str(e) or "Unknown table" in str(e):
            return []
            
        raise HTTPException(status_code=500, detail=f"ClickHouse Failed: {str(e)}")

    return [
        {
            "product_name": row[0],
            "day": row[1].strftime("%Y-%m-%d") if hasattr(row[1], 'strftime') else str(row[1]),
            "efficiency": float(row[2]),
            "output_qty": int(row[3]),
            "target_qty": int(row[4]),
            "status": row[5]
        }
        for row in result
    ]


@router.get("/production/{tenant_id}/history/{product_name}")
def get_product_history(tenant_id: str, product_name: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')

    query = f"""
    SELECT
        product_name,
        target_qty,
        output_qty,
        status,
        efficiency,
        created_at
    FROM analytics.{safe_tenant}_production
    WHERE product_name = %(prod_name)s
    ORDER BY created_at ASC
    """

    try:
        result = client.execute(query, params={"prod_name": product_name})
    except Exception as e:
        if "Code: 60" in str(e) or "Unknown table" in str(e):
            return []
        raise e

    return [
        {
            "product_name": r[0],
            "target_qty": r[1],
            "output_qty": r[2],
            "status": r[3],
            "efficiency": r[4],
            "created_at": r[5],
        }
        for r in result
    ]


@router.get("/machines/{tenant_id}")
def get_machines(
    tenant_id: str,
    range: Optional[str] = "7d",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    client: Client = Depends(get_clickhouse_client)
):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    date_filter = get_date_filter(range, start_date, end_date)
    query = f"""
    SELECT
        id,
        argMax(name, processed_at) as name,
        status,
        toStartOfDay(processed_at) as day,
        count() as count
    FROM analytics.{safe_tenant}_machines
    WHERE {date_filter}
    GROUP BY id, status, day
    ORDER BY day ASC, id ASC
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
            "status": row[2],
            "day": row[3].strftime("%Y-%m-%d") if hasattr(row[3], 'strftime') else str(row[3]),
            "count": row[4],
        }
        for row in result
    ]


@router.get("/materials/{tenant_id}")
def get_materials(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        id,
        argMax(name, processed_at) as name,
        argMax(current_stock, processed_at) as current_stock,
        argMax(unit, processed_at) as unit,
        argMax(low_stock_threshold, processed_at) as low_stock_threshold,
        argMax(last_restocked, processed_at) as last_restocked,
        argMax(is_low_stock, processed_at) as is_low_stock
    FROM analytics.{safe_tenant}_factory_materials
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
            "current_stock": row[2],
            "unit": row[3],
            "low_stock_threshold": row[4],
            "last_restocked": row[5],
            "is_low_stock": bool(row[6]),
        }
        for row in result
    ]


@router.get("/transactions/{tenant_id}")
def get_transactions(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        t.id as id,
        t.material_id as material_id,
        t.transaction_type as transaction_type,
        t.quantity as quantity,
        t.production_id as production_id,
        t.timestamp as timestamp,
        m.name as material_name
    FROM (
        SELECT
            id,
            argMax(material_id, processed_at) as material_id,
            argMax(transaction_type, processed_at) as transaction_type,
            argMax(quantity, processed_at) as quantity,
            argMax(production_id, processed_at) as production_id,
            argMax(timestamp, processed_at) as timestamp
        FROM analytics.{safe_tenant}_factory_material_transactions
        GROUP BY id
    ) t
    LEFT JOIN (
        SELECT
            id,
            argMax(name, processed_at) as name
        FROM analytics.{safe_tenant}_factory_materials
        GROUP BY id
    ) m ON t.material_id = m.id
    ORDER BY t.timestamp DESC
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
            "material_id": row[1],
            "transaction_type": row[2],
            "quantity": row[3],
            "production_id": row[4],
            "timestamp": row[5],
            "material_name": row[6],
        }
        for row in result
    ]


@router.get("/workers/{tenant_id}")
def get_workers(
    tenant_id: str,
    range: Optional[str] = "7d",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    client: Client = Depends(get_clickhouse_client)
):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    date_filter = get_date_filter(range, start_date, end_date)
    query = f"""
    SELECT
        w.id as id,
        w.name as name,
        toStartOfDay(p.processed_at) as day,
        sum(p.output_qty) as throughput
    FROM analytics.{safe_tenant}_production_team t
    JOIN (
        SELECT id, name FROM analytics.{safe_tenant}_workers GROUP BY id, name
    ) w ON t.worker_id = w.id
    JOIN (
        SELECT id, output_qty, processed_at FROM analytics.{safe_tenant}_production
    ) p ON t.production_id = p.id
    WHERE p.{date_filter}
    GROUP BY id, name, day
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
            "id": row[0],
            "name": row[1],
            "day": row[2].strftime("%Y-%m-%d") if hasattr(row[2], 'strftime') else str(row[2]),
            "throughput": row[3],
        }
        for row in result
    ]


@router.get("/teams/{tenant_id}")
def get_teams(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        t.id as id,
        t.team_name as team_name,
        t.production_id as production_id,
        t.worker_id as worker_id,
        t.role as role,
        w.name as worker_name,
        p.product_name as product_name
    FROM (
        SELECT
            id,
            argMax(team_name, processed_at) as team_name,
            argMax(production_id, processed_at) as production_id,
            argMax(worker_id, processed_at) as worker_id,
            argMax(role, processed_at) as role
        FROM analytics.{safe_tenant}_production_team
        GROUP BY id
    ) t
    LEFT JOIN (
        SELECT
            id,
            argMax(name, processed_at) as name
        FROM analytics.{safe_tenant}_workers
        GROUP BY id
    ) w ON t.worker_id = w.id
    LEFT JOIN (
        SELECT
            id,
            argMax(product_name, processed_at) as product_name
        FROM analytics.{safe_tenant}_production
        GROUP BY id
    ) p ON t.production_id = p.id
    ORDER BY t.id ASC
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
            "team_name": row[1],
            "production_id": row[2],
            "worker_id": row[3],
            "role": row[4],
            "worker_name": row[5],
            "product_name": row[6],
        }
        for row in result
    ]


@router.get("/overview/{tenant_id}")
def get_overview(
    tenant_id: str,
    range: Optional[str] = "7d",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    client: Client = Depends(get_clickhouse_client)
):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    date_filter = get_date_filter(range, start_date, end_date)
    
    summary = {
        "active_jobs": 0,
        "total_machines": 0,
        "active_machines": 0,
        "low_stock_materials": 0,
        "total_workers": 0,
    }
    
    # 1. Active jobs count
    try:
        prod_res = client.execute(f"SELECT argMax(status, processed_at) FROM analytics.{safe_tenant}_production WHERE {date_filter} GROUP BY product_name")
        summary["active_jobs"] = sum(1 for r in prod_res if r[0] == "progress")
    except Exception:
        pass
        
    # 2. Machines status
    try:
        mach_res = client.execute(f"SELECT argMax(status, processed_at) FROM analytics.{safe_tenant}_machines WHERE {date_filter} GROUP BY id")
        summary["total_machines"] = len(mach_res)
        summary["active_machines"] = sum(1 for r in mach_res if r[0] == "active")
    except Exception:
        pass
        
    # 3. Low stock materials
    try:
        mat_res = client.execute(f"SELECT argMax(is_low_stock, processed_at) FROM analytics.{safe_tenant}_factory_materials WHERE {date_filter} GROUP BY id")
        summary["low_stock_materials"] = sum(1 for r in mat_res if r[0] == 1)
    except Exception:
        pass
        
    # 4. Workers
    try:
        work_res = client.execute(f"SELECT count(DISTINCT id) FROM analytics.{safe_tenant}_workers WHERE {date_filter}")
        summary["total_workers"] = work_res[0][0] if work_res else 0
    except Exception:
        pass
        
    return summary