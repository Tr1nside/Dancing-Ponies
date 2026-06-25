"""add reactions table

Revision ID: a1b2c3d4e5f6
Revises: d1fc68ca6464
Create Date: 2026-06-25 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "d1fc68ca6464"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "reactions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("emoji", sa.String(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("target_type", sa.String(), nullable=False),
        sa.Column("target_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "user_id", "target_type", "target_id", name="uq_user_target"
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("reactions")
