def parse_event(message: dict):
    """
    Convert raw Debezium Kafka event → clean structure
    """
    if not message or not isinstance(message, dict):
        return None

    payload = message.get("payload")
    if not payload or not isinstance(payload, dict):
        return None

    source = payload.get("source")
    if not source or not isinstance(source, dict):
        return None

    return {
        "op": payload.get("op"),
        "schema": source.get("schema"),
        "table": source.get("table"),
        "data": payload.get("after")  # INSERT/UPDATE data
    }