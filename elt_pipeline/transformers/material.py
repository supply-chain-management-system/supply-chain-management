from elt_pipeline.utils.date_parser import parse_date

class MaterialTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        
        current_stock = float(data.get("current_stock") or 0.0)
        low_stock_threshold = float(data.get("low_stock_threshold") or 10.0)
        is_low_stock = 1 if current_stock <= low_stock_threshold else 0
        
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "name": (data.get("name") or "").strip(),
            "current_stock": current_stock,
            "unit": (data.get("unit") or "").strip(),
            "low_stock_threshold": low_stock_threshold,
            "last_restocked": parse_date(data.get("last_restocked")),
            "is_low_stock": is_low_stock
        }
