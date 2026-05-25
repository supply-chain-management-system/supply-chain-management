"""merge multiple heads

Revision ID: 9893232cafdc
Revises: 36ce455bf70b, 761a9435d4ab
Create Date: 2026-05-19 06:25:37.982627

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9893232cafdc'
down_revision: Union[str, Sequence[str], None] = ('36ce455bf70b', '761a9435d4ab')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
