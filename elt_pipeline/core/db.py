

from sqlalchemy import create_engine

DB_URL = "postgresql://postgres:12345@postgres:5432/supply_chain_db"

engine = create_engine(DB_URL)
conn = engine.connect()