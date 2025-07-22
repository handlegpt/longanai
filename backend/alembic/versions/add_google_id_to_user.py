"""add google_id to user

Revision ID: add_google_id_to_user
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_google_id_to_user'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('google_id', sa.String(length=128), unique=True, nullable=True))

def downgrade():
    op.drop_column('users', 'google_id') 