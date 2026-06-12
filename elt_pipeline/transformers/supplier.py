from elt_pipeline.utils.date_parser import parse_date

class SupplierTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "name": data.get("name"),
            "category": data.get("category"),
            "contact_email": data.get("contact_email"),
            "phone": data.get("phone"),
            "lead_time_days": int(data.get("lead_time_days") or 7),
            "rating": float(data.get("rating") or 5.0),
            "is_active": bool(data.get("is_active", True)),
            "business_id": int(data.get("business_id") or 1),
            "manager_id": int(data.get("manager_id")) if data.get("manager_id") is not None else None,
        }


class RawMaterialInventoryTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "material_name": data.get("material_name"),
            "category": data.get("category"),
            "quantity": float(data.get("quantity") or 0.0),
            "unit": data.get("unit", "kg"),
            "min_threshold": float(data.get("min_threshold") or 10.0),
            "supplier_id": int(data.get("supplier_id")) if data.get("supplier_id") is not None else None,
            "business_id": int(data.get("business_id") or 1),
        }


class PurchaseOrderTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "supplier_id": int(data.get("supplier_id")) if data.get("supplier_id") is not None else None,
            "total_amount": float(data.get("total_amount") or 0.0),
            "status": data.get("status", "pending"),
            "material_name": data.get("material_name"),
            "quantity": float(data.get("quantity") or 0.0),
            "unit": data.get("unit", "units"),
            "unit_price": float(data.get("unit_price") or 0.0),
            "order_date": parse_date(data.get("order_date")),
            "expected_delivery": parse_date(data.get("expected_delivery")) if data.get("expected_delivery") is not None else None,
            "business_id": int(data.get("business_id") or 1),
        }
