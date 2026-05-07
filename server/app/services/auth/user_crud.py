from datetime import datetime, timedelta
from app.db.deps import get_db
from app.models.auth.user import User
from app.core.security import hash_password
from sqlalchemy.orm import Session

import uuid
from datetime import datetime


def create_user(
    db: Session,
    name: str,
    email: str,
    password: str,
    otp_code: str,
    otp_expiry: datetime,
):
    db_user = User(
        name=name,
        email=email,
        password=password,
        role="owner",
        otp_code=otp_code,
        otp_expiry=otp_expiry,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_user_by_email(db, email):
    return db.query(User).filter(User.email == email).first()


async def get_or_create_user(
    email: str,
    name: str | None,
    db: Session = None,
) -> dict:
    """
    Find existing user by email or create a new one.
    Returns a plain dict with user data.
    """
    try:
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user:
            print(f"✅ Existing user found: {email}")

            existing_user.last_login = datetime.utcnow()

            db.commit()
            db.refresh(existing_user)
            return _serialize_user(existing_user)

        print(f"🆕 Creating new user: {email}")

        new_user = User(
            id=str(uuid.uuid4()),
            email=email,
            name=name,
            is_active=True,
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow(),
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print(f"✅ New user created: {email}")
        return _serialize_user(new_user)

    except Exception as e:
        db.rollback()
        print(f"❌ Error in get_or_create_user: {e}")
        raise e


def _serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "is_active": user.is_active,
        "created_at": str(user.created_at),
        "last_login": str(user.last_login),
    }
