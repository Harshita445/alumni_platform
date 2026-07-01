# Database Schema

Last audited: 2026-07-01.

The active ORM models are SQLAlchemy models in `backend/app/models`. Tables are created by `Base.metadata.create_all(bind=engine)` in `backend/app/main.py`.

## Active Database Connection

- Active connection string: `sqlite:///./app.db` from `backend/app/core/config.py`.

## Current Status (2026-07-01)

Completed:
- The core auth-related user fields are present and used by the login, Google auth, and verification flows.
- The schema supports pending alumni verification via `is_pending_verification` and `is_verified`.
- Alembic migration scaffolding exists under `backend/alembic/` with an initial migration file.

Still pending:
- The Alembic migration chain should be run in a real environment to apply the schema instead of relying on startup table creation.
- Production database settings, backup strategy, and connection pooling still need to be configured.
- Additional indexes and constraints can be added later if the dataset grows.

Additional implementation notes:
- `backend/app/database.py` reads `settings.DATABASE_URL` for the active SQLAlchemy engine.
- SQLite `check_same_thread=False` is configured.

## users

Defined in `backend/app/models/user.py`.

| Column | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | Integer | Primary key, indexed |
| `email` | String | Unique, required, indexed |
| `hashed_password` | String | Required |
| `role` | String | Required; current enum values are `student` and `alumni` |
| `auth_provider` | String | Defaults to `email`; used for Google-based sign-ins |
| `provider_id` | String | Nullable; stores the Google subject id |
| `display_name` | String | Nullable; stores the Google display name |
| `is_verified` | Boolean | Defaults to `False`; auto-true for Thapar-domain Google sign-ins and direct email registrations |
| `is_pending_verification` | Boolean | Defaults to `False`; used for alumni personal-account Google sign-ins awaiting admin approval |

Important auth behavior:

- `auth_provider='email'` is used for standard email/password sign-ups and logins.
- `auth_provider='google'` is used for Google-based sign-ins.
- A personal Google account for an alumni user is created with `is_verified=False` and `is_pending_verification=True` until an admin approves it.

Security notes:

- Profile updates are constrained by role to prevent students from setting alumni-only fields.
- Search and pagination parameters are trimmed and capped to reduce abuse of list endpoints.
| `created_at` | DateTime | Server default `now()` |

Relationships:

- One-to-one `profile` relationship to `profiles`.
- Booking relationships are effectively supplied by `Booking.student` and `Booking.alumni` backrefs.
- Availability slots are supplied by the `Availability.alumni` backref `availability_slots`.
- `student_bookings` and `alumni_bookings` relationship declarations appear at module level in `user.py`, not inside the `User` class, so they do not define class attributes there.

## profiles

Defined in `backend/app/models/profile.py`.

| Column | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | Integer | Primary key, indexed |
| `user_id` | Integer | Unique, required, foreign key to `users.id` |
| `full_name` | String | Nullable |
| `branch` | String | Nullable |
| `graduation_year` | Integer | Nullable |
| `company` | String | Nullable; alumni-only in route behavior |
| `designation` | String | Nullable; alumni-only in route behavior |
| `bio` | Text | Nullable |
| `linkedin_url` | String | Nullable |

Relationships:

- Belongs to `User` through `user`.

Important behavior:

- `GET /profile/me` creates a blank profile automatically if missing.
- Student updates drop `company` and `designation`.
- Alumni list/detail endpoints read alumni data from this table.

## bookings

Defined in `backend/app/models/booking.py`.

| Column | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | Integer | Primary key, indexed |
| `student_id` | Integer | Required, foreign key to `users.id` |
| `alumni_id` | Integer | Required, foreign key to `users.id` |
| `session_type` | String | Required |
| `date` | Date | Required; SQLAlchemy Date type (YYYY-MM-DD in database) |
| `time` | Time | Required; SQLAlchemy Time type (HH:MM:SS in database) |
| `status` | String | Required; defaults to `pending` |
| `created_at` | DateTime | Server default `now()` |

**Date/Time Type Migration (2026-06-22)**:
- Both `date` and `time` columns were previously `String` type.
- Converted to native `Date` and `Time` SQLAlchemy types for better type safety.
- Backend serialization uses ISO format strings (YYYY-MM-DD and HH:MM).
- **Backward compatibility maintained**: Pydantic validators accept both string and native type inputs with `mode="before"`.
- Existing databases with string values need migration; see `alembic/versions/001_initial_migration.py` for schema.

Allowed status values:

- `pending`
- `upcoming`
- `completed`
- `cancelled`
- `rejected`

Relationships:

- `student` points to a `User` through `student_id`.
- `alumni` points to a `User` through `alumni_id`.
- Backrefs create `student_bookings` and `alumni_bookings` on `User`.

