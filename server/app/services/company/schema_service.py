import re
import uuid
from sqlalchemy import text
import string
import random


def generate_schema_name(name: str):
    base = name.lower().replace(" ", "_")
    base = re.sub(r'[^a-z0-9_]', '', base)
    unique_id = uuid.uuid4().hex[:5]
    return f"t_{base[:10]}_{unique_id}"


def generate_unique_schema(db, name: str):
    while True:
        schema_name = generate_schema_name(name)

        result = db.execute(
            text(
                "SELECT schema_name FROM information_schema.schemata WHERE schema_name = :name"
            ),
            {"name": schema_name},
        ).fetchone()

        if not result:
            return schema_name


def generate_public_id(length=6):
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choices(chars, k=length))
