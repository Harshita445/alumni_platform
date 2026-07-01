from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def ensure_schema() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        Base.metadata.create_all(bind=engine)
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}

    with engine.begin() as connection:
        if "auth_provider" not in existing_columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN auth_provider VARCHAR DEFAULT 'email'")
            )
        if "provider_id" not in existing_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN provider_id VARCHAR"))
        if "display_name" not in existing_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN display_name VARCHAR"))
        if "is_pending_verification" not in existing_columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN is_pending_verification BOOLEAN DEFAULT 0")
            )


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