Important behavior:

- Students create bookings.
- Alumni accept/reject/complete bookings.
- Students cancel bookings.
- Booking creation rejects past date/time values.
- Booking creation requires a matching alumni availability slot.
- Booking creation treats sessions as 30 minutes when checking availability and conflicts.
- Booking creation rejects active overlapping `pending` or `upcoming` bookings for the same alumni/date.
- There is no meeting link column, no price column, and no payment table.

## availability

Defined in `backend/app/models/availability.py`.

| Column | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | Integer | Primary key, indexed |
| `alumni_id` | Integer | Required, indexed, foreign key to `users.id` |
| `day_of_week` | Integer | Nullable; 0-6 when present, Monday is 0 |
| `date` | Date | Nullable; date-specific availability |
| `start_time` | Time | Required |
| `end_time` | Time | Required |

Constraints:

- `ck_availability_day_or_date`: exactly one of `day_of_week` or `date` must be present.
- `ck_availability_day_of_week_range`: `day_of_week` must be between 0 and 6 when present.
- `ck_availability_time_order`: `start_time` must be before `end_time`.

Relationships:

- `alumni` points to `User` through `alumni_id`.
- Backref creates `availability_slots` on `User`.

Important behavior:

- Only alumni users can create availability slots through the route layer.
- Any authenticated user can read an alumni user's slots.
- Only the owner alumni can delete their slots.
- Booking validation checks both date-specific slots and weekly `day_of_week` slots.

## saved_alumni

Defined in `backend/app/models/saved_alumni.py`.

| Column | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | Integer | Primary key, indexed |
| `student_id` | Integer | Required, foreign key to `users.id` |
| `alumni_id` | Integer | Required, foreign key to `users.id` |

Constraints:

- Unique pair: `student_id`, `alumni_id`.

Relationships:

- `student` points to `User`.
- `alumni` points to `User`.

## notifications

Defined in `backend/app/models/notification.py`.

| Column | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | Integer | Primary key, indexed |
| `user_id` | Integer | Required, foreign key to `users.id` |
| `booking_id` | Integer | Nullable, foreign key to `bookings.id` |
| `message` | String | Required |
| `is_read` | Boolean | Defaults to `False` |
| `created_at` | DateTime | Server default `now()` |

Relationships:

- `user` points to `User`.

Notification creation currently happens when:

- A student creates a booking request.
- An alumni accepts a booking.
- An alumni rejects a booking.
- A student cancels a booking.
- An alumni completes a booking.
- A student submits a review.

## reviews

Defined in `backend/app/models/review.py`.

| Column | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | Integer | Primary key |
| `booking_id` | Integer | Required, foreign key to `bookings.id` |
| `student_id` | Integer | Required, foreign key to `users.id` |
| `alumni_id` | Integer | Required, foreign key to `users.id` |
| `rating` | Integer | Required; route enforces 1-5 |
| `comment` | String | Nullable |
| `created_at` | DateTime | Server default `now()` |

Constraints:

- `booking_id` is unique through `uq_booking_review`.

Relationships:

- `booking` points to `Booking`.

## Inactive Or Questionable Model Files

- `backend/app/models/student_profile.py` exists but is not imported in `main.py`.
- `backend/app/models/alumni_profile.py` exists but is not imported in `main.py`.
- The active app appears to use the generic `Profile` model instead.

## Schema Work Left

- Decide whether to keep a single `profiles` table or split student/alumni-specific profile tables.
- Migrate existing databases from string date/time to native Date/Time types if data exists.
- Use Alembic for future schema changes instead of manual DDL.
- Implement email verification token storage if email verification flow is added.
- Add password reset token storage for password recovery flow.
- Consider adding meeting links if sessions are conducted inside external meeting tools.
- Add payment/pricing tables only if paid sessions are in scope.
- Add rate limiting/throttling for production security.

## Alembic Migrations

Setup is complete in `backend/alembic/`:

- **Location**: `backend/alembic/` directory with `env.py`, `script.py.mako`, and `versions/` subdirectory.
- **Configuration**: `backend/alembic.ini` points to `backend/` as the root.
- **Database URL**: Read from `app.core.config.settings.DATABASE_URL` in `env.py`.
- **Initial Migration**: `backend/alembic/versions/001_initial_migration.py` contains all current tables with proper constraints.
- **Status**: Infrastructure ready; tables still created at startup via `Base.metadata.create_all()` (not via Alembic).
- **Future**: Once existing database has been initialized, future schema changes should use Alembic migrations.

To run migrations once data is in place:

```bash
alembic upgrade head
```

To generate a new migration after model changes:

```bash
alembic revision --autogenerate -m "Description of changes"
```
