import os
from sqlalchemy import create_engine, text
from app.db.database import DATABASE_URL, BaseTenant

# Force import of all models to ensure they register with BaseTenant metadata
from app.models.sub_managers.factory_manager.factory_material import Factory_Material, Factory_MaterialTransaction, TransactionType
from app.models.sub_managers.factory_manager.production import Factory, Production
from app.models.sub_managers.factory_manager.teams import Worker, Productionteam
from app.models.sub_managers.factory_manager.factory_machinery import Machine
from app.models.business_manager.domain import Inventory, Approval, Supplier
from app.models.business_manager.business_owners import BusinessOwners
from app.models.owner_models.business_card import BusinessCard
from app.models.sub_managers.warehouse_manager.warehouse import Warehouse, Product, Inventory_ware, Rack
from app.models.sub_managers.request import MaterialRequest

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
            print(f"Successfully migrated schema '{schema_name}'")

    print("All tenant migrations completed successfully!")

if __name__ == "__main__":
    run_migrations()
