"""Add end-to-end auth fields

Revision ID: 002_auth_system_fields
Revises: 001
Create Date: 2026-07-06 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "002_auth_system_fields"
down_revision = "001"
branch_labels = None
depends_on = None


def _add_column_if_missing(table_name: str, column: sa.Column) -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {existing["name"] for existing in inspector.get_columns(table_name)}
    if column.name not in existing_columns:
        op.add_column(table_name, column)


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("hashed_password", existing_type=sa.String(), nullable=True)

    _add_column_if_missing("users", sa.Column("avatar", sa.String(), nullable=True))
    _add_column_if_missing("users", sa.Column("refresh_token_hash", sa.String(), nullable=True))
    _add_column_if_missing("users", sa.Column("last_login", sa.DateTime(timezone=True), nullable=True))
    _add_column_if_missing("users", sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True))
    _add_column_if_missing("users", sa.Column("onboarding_completed", sa.Boolean(), server_default="0", nullable=True))
    _add_column_if_missing("users", sa.Column("verification_status", sa.String(), server_default="approved", nullable=True))
    _add_column_if_missing("users", sa.Column("approved_by", sa.Integer(), nullable=True))
    _add_column_if_missing("users", sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True))
    _add_column_if_missing("users", sa.Column("verification_reason", sa.Text(), nullable=True))

    _add_column_if_missing("profiles", sa.Column("degree", sa.String(), nullable=True))
    _add_column_if_missing("profiles", sa.Column("department", sa.String(), nullable=True))
    _add_column_if_missing("profiles", sa.Column("phone_number", sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("profiles") as batch_op:
        batch_op.drop_column("phone_number")
        batch_op.drop_column("department")
        batch_op.drop_column("degree")

    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("verification_reason")
        batch_op.drop_column("approved_at")
        batch_op.drop_column("approved_by")
        batch_op.drop_column("verification_status")
        batch_op.drop_column("onboarding_completed")
        batch_op.drop_column("updated_at")
        batch_op.drop_column("last_login")
        batch_op.drop_column("refresh_token_hash")
        batch_op.drop_column("avatar")
        batch_op.alter_column("hashed_password", existing_type=sa.String(), nullable=False)
