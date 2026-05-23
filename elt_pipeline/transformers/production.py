from datetime import datetime

class ProductionTransformer:

    def transform(self, event):
        data = event["data"]
        if not data:
            return None

        product_name = data.get("product_name", "").strip()
        target_qty = int(data.get("target_qty") or 0)
        output_qty = int(data.get("output_qty") or 0)
        status = (data.get("status") or "").lower()
        
        # Parse created_at defensively
        created_at_raw = data.get("created_at")
        created_at = None
        if created_at_raw:
            try:
                if isinstance(created_at_raw, (int, float)):
                    # Handle epoch timestamps (seconds, milliseconds, or microseconds)
                    if created_at_raw > 1e12:  # microseconds
                        created_at = datetime.fromtimestamp(created_at_raw / 1e6)
                    elif created_at_raw > 1e9:  # milliseconds
                        created_at = datetime.fromtimestamp(created_at_raw / 1e3)
                    else:  # seconds
                        created_at = datetime.fromtimestamp(created_at_raw)
                else:
                    # Clean trailing 'Z' and parse ISO 8601 string
                    val = str(created_at_raw).strip()
                    if val.endswith("Z"):
                        val = val[:-1] + "+00:00"
                    created_at = datetime.fromisoformat(val)
            except Exception:
                created_at = None

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