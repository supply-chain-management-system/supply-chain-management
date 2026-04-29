from app.models.auth.user import User
from app.core.security import hash_password


def create_user(db, user):
    db_user = User(
        name=user.name, email=user.email, password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db, email):
    return db.query(User).filter(User.email == email).first()
