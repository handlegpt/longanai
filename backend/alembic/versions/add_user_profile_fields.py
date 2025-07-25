"""Add user profile fields

Revision ID: add_user_profile_fields
Revises: 
Create Date: 2025-01-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_user_profile_fields'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add user profile fields to users table
    op.add_column('users', sa.Column('display_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(500), nullable=True))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('preferred_voice', sa.String(50), nullable=True, server_default='young-lady'))
    op.add_column('users', sa.Column('preferred_language', sa.String(20), nullable=True, server_default='cantonese'))

def downgrade():
    # Remove user profile fields
    op.drop_column('users', 'preferred_language')
    op.drop_column('users', 'preferred_voice')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'display_name') 