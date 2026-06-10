class InventoryWareTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "product_id": data.get("product_id"),
            "rack_id": data.get("rack_id"),
            "quantity": int(data.get("quantity") or 0)
        }
