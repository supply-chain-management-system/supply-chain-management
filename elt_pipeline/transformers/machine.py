from elt_pipeline.utils.date_parser import parse_date

class MachineTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "machine_code": (data.get("machine_code") or "").strip(),
            "name": (data.get("name") or "").strip(),
            "status": (data.get("status") or "").lower().strip(),
            "purchase_date": parse_date(data.get("purchase_date")),
            "expiry_date": parse_date(data.get("expiry_date")),
            "last_maintenance_date": parse_date(data.get("last_maintenance_date")),
            "next_maintenance_date": parse_date(data.get("next_maintenance_date"))
        }
