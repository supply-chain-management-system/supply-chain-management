from sqlalchemy import create_engine, text
from app.db.database import DATABASE_URL

engine = create_engine(DATABASE_URL)

new_cols = [
    ("material_name", "VARCHAR(255)"),
    ("quantity", "DOUBLE PRECISION"),
    ("unit", "VARCHAR(50)"),
    ("unit_price", "DOUBLE PRECISION")
]

print("Starting migration on database (container connection)...")
try:
    with engine.connect() as conn:
        # Get all schemas
        result = conn.execute(text("SELECT schema_name FROM information_schema.schemata"))
        schemas = [row[0] for row in result.fetchall() if not row[0].startswith("pg_") and row[0] != "information_schema"]
        
        if "public" not in schemas:
            schemas.append("public")
            
        for schema in schemas:
            # Check if purchase_orders exists in this schema
            check_table = conn.execute(text(f"""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = '{schema}' 
                    AND table_name = 'purchase_orders'
                );
            """)).scalar()
            
            if check_table:
                print(f"Table 'purchase_orders' found in schema '{schema}'. Checking columns...")
                for col_name, col_type in new_cols:
                    check_col = conn.execute(text(f"""
                        SELECT EXISTS (
                            SELECT FROM information_schema.columns 
                            WHERE table_schema = '{schema}' 
                            AND table_name = 'purchase_orders'
                            AND column_name = '{col_name}'
                        );
                    """)).scalar()
                    
                    if not check_col:
                        print(f"-> Adding column '{col_name}' to {schema}.purchase_orders...")
                        conn.execute(text(f"ALTER TABLE {schema}.purchase_orders ADD COLUMN {col_name} {col_type}"))
                    else:
                        print(f"-> Column '{col_name}' already exists in {schema}.purchase_orders.")
                conn.commit()
            else:
                pass
    print("Migration completed successfully.")
except Exception as e:
    print(f"Migration error: {e}")
