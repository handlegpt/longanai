"""
Add is_admin column to users table

Revision ID: 20240610_add_is_admin_to_user
Revises: 20240608_add_public_fields_to_podcast
Create Date: 2024-06-10
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20240610_add_is_admin_to_user'
down_revision = '20240608_add_public_fields_to_podcast'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.false()))

def downgrade():
    op.drop_column('users', 'is_admin') 