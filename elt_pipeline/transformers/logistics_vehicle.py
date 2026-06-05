class LogisticsVehicleTransformer:
    def transform(self, event):
        data = event.get("data")
        if not data:
            return None
        return {
            "id": data.get("id"),
            "tenant_id": event["schema"],
            "fleet_id": (data.get("fleet_id") or "").strip(),
            "route": (data.get("route") or "").strip() if data.get("route") else None,
            "fuel_level": float(data.get("fuel_level") or 0.0) if data.get("fuel_level") is not None else 100.0,
            "stop_warehouse_id": data.get("stop_warehouse_id"),
            "stop_warehouse_name": (data.get("stop_warehouse_name") or "").strip(),
            "capacity_kg": float(data.get("capacity_kg") or 0.0),
            "vehicle_type": (data.get("vehicle_type") or "Truck").strip(),
            "driver_name": (data.get("driver_name") or "").strip() if data.get("driver_name") else None,
            "status": (data.get("status") or "Active").strip()
        }
