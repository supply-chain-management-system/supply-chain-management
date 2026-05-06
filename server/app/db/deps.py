from app.db.database import SessionLocal

from fastapi import Request, Depends
from sqlalchemy.orm import Session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_tenant_db(request: Request, db: Session = Depends(get_db)):
    print(request.state.anything)
    print(f"Request state schema: {getattr(request.state, 'schema', None)}")
    schema = getattr(request.state, "schema", None)
    print(f"Using tenant schema: {schema}")

    if not schema:
        print(
            "No tenant schema found in request state. Using default database connection."
        )
        return db

    connection = db.connection().execution_options(schema_translate_map={None: schema})
    print(f"Created tenant-specific connection for schema: {schema}")

    db.bind = connection

    return db
