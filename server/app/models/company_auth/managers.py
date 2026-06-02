from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from app.db.database import Base
from datetime import datetime, timedelta


class InviteToken(Base):
    __tablename__ = "invite_tokens"

    id          = Column(Integer, primary_key=True, index=True)
    email       = Column(String, index=True, nullable=False)
    role        = Column(String, nullable=False)        # "Factory Manager" | "Logistics Manager" | etc.
    token       = Column(String, unique=True, index=True, nullable=False)
    name        = Column(String, nullable=False)
    phone       = Column(String, nullable=True)
    shift       = Column(String, nullable=True)         # Day | Night | Swing
    department  = Column(String, nullable=True)         # Assembly | Quality Control | Logistics
    factory_id  = Column(Integer, nullable=True)        # which factory this FM belongs to
    extra_data  = Column(JSONB, nullable=True)          # role-specific fields for other manager types
    is_used     = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.utcnow)
    expires_at  = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24))