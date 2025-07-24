"""
Add public fields to podcast table
Revision ID: 20240608_add_public_fields_to_podcast
Revises: 
Create Date: 2024-06-08
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('podcasts', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('podcasts', sa.Column('cover_image_url', sa.String(500), nullable=True))
    op.add_column('podcasts', sa.Column('user_email', sa.String(100), nullable=False, index=True))
    op.add_column('podcasts', sa.Column('tags', sa.String(200), nullable=True))
    op.add_column('podcasts', sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.sql.expression.true()))

def downgrade():
    op.drop_column('podcasts', 'description')
    op.drop_column('podcasts', 'cover_image_url')
    op.drop_column('podcasts', 'user_email')
    op.drop_column('podcasts', 'tags')
    op.drop_column('podcasts', 'is_public') 