from elt_pipeline.utils.date_parser import parse_date

class LogisticsShipmentTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "tracking_number": (data.get("tracking_number") or "").strip(),
            "destination": (data.get("destination") or "").strip(),
            "driver_name": (data.get("driver_name") or "").strip(),
            "weight_kg": float(data.get("weight_kg") or 0.0),
            "status": (data.get("status") or "Pending").strip(),
            "eta": parse_date(data.get("eta")),
            "created_at": parse_date(data.get("created_at"))
        }
