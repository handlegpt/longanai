"""
Add is_admin column to users table
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.false()))

def downgrade():
    op.drop_column('users', 'is_admin') 