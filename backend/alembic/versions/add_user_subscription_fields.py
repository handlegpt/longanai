"""Add user subscription fields

Revision ID: add_user_subscription_fields
Revises: 
Create Date: 2025-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_user_subscription_fields'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add subscription and usage tracking fields to users table
    op.add_column('users', sa.Column('subscription_plan', sa.String(50), nullable=True, server_default='free'))
    op.add_column('users', sa.Column('monthly_generation_count', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('users', sa.Column('monthly_generation_limit', sa.Integer(), nullable=True, server_default='10'))
    op.add_column('users', sa.Column('last_generation_reset', sa.DateTime(timezone=True), nullable=True))

def downgrade():
    # Remove subscription fields
    op.drop_column('users', 'last_generation_reset')
    op.drop_column('users', 'monthly_generation_limit')
    op.drop_column('users', 'monthly_generation_count')
    op.drop_column('users', 'subscription_plan') 