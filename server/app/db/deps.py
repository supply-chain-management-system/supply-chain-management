from app.db.database import SessionLocal

from fastapi import Request, Depends
from sqlalchemy.orm import Session


def get_db():
    print("run this")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_tenant_db(request: Request):
    schema = getattr(request.state, "schema", None)

    db = SessionLocal()

    try:
        if schema:
            print(f"Using tenant schema: {schema}")

            db.bind = db.bind.execution_options(schema_translate_map={None: schema})

        yield db
        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
