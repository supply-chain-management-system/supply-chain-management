"""merge heads

Revision ID: 1b5a03ee9a45
Revises: 04b337de26bd, 1548e982668a
Create Date: 2026-05-15 05:42:49.336309

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1b5a03ee9a45'
down_revision: Union[str, Sequence[str], None] = ('04b337de26bd', '1548e982668a')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
