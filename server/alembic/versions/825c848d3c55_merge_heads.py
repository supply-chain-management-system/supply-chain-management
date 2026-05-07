"""merge heads

Revision ID: 825c848d3c55
Revises: 4e328d10d0a4, 52754e82d796
Create Date: 2026-05-06 10:34:47.218543

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '825c848d3c55'
down_revision: Union[str, Sequence[str], None] = ('4e328d10d0a4', '52754e82d796')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
