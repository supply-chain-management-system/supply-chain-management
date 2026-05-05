"""chage the team name constaunts

Revision ID: 52754e82d796
Revises: 130ac7a1b58e
Create Date: 2026-05-04 01:36:00.166003

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '52754e82d796'
down_revision: Union[str, Sequence[str], None] = '130ac7a1b58e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 🔥 Create ENUM first
    worker_status = sa.Enum('Active', 'Leave', name='worker_status')
    worker_status.create(op.get_bind())

    # ✅ Then add column
    op.add_column(
        'workers',
        sa.Column('status', worker_status, nullable=True)
    )
def downgrade():
    op.drop_column('workers', 'status')

    # 🔥 Drop ENUM
    worker_status = sa.Enum('Active', 'Leave', name='worker_status')
    worker_status.drop(op.get_bind())