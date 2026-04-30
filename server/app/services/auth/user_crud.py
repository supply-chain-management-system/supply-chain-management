from app.models.auth.user import User
from app.core.security import hash_password
from sqlalchemy.orm import Session


def create_user(db: Session, name: str, email: str, password: str):
    db_user = User(
        name=name,
        email=email,
        password=password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db, email):
    return db.query(User).filter(User.email == email).first()
