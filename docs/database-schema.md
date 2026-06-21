# Database Schema

Last audited: 2026-06-21.

The active ORM models are SQLAlchemy models in `backend/app/models`. Tables are created by `Base.metadata.create_all(bind=engine)` in `backend/app/main.py`.

## Active Database Connection

- Active connection string: `sqlite:///./app.db` from `backend/app/database.py`.
- `backend/app/core/config.py` defines `DATABASE_URL = sqlite:///./alumni.db`, but this setting is not used by the active SQLAlchemy engine.
- SQLite `check_same_thread=False` is configured.
- No Alembic migration folder is present even though Alembic is installed in `requirements.txt`.

## users

Defined in `backend/app/models/user.py`.

| Column | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | Integer | Primary key, indexed |
| `email` | String | Unique, required, indexed |
| `hashed_password` | String | Required |
| `role` | String | Required; current enum values are `student` and `alumni` |
| `is_verified` | Boolean | Defaults to `False`; currently not enforced during login |
| `created_at` | DateTime | Server default `now()` |

Relationships:

- One-to-one `profile` relationship to `profiles`.
- Booking relationships are effectively supplied by `Booking.student` and `Booking.alumni` backrefs.
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
| `date` | String | Required; not a Date column |
| `time` | String | Required; not a Time column |
| `status` | String | Required; defaults to `pending` |
| `created_at` | DateTime | Server default `now()` |

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
- There is no availability table, no meeting link column, no price column, and no payment table.

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
| `rating` | Integer | Required; route currently does not enforce 1-5 |
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
- Use `settings.DATABASE_URL` in `database.py`.
- Add migrations before production data exists.
- Use real date/time types for booking scheduling or document the string format strictly.
- Add availability tables if alumni should manage bookable slots.
- Add meeting links if sessions are conducted inside external meeting tools.
- Add payment/pricing tables only if paid sessions are in scope.
- Add review rating constraints at model and route level.
- Decide whether `is_verified` should be enforced and add verification token storage if needed.
