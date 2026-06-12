import os
from sqlalchemy import create_engine, text
from app.db.database import DATABASE_URL, BaseTenant

# Force import of all models to ensure they register with BaseTenant metadata
from app.models.sub_managers.factory_manager.factory_material import Factory_Material, Factory_MaterialTransaction, TransactionType
from app.models.sub_managers.factory_manager.production import Factory, Production
from app.models.sub_managers.factory_manager.teams import Worker, Productionteam
from app.models.sub_managers.factory_manager.factory_machinery import Machine, MachineAssignment
from app.models.business_manager.domain import Inventory, Approval
from app.models.supplier_manager.supplier import Supplier
from app.models.business_manager.business_owners import BusinessOwners
from app.models.owner_models.business_card import BusinessCard
from app.models.sub_managers.warehouse_manager.warehouse import Warehouse, Product, Inventory_ware, Rack
from app.models.sub_managers.request import MaterialRequest
from app.models.sub_managers.logistics_manager.domain import Vehicle, Shipment, LogisticsActivity, LogisticsSetting
from app.models.business_manager.team import FactoryManager, WarehouseManager, LogisticsManager, SupplyManager

def run_migrations():
    print(f"Connecting to database...")
    engine = create_engine(DATABASE_URL)
    
    # Query all tenant schemas from companies table
    with engine.connect() as conn:
        try:
            companies = conn.execute(text("SELECT id, name, schema_name FROM public.companies")).fetchall()
        except Exception as e:
            print("Error querying public.companies table. Make sure public schema migrations are up to date:", e)
            return

        print(f"Found {len(companies)} company/tenant schemas.")
        for company in companies:
            company_id, name, schema_name = company
            if not schema_name:
                print(f"Skipping company ID {company_id} ('{name}') - No schema name specified.")
                continue
                
            print(f"Migrating tenant schema '{schema_name}' (Company: '{name}')...")
            # Create schema if not exists (should already exist)
            conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'))
            conn.commit()
            
            # Build engine with translation mapping
            tenant_engine = engine.execution_options(schema_translate_map={None: schema_name})
            
            # Create all tables registered in BaseTenant metadata
            BaseTenant.metadata.create_all(bind=tenant_engine)
            
            # Run manual alters to handle column additions safely in development
            with engine.connect() as conn:
                try:
                    conn.execute(text(f'ALTER TABLE "{schema_name}".logistics_vehicles ADD COLUMN IF NOT EXISTS distance_driven_km FLOAT DEFAULT 0.0'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".logistics_shipments ADD COLUMN IF NOT EXISTS on_time BOOLEAN DEFAULT TRUE'))
                    
                    # Warehouse Manager tables
                    conn.execute(text(f'ALTER TABLE "{schema_name}".warehouses ADD COLUMN IF NOT EXISTS capacity FLOAT DEFAULT 10000.0'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".warehouses ADD COLUMN IF NOT EXISTS contact_number VARCHAR'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".warehouses ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT \'active\''))

                    conn.execute(text(f'ALTER TABLE "{schema_name}".racks ADD COLUMN IF NOT EXISTS zone VARCHAR'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".racks ADD COLUMN IF NOT EXISTS max_weight FLOAT DEFAULT 5000.0'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".racks ADD COLUMN IF NOT EXISTS rows INTEGER DEFAULT 5'))

                    conn.execute(text(f'ALTER TABLE "{schema_name}".products ADD COLUMN IF NOT EXISTS cost FLOAT DEFAULT 0.0'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".products ADD COLUMN IF NOT EXISTS price FLOAT DEFAULT 0.0'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".products ADD COLUMN IF NOT EXISTS weight FLOAT DEFAULT 1.0'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".products ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 10'))

                    conn.execute(text(f'ALTER TABLE "{schema_name}".inventory_ware ADD COLUMN IF NOT EXISTS batch_number VARCHAR'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".inventory_ware ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".inventory_ware ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT \'available\''))

                    # Factory Manager tables
                    conn.execute(text(f'ALTER TABLE "{schema_name}".machines ADD COLUMN IF NOT EXISTS factory_id INTEGER'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".machines ADD COLUMN IF NOT EXISTS serial_number VARCHAR'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".machines ADD COLUMN IF NOT EXISTS model_number VARCHAR'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".machines ADD COLUMN IF NOT EXISTS operating_hours FLOAT DEFAULT 0.0'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".machines ADD COLUMN IF NOT EXISTS location VARCHAR DEFAULT \'Bay 1\''))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".machines ADD COLUMN IF NOT EXISTS efficiency FLOAT DEFAULT 100.0'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".machines ADD COLUMN IF NOT EXISTS category VARCHAR DEFAULT \'General\''))

                    conn.execute(text(f'ALTER TABLE "{schema_name}".workers ADD COLUMN IF NOT EXISTS email VARCHAR'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".workers ADD COLUMN IF NOT EXISTS phone VARCHAR'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".workers ADD COLUMN IF NOT EXISTS hourly_rate FLOAT DEFAULT 15.0'))

                    conn.execute(text(f'ALTER TABLE "{schema_name}".production ADD COLUMN IF NOT EXISTS scrap_qty INTEGER DEFAULT 0'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".production ADD COLUMN IF NOT EXISTS priority VARCHAR DEFAULT \'medium\''))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".production ADD COLUMN IF NOT EXISTS notes TEXT'))

                    # Machine Assignments alters
                    conn.execute(text(f'ALTER TABLE "{schema_name}".machine_assignments ALTER COLUMN worker_id DROP NOT NULL'))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".machine_assignments ADD COLUMN IF NOT EXISTS assignment_type VARCHAR DEFAULT \'maintenance\''))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".machine_assignments ADD COLUMN IF NOT EXISTS production_id INTEGER'))

                    # Manager group-card role columns
                    conn.execute(text(f'ALTER TABLE "{schema_name}".warehouse_managers ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT \'warehouse_manager\''))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".logistics_managers ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT \'logistics_manager\''))
                    conn.execute(text(f'ALTER TABLE "{schema_name}".supply_managers ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT \'supply_manager\''))
                    conn.commit()
                except Exception as ex:
                    print(f"Failed to apply column updates for schema '{schema_name}': {ex}")
                    
            print(f"Successfully migrated schema '{schema_name}'")

    print("All tenant migrations completed successfully!")

if __name__ == "__main__":
    run_migrations()
