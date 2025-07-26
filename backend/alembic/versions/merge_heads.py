"""Merge heads

Revision ID: merge_heads
Revises: 20240610_add_is_admin_to_user, add_user_profile_fields
Create Date: 2025-01-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'merge_heads'
down_revision = ('20240610_add_is_admin_to_user', 'add_user_profile_fields')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass 