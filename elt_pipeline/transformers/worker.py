class WorkerTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "name": (data.get("name") or "").strip(),
            "role": (data.get("role") or "").lower().strip(),
            "status": (data.get("status") or "").lower().strip(),
            "factory_id": data.get("factory_id")
        }
