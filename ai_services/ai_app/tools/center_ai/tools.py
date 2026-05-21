import psycopg2
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig

# 🔒 Centralized Role Permissions
ROLE_TABLE_PERMISSIONS = {
    "owner": ["warehouse_inventory", "shipping_status", "payroll_records", "company_revenues"],
    "warehouse_manager": ["warehouse_inventory", "shipping_status"],
    "finance_manager": ["payroll_records", "company_revenues"],
    "hr_manager": ["employee_directory", "performance_reviews"]
}

@tool
def query_business_database(target_table: str, sql_query: str, config: RunnableConfig) -> str:
    """Executes an operational database lookup for metrics, inventory, or reports.
    Args:
        target_table: The raw name of the table to read (e.g. 'warehouse_inventory')
        sql_query: The specific SELECT statement to evaluate.
    """
    tenant_schema = config["configurable"].get("tenant_schema")
    user_role = config["configurable"].get("user_role")
    
    # 1. Role Guardrail Check
    allowed_tables = ROLE_TABLE_PERMISSIONS.get(user_role, [])
    if target_table not in allowed_tables:
        return f"Access Denied: Your role account '{user_role}' is unauthorized to query the '{target_table}' table."
        
    try:
        # (Assuming your global postgres connection setup lives here)
        conn = postgres_connection_pool.getconn()
        cursor = conn.cursor()
        
        # 2. Multi-Tenant Schema Separation
        cursor.execute(f"SET search_path TO {tenant_schema};")
        
        cursor.execute(sql_query)
        records = cursor.fetchall()
        
        cursor.close()
        postgres_connection_pool.putconn(conn)
        
        if not records:
            return f"Query successful, but returned 0 results inside schema '{tenant_schema}'."
        return f"Results from {tenant_schema}.{target_table}:\n{str(records)}"
    except Exception as e:
        return f"Database Query Execution Error: {str(e)}"

@tool
def search_corporate_knowledge_base(query: str, config: RunnableConfig) -> str:
    """Search internal corporate operational manuals, guidelines, and safety policies."""
    return "RAG Search placeholder: Successfully matching system documentation chunks."