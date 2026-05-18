"""create team_managers table

Revision ID: 04b337de26bd
Revises: 4c9bc90e5ef2
Create Date: 2026-05-13 06:57:44.299488
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = '04b337de26bd'
down_revision: Union[str, Sequence[str], None] = '4c9bc90e5ef2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'team_managers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )


def downgrade() -> None:
    op.drop_table('team_managers')