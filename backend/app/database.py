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


def _ensure_profiles_cascade_fk(connection) -> None:
    foreign_keys = connection.execute(text("PRAGMA foreign_key_list('profiles')")).fetchall()
    if any(row[6] == "CASCADE" for row in foreign_keys):
        return

    connection.execute(text("PRAGMA foreign_keys=OFF"))
    connection.execute(text("ALTER TABLE profiles RENAME TO profiles_legacy"))
    connection.execute(
        text(
            """
            CREATE TABLE profiles (
                id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                full_name VARCHAR,
                branch VARCHAR,
                graduation_year INTEGER,
                company VARCHAR,
                designation VARCHAR,
                bio TEXT,
                linkedin_url VARCHAR,
                profile_picture_url VARCHAR,
                profile_picture_public_id VARCHAR,
                resume_url VARCHAR,
                resume_public_id VARCHAR,
                skills JSON,
                career_interests JSON,
                goals TEXT,
                target_companies JSON,
                desired_roles JSON,
                expertise JSON,
                mentorship_services JSON,
                PRIMARY KEY (id),
                UNIQUE (user_id),
                FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
            )
            """
        )
    )
    connection.execute(
        text(
            """
            INSERT INTO profiles (
                id, user_id, full_name, branch, graduation_year, company, designation, bio,
                linkedin_url, profile_picture_url, profile_picture_public_id, resume_url,
                resume_public_id, skills, career_interests, goals, target_companies,
                desired_roles, expertise, mentorship_services
            )
            SELECT
                id, user_id, full_name, branch, graduation_year, company, designation, bio,
                linkedin_url, profile_picture_url, profile_picture_public_id, resume_url,
                resume_public_id, skills, career_interests, goals, target_companies,
                desired_roles, expertise, mentorship_services
            FROM profiles_legacy
            """
        )
    )
    connection.execute(text("DROP TABLE profiles_legacy"))
    connection.execute(text("PRAGMA foreign_keys=ON"))


def _ensure_notifications_cascade_fk(connection) -> None:
    foreign_keys = connection.execute(text("PRAGMA foreign_key_list('notifications')")).fetchall()
    if any(row[3] == "user_id" and row[6] == "CASCADE" for row in foreign_keys):
        return

    connection.execute(text("PRAGMA foreign_keys=OFF"))
    connection.execute(text("ALTER TABLE notifications RENAME TO notifications_legacy"))
    connection.execute(
        text(
            """
            CREATE TABLE notifications (
                id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                booking_id INTEGER,
                message VARCHAR NOT NULL,
                is_read BOOLEAN,
                created_at DATETIME,
                PRIMARY KEY (id),
                FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY(booking_id) REFERENCES bookings (id)
            )
            """
        )
    )
    connection.execute(
        text(
            """
            INSERT INTO notifications (id, user_id, booking_id, message, is_read, created_at)
            SELECT id, user_id, booking_id, message, is_read, created_at
            FROM notifications_legacy
            """
        )
    )
    connection.execute(text("DROP TABLE notifications_legacy"))
    connection.execute(text("PRAGMA foreign_keys=ON"))


def ensure_schema() -> None:
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())

    if "users" not in table_names or "profiles" not in table_names:
        Base.metadata.create_all(bind=engine)

    with engine.begin() as connection:
        if "profiles" in table_names:
            _ensure_profiles_cascade_fk(connection)
        if "notifications" in table_names:
            _ensure_notifications_cascade_fk(connection)
        if "users" in table_names:
            existing_columns = {column["name"] for column in inspector.get_columns("users")}
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
            if "avatar" not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN avatar VARCHAR"))
            if "refresh_token_hash" not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN refresh_token_hash VARCHAR"))
            if "last_login" not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN last_login DATETIME"))
            if "updated_at" not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN updated_at DATETIME"))
            if "onboarding_completed" not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0"))
            if "verification_status" not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN verification_status VARCHAR DEFAULT 'approved'"))
            if "approved_by" not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN approved_by INTEGER"))
            if "approved_at" not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN approved_at DATETIME"))
            if "verification_reason" not in existing_columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN verification_reason TEXT"))

        if "profiles" in table_names:
            existing_profile_columns = {column["name"] for column in inspector.get_columns("profiles")}
            if "skills" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN skills JSON"))
            if "career_interests" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN career_interests JSON"))
            if "goals" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN goals TEXT"))
            if "target_companies" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN target_companies JSON"))
            if "desired_roles" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN desired_roles JSON"))
            if "expertise" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN expertise JSON"))
            if "mentorship_services" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN mentorship_services JSON"))
            if "profile_picture_url" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN profile_picture_url VARCHAR"))
            if "profile_picture_public_id" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN profile_picture_public_id VARCHAR"))
            if "resume_url" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN resume_url VARCHAR"))
            if "resume_public_id" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN resume_public_id VARCHAR"))
            if "degree" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN degree VARCHAR"))
            if "department" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN department VARCHAR"))
            if "phone_number" not in existing_profile_columns:
                connection.execute(text("ALTER TABLE profiles ADD COLUMN phone_number VARCHAR"))

        if "bookings" in table_names:
            existing_booking_columns = {column["name"] for column in inspector.get_columns("bookings")}
            if "message" not in existing_booking_columns:
                connection.execute(text("ALTER TABLE bookings ADD COLUMN message VARCHAR"))
            if "timezone" not in existing_booking_columns:
                connection.execute(text("ALTER TABLE bookings ADD COLUMN timezone VARCHAR"))
            if "meeting_link" not in existing_booking_columns:
                connection.execute(text("ALTER TABLE bookings ADD COLUMN meeting_link VARCHAR"))
            if "status_history" not in existing_booking_columns:
                connection.execute(text("ALTER TABLE bookings ADD COLUMN status_history JSON"))


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
