from datetime import datetime

def parse_date(date_raw):
    if not date_raw:
        return None
    try:
        if isinstance(date_raw, (int, float)):
            # Handle timestamps in microseconds, milliseconds, or seconds
            if date_raw > 1e14: 
                return datetime.fromtimestamp(date_raw / 1e6)
            elif date_raw > 1e11:  
                return datetime.fromtimestamp(date_raw / 1e3)
            else:  
                return datetime.fromtimestamp(date_raw)
        else:
            val = str(date_raw).strip()
            if val.endswith("Z"):
                val = val[:-1] + "+00:00"
            return datetime.fromisoformat(val)
    except Exception:
        return None
