from fastapi import APIRouter, Depends, HTTPException
from clickhouse_driver import Client
from typing import Generator, Optional

router = APIRouter(prefix='/elt_supplier', tags=['elt_supplier'])

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


@router.get("/suppliers/{tenant_id}")
def get_suppliers(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        id,
        argMax(name, processed_at) as name,
        argMax(category, processed_at) as category,
        argMax(contact_email, processed_at) as contact_email,
        argMax(phone, processed_at) as phone,
        argMax(lead_time_days, processed_at) as lead_time_days,
        argMax(rating, processed_at) as rating,
        argMax(is_active, processed_at) as is_active
    FROM analytics.{safe_tenant}_suppliers
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
            "category": row[2],
            "contact_email": row[3],
            "phone": row[4],
            "lead_time_days": row[5],
            "rating": row[6],
            "is_active": bool(row[7]),
        }
        for row in result
    ]


@router.get("/inventory/{tenant_id}")
def get_inventory(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        i.id as id,
        i.material_name as material_name,
        i.category as category,
        i.quantity as quantity,
        i.unit as unit,
        i.min_threshold as min_threshold,
        i.supplier_id as supplier_id,
        s.name as supplier_name
    FROM (
        SELECT
            id,
            argMax(material_name, processed_at) as material_name,
            argMax(category, processed_at) as category,
            argMax(quantity, processed_at) as quantity,
            argMax(unit, processed_at) as unit,
            argMax(min_threshold, processed_at) as min_threshold,
            argMax(supplier_id, processed_at) as supplier_id
        FROM analytics.{safe_tenant}_raw_material_inventory
        GROUP BY id
    ) i
    LEFT JOIN (
        SELECT id, argMax(name, processed_at) as name FROM analytics.{safe_tenant}_suppliers GROUP BY id
    ) s ON i.supplier_id = s.id
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
            "material_name": row[1],
            "category": row[2],
            "quantity": row[3],
            "unit": row[4],
            "min_threshold": row[5],
            "supplier_id": row[6],
            "supplier_name": row[7] or "Unknown Supplier",
        }
        for row in result
    ]


@router.get("/orders/{tenant_id}")
def get_orders(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    query = f"""
    SELECT
        o.id as id,
        o.supplier_id as supplier_id,
        o.total_amount as total_amount,
        o.status as status,
        o.material_name as material_name,
        o.quantity as quantity,
        o.unit as unit,
        o.unit_price as unit_price,
        o.order_date as order_date,
        o.expected_delivery as expected_delivery,
        s.name as supplier_name
    FROM (
        SELECT
            id,
            argMax(supplier_id, processed_at) as supplier_id,
            argMax(total_amount, processed_at) as total_amount,
            argMax(status, processed_at) as status,
            argMax(material_name, processed_at) as material_name,
            argMax(quantity, processed_at) as quantity,
            argMax(unit, processed_at) as unit,
            argMax(unit_price, processed_at) as unit_price,
            argMax(order_date, processed_at) as order_date,
            argMax(expected_delivery, processed_at) as expected_delivery
        FROM analytics.{safe_tenant}_purchase_orders
        GROUP BY id
    ) o
    LEFT JOIN (
        SELECT id, argMax(name, processed_at) as name FROM analytics.{safe_tenant}_suppliers GROUP BY id
    ) s ON o.supplier_id = s.id
    ORDER BY o.order_date DESC
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
            "supplier_id": row[1],
            "total_amount": row[2],
            "status": row[3],
            "material_name": row[4],
            "quantity": row[5],
            "unit": row[6],
            "unit_price": row[7],
            "order_date": row[8].strftime("%Y-%m-%d %H:%M:%S") if hasattr(row[8], 'strftime') else str(row[8]),
            "expected_delivery": row[9].strftime("%Y-%m-%d %H:%M:%S") if hasattr(row[9], 'strftime') else (str(row[9]) if row[9] is not None else None),
            "supplier_name": row[10] or "Unknown Supplier",
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
        "total_suppliers": 0,
        "total_orders": 0,
        "total_spend": 0.0,
        "low_stock_materials": 0,
    }
    
    # 1. Total suppliers count
    try:
        res = client.execute(f"SELECT count(DISTINCT id) FROM analytics.{safe_tenant}_suppliers")
        summary["total_suppliers"] = res[0][0] if res else 0
    except Exception:
        pass
        
    # 2. Total orders count
    try:
        res = client.execute(f"SELECT count(DISTINCT id) FROM analytics.{safe_tenant}_purchase_orders WHERE {date_filter}")
        summary["total_orders"] = res[0][0] if res else 0
    except Exception:
        pass
        
    # 3. Total spend
    try:
        res = client.execute(f"""
            SELECT sum(total_amount)
            FROM (
                SELECT argMax(total_amount, processed_at) as total_amount
                FROM analytics.{safe_tenant}_purchase_orders
                WHERE {date_filter} AND status != 'cancelled'
                GROUP BY id
            )
        """)
        summary["total_spend"] = float(res[0][0]) if res and res[0][0] is not None else 0.0
    except Exception:
        pass
        
    # 4. Low stock materials count
    try:
        res = client.execute(f"""
            SELECT count()
            FROM (
                SELECT argMax(quantity, processed_at) as quantity, argMax(min_threshold, processed_at) as min_threshold
                FROM analytics.{safe_tenant}_raw_material_inventory
                GROUP BY id
            )
            WHERE quantity <= min_threshold
        """)
        summary["low_stock_materials"] = res[0][0] if res else 0
    except Exception:
        pass
        
    return summary


@router.get("/spend-history/{tenant_id}")
def get_spend_history(
    tenant_id: str,
    range: Optional[str] = "7d",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    client: Client = Depends(get_clickhouse_client)
):
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    date_filter = get_date_filter(range, start_date, end_date)
    time_group = "toStartOfHour(order_date)" if range in ("today", "yesterday") else "toStartOfDay(order_date)"
    
    query = f"""
    SELECT
        {time_group} AS day,
        sum(total_amount) AS total_spend
    FROM analytics.{safe_tenant}_purchase_orders
    WHERE {date_filter} AND status != 'cancelled'
    GROUP BY day
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
            "day": row[0].strftime("%Y-%m-%d %H:%M:%S") if hasattr(row[0], 'strftime') else str(row[0]),
            "total_spend": float(row[1])
        }
        for row in result
    ]
