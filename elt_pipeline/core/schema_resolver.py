class SchemaResolver:
    def __init__(self, tenant_repo):
        self.tenant_repo = tenant_repo

    def extract(self, topic: str):
        
        parts = topic.split(".")
        if len(parts) != 3:
            return None, None

        _, schema, table = parts
        return schema, table

    def is_valid_tenant(self, schema: str) -> bool:
        return self.tenant_repo.exists(schema)