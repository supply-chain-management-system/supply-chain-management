import sys
from sqlalchemy import text

sys.path.append("/app")
from app.db.database import engine

def inspect():
    with engine.connect() as conn:
        # Get schemas
        schemas = conn.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 't_%' OR schema_name = 'public'")).fetchall()
        print("Schemas:", [s[0] for s in schemas])
        
        for s in [schema[0] for schema in schemas]:
            print(f"\nTables in schema: {s}")
            tables = conn.execute(text(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{s}'")).fetchall()
            for t in tables:
                print(" -", t[0])

if __name__ == "__main__":
    inspect()
