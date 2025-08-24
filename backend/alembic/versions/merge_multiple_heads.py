"""merge multiple heads

Revision ID: merge_multiple_heads
Revises: add_language_field_to_podcasts, merge_heads
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'merge_multiple_heads'
down_revision = ('add_language_field_to_podcasts', 'merge_heads')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
