from fastapi import APIRouter, Depends, HTTPException
from clickhouse_driver import Client
from typing import Generator

router = APIRouter(prefix='/elt_production', tags=['elt_production'])

ch_client = Client(
    host='clickhouse',
    user='default',
    password='mypassword',
    port=9000
)

def get_clickhouse_client() -> Generator[Client, None, None]:
    try:
        yield ch_client
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")


@router.get("/production/{tenant_id}")
def get_production(tenant_id: str, client: Client = Depends(get_clickhouse_client)):
    print(f"Fetching production data for tenant: {tenant_id}")
    
    safe_tenant = "".join(c for c in tenant_id if c.isalnum() or c == '_')
    
    query = f"""
    SELECT
        product_name,
        argMax(target_qty, id) AS target_qty,
        argMax(output_qty, id) AS output_qty,
        argMax(status, id) AS status,
        argMax(efficiency, id) AS efficiency
    FROM analytics.{safe_tenant}_production
    GROUP BY product_name
    ORDER BY product_name
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
            "target_qty": row[1],
            "output_qty": row[2],
            "status": row[3],
            "efficiency": row[4],
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