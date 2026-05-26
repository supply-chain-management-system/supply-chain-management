"""vehicle stand capacity fields

Revision ID: 8b6a2d4f9c13
Revises: 761a9435d4ab
Create Date: 2026-05-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '8b6a2d4f9c13'
down_revision: Union[str, Sequence[str], None] = '761a9435d4ab'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('logistics_vehicles', sa.Column('stop_warehouse_id', sa.Integer(), nullable=True))
    op.add_column('logistics_vehicles', sa.Column('stop_warehouse_name', sa.String(), nullable=False, server_default='Warehouse Stand'))
    op.add_column('logistics_vehicles', sa.Column('capacity_kg', sa.Float(), nullable=False, server_default='0'))
    op.add_column('logistics_vehicles', sa.Column('vehicle_type', sa.String(), nullable=True, server_default='Truck'))
    op.add_column('logistics_vehicles', sa.Column('driver_name', sa.String(), nullable=True))
    op.alter_column('logistics_vehicles', 'route', existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    op.alter_column('logistics_vehicles', 'route', existing_type=sa.String(), nullable=False)
    op.drop_column('logistics_vehicles', 'driver_name')
    op.drop_column('logistics_vehicles', 'vehicle_type')
    op.drop_column('logistics_vehicles', 'capacity_kg')
    op.drop_column('logistics_vehicles', 'stop_warehouse_name')
    op.drop_column('logistics_vehicles', 'stop_warehouse_id')
