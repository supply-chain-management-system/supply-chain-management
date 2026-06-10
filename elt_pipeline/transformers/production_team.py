class ProductionTeamTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "team_name": (data.get("team_name") or "").strip(),
            "production_id": data.get("production_id"),
            "worker_id": data.get("worker_id"),
            "role": (data.get("role") or "").lower().strip()
        }
