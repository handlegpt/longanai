"""Add language field to podcasts

Revision ID: add_language_field_to_podcasts
Revises: add_user_profile_fields
Create Date: 2025-01-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_language_field_to_podcasts'
down_revision = 'add_user_profile_fields'
branch_labels = None
depends_on = None

def upgrade():
    # Add language field to podcasts table
    op.add_column('podcasts', sa.Column('language', sa.String(20), nullable=True, server_default='cantonese'))

def downgrade():
    # Remove language field
    op.drop_column('podcasts', 'language') 