from fastapi import APIRouter
from clickhouse_driver import Client


router = APIRouter(prefix='/elt_production', tags=['elt_production'])




@router.get("/production/{tenant_id}")
def get_production(tenant_id: str):
    print(f"Fetching production data for tenant: {tenant_id}")
    client = Client(
    host='clickhouse',
    user='default',
    password='mypassword',
    port=9000

) 
    print(client.execute("SHOW TABLES"))
    table = f"analytics.{tenant_id}_production"
    
    query = f"""
SELECT
    product_name,
    argMax(target_qty, id) AS target_qty,
    argMax(output_qty, id) AS output_qty,
    argMax(status, id) AS status,
    argMax(efficiency, id) AS efficiency
FROM analytics.{tenant_id}_production
GROUP BY product_name
ORDER BY product_name
"""
    
    result = client.execute(query)

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
def get_product_history(tenant_id: str, product_name: str):
    client = Client(
        host="clickhouse",
        user="default",
        password="mypassword",
        port=9000
    )

    query = f"""
    SELECT
        product_name,
        target_qty,
        output_qty,
        status,
        efficiency,
        created_at
    FROM analytics.{tenant_id}_production
    WHERE product_name = '{product_name}'
    ORDER BY created_at ASC
    """

    result = client.execute(query)

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