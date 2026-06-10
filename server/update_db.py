import sys
import os
from sqlalchemy import text

sys.path.append("/app")

from app.db.database import engine, BaseTenant, SessionLocal
from app.models.company.company import Company
from app.models.auth.user import User
from app.models.owner_models.business_card import BusinessCard

# Import ALL tenant-specific models so SQLAlchemy's BaseTenant knows about them!
from app.models.business_manager.team import FactoryManager, WarehouseManager, LogisticsManager, SupplyManager
from app.models.sub_managers.logistics_manager.domain import Vehicle, Shipment, LogisticsActivity, LogisticsSetting
from app.models.sub_managers.warehouse_manager.warehouse import Warehouse, Rack, Product, Inventory_ware
from app.models.sub_managers.request import MaterialRequest
from app.models.sub_managers.factory_manager.production import Factory, Production
from app.models.sub_managers.factory_manager.teams import Worker, Productionteam
from app.models.sub_managers.factory_manager.factory_machinery import Machine

def run():
    print("Starting schema update for all tenant models...")
    db = SessionLocal()
    try:
        companies = db.query(Company).all()
        print(f"Found {len(companies)} companies.")
        for comp in companies:
            if not comp.schema_name:
                continue
            
            schema = comp.schema_name
            print(f"Updating schema: {schema}")
            
            # Make sure schema exists
            with engine.begin() as conn:
                conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema}"'))
            
            tenant_engine = engine.execution_options(schema_translate_map={None: schema})
            BaseTenant.metadata.create_all(bind=tenant_engine)
            
            # Run manual alters to handle column additions safely in development
            with engine.connect() as conn:
                try:
                    conn.execute(text(f'ALTER TABLE "{schema}".logistics_vehicles ADD COLUMN IF NOT EXISTS distance_driven_km FLOAT DEFAULT 0.0'))
                    conn.execute(text(f'ALTER TABLE "{schema}".logistics_shipments ADD COLUMN IF NOT EXISTS on_time BOOLEAN DEFAULT TRUE'))
                    conn.execute(text(f'ALTER TABLE "{schema}".warehouse_managers ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT \'warehouse_manager\''))
                    conn.execute(text(f'ALTER TABLE "{schema}".logistics_managers ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT \'logistics_manager\''))
                    conn.execute(text(f'ALTER TABLE "{schema}".supply_managers ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT \'supply_manager\''))
                    conn.commit()
                except Exception as ex:
                    print(f"Failed to apply column updates for schema '{schema}': {ex}")
                    
            print(f"Successfully created/verified BaseTenant tables in {schema}")
            
        print("Done updating all schemas!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run()
