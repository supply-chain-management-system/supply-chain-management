from elt_pipeline.utils.date_parser import parse_date

class LogisticsActivityTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "event_text": (data.get("event_text") or "").strip(),
            "event_time": parse_date(data.get("event_time")),
            "status_type": (data.get("status_type") or "info").strip()
        }
