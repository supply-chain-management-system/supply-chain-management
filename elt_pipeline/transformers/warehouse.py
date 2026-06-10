class WarehouseTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "name": (data.get("name") or "").strip(),
            "location": (data.get("location") or "").strip()
        }
