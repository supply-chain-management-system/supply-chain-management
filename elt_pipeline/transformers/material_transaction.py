from elt_pipeline.utils.date_parser import parse_date

class MaterialTransactionTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "material_id": data.get("material_id"),
            "transaction_type": (data.get("transaction_type") or "").strip(),
            "quantity": float(data.get("quantity") or 0.0),
            "production_id": data.get("production_id"),
            "timestamp": parse_date(data.get("timestamp"))
        }
