from elt_pipeline.utils.date_parser import parse_date

class ProductionTransformer:

    def transform(self, event):
        data = event["data"]
        if not data:
            return None

        product_name = data.get("product_name", "").strip()
        target_qty = int(data.get("target_qty") or 0)
        output_qty = int(data.get("output_qty") or 0)
        status = (data.get("status") or "").lower()
        
        created_at = parse_date(data.get("created_at"))

        efficiency = (
            output_qty / target_qty
            if target_qty > 0 else 0
        )

        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "product_name": product_name,
            "target_qty": target_qty,
            "output_qty": output_qty,
            "status": status,
            "efficiency": efficiency,
            "created_at": created_at
        }