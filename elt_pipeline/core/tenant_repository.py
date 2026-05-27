from sqlalchemy import text

class TenantRepository:
    def __init__(self, conn):
        self.conn = conn

    def exists(self, schema_name: str) -> bool:
        query = text("SELECT 1 FROM companies WHERE schema_name = :schema_name LIMIT 1")
        result = self.conn.execute(query, {"schema_name": schema_name})
        return result.fetchone() is not None