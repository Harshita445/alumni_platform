# API Contracts

Last audited: 2026-07-01.

The active backend is a FastAPI app in `backend/app/main.py`. Routes are mounted directly on the app. There is currently no `/api/v1` prefix.

## Base URL

Local frontend default:

```text
http://localhost:8000
```

Frontend override:

```text
NEXT_PUBLIC_API_URL
```

## Authentication

Current implementation uses JWT bearer tokens.

### Status as of 2026-07-01

Completed:
- Email/password registration and login are working end to end.
- Google social login is wired for students and alumni.
- Alumni personal-account sign-ups can be placed into pending verification and approved by an admin.
- Approval emails are triggered when SMTP settings are configured.
- Backend validation now checks Google token audience, issuer, expiry, and email verification claims.

Still pending:
- A real Google OAuth client ID must be configured in the frontend and backend environment files.
- SMTP credentials must be configured for approval emails to be delivered.
- A full browser-based end-to-end test still needs to be run with the real credentials.
- A stronger server-side Google ID-token verification flow can be added later if required.

- Tokens are returned from `/auth/register` and `/auth/login`.
- Protected requests require `Authorization: Bearer <access_token>`.
- The frontend stores token data in localStorage under `current-user`.
- The backend does not currently use HTTP-only cookies.
- **Email verification is now enforced**: Users must have `is_verified=True` to log in. If not verified, login returns 403.
- Password complexity is enforced at registration time.
- Google social sign-in is now supported from the frontend via the Google Identity Services SDK. The frontend requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to be set.
- Route-level validation and authorization checks were tightened for profile updates, booking creation, saved-alumni actions, and alumni list filters.

## Common Error Shape

FastAPI errors usually return:

```json
{
  "detail": "Error message"
}
```

Validation errors use FastAPI/Pydantic's default 422 response shape.

## Root

### GET /

Returns API health.

Response:

```json
{
  "message": "API is running"
}
```

## Auth

Routes defined in `backend/app/routes/auth.py`.

### GET /auth/health

Response:

```json
{
  "status": "ok"
}
```

### POST /auth/register

Registers a user and returns a bearer token.

Request body:

```json
{
  "email": "student_be24@thapar.edu",
  "password": "password",
  "role": "student"
}
```

Allowed roles:

- `student`
- `alumni`

Backend validation:

- `email` must be a valid email.
- `role` must match the `UserRole` enum.
- Duplicate email returns 400.
- Student role requires email ending with `@thapar.edu`.
- **Password must meet complexity requirements** (configurable in `backend/app/core/config.py`):
  - Minimum 8 characters (PASSWORD_MIN_LENGTH)
  - At least one uppercase letter (PASSWORD_REQUIRE_UPPERCASE)
  - At least one number (PASSWORD_REQUIRE_NUMBERS)
  - At least one special character from `!@#$%^&*(),.?":{}|<>` (PASSWORD_REQUIRE_SPECIAL)
  - If any requirement fails, returns 422 with validation error

Success response:

```json
{
  "access_token": "jwt",
  "token_type": "bearer"
}
```

Known gaps:

- No full name is required in the registration payload; the profile can be filled later.
- Email confirmation tokens are not yet implemented; the current flow relies on manual/admin verification for alumni.
- No college id is collected in the current registration flow.
- No graduation year is required in the registration payload; it is typically added via profile updates.

### POST /auth/login

Authenticates a user and returns a bearer token.

Content type:

```text
application/x-www-form-urlencoded
```

Fields:

```text
username=user@example.com
password=password
```

Success response:

```json
{
  "access_token": "jwt",
  "token_type": "bearer"
}
```

Error responses:

Invalid credentials:

```json
{
  "detail": "Invalid credentials"
}
```

Email not verified:

```json
{
  "detail": "Email not verified. Please verify your email before logging in."
}
```

Status code: 403 Forbidden if email not verified, 401 Unauthorized if invalid credentials.

**IMPORTANT**: Users with `is_verified=False` cannot log in. Email verification flow not yet implemented.

### POST /auth/google

Handles Google-based sign-in/sign-up. The frontend sends the Google ID token; the backend extracts the email, name, and provider id from it and applies the role-specific rules below.

Frontend requirement:

```text
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google_oauth_client_id>

# Backend env
GOOGLE_CLIENT_ID=<same_google_oauth_client_id>
ADMIN_API_KEY=<secure-admin-key>
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USERNAME=<smtp-username>
SMTP_PASSWORD=<smtp-password>
SMTP_FROM_EMAIL=<from-address>
```

Request body:

```json
{
  "role": "student",
  "id_token": "google_id_token",
  "email": "optional_email_override",
  "name": "optional_display_name",
  "provider_id": "optional_provider_id"
}
```

Rules:

- Students can only use a Thapar Gmail account for Google sign-in.
- Alumni can use either a Thapar account or a personal Google account.
- Alumni using a personal Google account are created as pending verification users and cannot sign in until an admin approves them.
- Thapar-domain alumni and all students are auto-approved on first Google sign-in.

Successful response:

```json
{
  "access_token": "jwt",
  "token_type": "bearer",
  "status": "verified",
  "requires_admin_review": false
}
```

Pending review response:

```json
{
  "detail": "Your alumni account is pending admin verification."
}
```

Frontend behavior:

- The login and registration pages call this endpoint after a successful Google sign-in prompt.
- A successful response stores the JWT and redirects the user to the dashboard.
- A pending-verification response surfaces the message to the user so alumni using a personal Google account know they must wait for approval.

### POST /auth/admin/verify

Admin-only endpoint used to approve pending alumni accounts.

Headers:

```text
X-Admin-Key: <admin_secret>
```

Query params:

```text
user_id=42
```

### GET /auth/me

Requires bearer token.

Success response:

```json
{
  "id": 1,
  "email": "student_be24@thapar.edu",
  "role": "student"
}
```

## Profile

Routes defined in `backend/app/routes/profile.py`.

### GET /profile/me

Requires bearer token.

Creates a blank profile if none exists.

Student response shape:

```json
{
  "id": 1,
  "user_id": 1,
  "full_name": "Student Name",
  "branch": "Computer Science",
  "graduation_year": 2028,
  "bio": "Short bio",
  "linkedin_url": "https://linkedin.com/in/example"
}
```

Alumni response shape includes alumni-specific fields:

```json
{
  "id": 2,
  "user_id": 2,
  "full_name": "Alumni Name",
  "branch": "Computer Science",
  "graduation_year": 2020,
  "company": "Google",
  "designation": "Software Engineer",
  "bio": "Short bio",
  "linkedin_url": "https://linkedin.com/in/example"
}
```

### PUT /profile/me

Requires bearer token.

Request body accepts any subset:

```json
{
  "full_name": "Alumni Name",
  "branch": "Computer Science",
  "graduation_year": 2020,
  "company": "Google",
  "designation": "Software Engineer",
  "bio": "Short bio",
  "linkedin_url": "https://linkedin.com/in/example"
}
```

Student users cannot update `company` or `designation`; those fields are dropped server-side.

## Alumni

Routes defined in `backend/app/routes/alumni.py`.

### GET /alumni/

Requires bearer token.

Returns all alumni profiles matching optional filters, with pagination support.

Query parameters:

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `page` | integer | 1 | Page number (1-indexed); values < 1 default to 1 |
| `limit` | integer | 10 | Results per page; values < 1 default to 10 |
| `company` | string | - | Case-insensitive contains filter |
| `branch` | string | - | Case-insensitive contains filter |
| `graduation_year` | integer | - | Exact match |
| `search` | string | - | Searches full_name, company, designation, and bio |

Pagination example:

```text
GET /alumni/?page=1&limit=10&company=Google
```

Success response:

```json
[
  {
    "id": 2,
    "full_name": "Alumni Name",
    "branch": "Computer Science",
    "graduation_year": 2020,
    "company": "Google",
    "designation": "Software Engineer",
    "bio": "Short bio",
    "linkedin_url": "https://linkedin.com/in/example",
    "profile_image": null
  }
]
```

Backward compatibility:

- Omitting `page` and `limit` defaults to first 10 results.
- Existing clients using filter parameters without pagination continue to work.

Known gaps:

- No rating fields.
- No session type fields.
- No paid/free fields.

### GET /alumni/{alumni_id}

Requires bearer token.

Success response:

```json
{
  "id": 2,
  "full_name": "Alumni Name",
  "branch": "Computer Science",
  "graduation_year": 2020,
  "company": "Google",
  "designation": "Software Engineer",
  "bio": "Short bio",
  "linkedin_url": "https://linkedin.com/in/example",
  "profile_image": null
}
```

Missing alumni/profile returns 404.

## Bookings

Routes defined in `backend/app/routes/bookings.py`.

### GET /bookings/health

Response:

```json
{
  "status": "ok"
}
```

### POST /bookings/

Requires bearer token.

Only students can create bookings.

Date/Time Format (2026-06-22 update):

- Backend now uses native SQLAlchemy Date and Time types for type safety.
- Request format unchanged: `date` (YYYY-MM-DD), `time` (HH:MM).
- Response serializes Date/Time to ISO format strings.
- Backward compatibility maintained for string inputs.

Validation:

- Selected user must exist and have role `alumni`.
- `date` must use `YYYY-MM-DD`.
- `time` must use `HH:MM`.
- Booking time must be in the future.
- Selected time must fit inside an alumni availability slot.
- Availability can match either the specific selected date or the selected weekday.
- Bookings are treated as 30-minute sessions for availability and overlap validation.
- Existing `pending` or `upcoming` bookings block overlapping intervals for the same alumni/date.

Request body:

```json
{
  "alumni_id": 2,
  "session_type": "Resume Review",
  "date": "2026-06-21",
  "time": "14:30"
}
```

Success response:

```json
{
  "id": 1,
  "student_id": 1,
  "alumni_id": 2,
  "session_type": "Resume Review",
  "date": "2026-06-21",
  "time": "14:30",
  "status": "pending",
  "created_at": "2026-06-21T12:00:00"
}
```

Side effect:

- Creates a notification for the alumni user.

Known gaps:

- No meeting link.
- No payment.

### GET /bookings/me

Requires bearer token.

Returns bookings where the current user is either the student or alumni.

Response:

```json
[
  {
    "id": 1,
    "student_id": 1,
    "alumni_id": 2,
    "session_type": "Resume Review",
    "date": "2026-06-21",
    "time": "14:30",
    "status": "pending",
    "created_at": "2026-06-21T12:00:00"
  }
]
```

### GET /bookings/{booking_id}

Requires bearer token.

Only the booking student or alumni can view it.

### PATCH /bookings/{booking_id}

Requires bearer token.

Request body:

```json
{
  "status": "upcoming"
}
```

Allowed requested statuses:

- `upcoming`
- `rejected`
- `cancelled`
- `completed`

Rules:

- Cannot revert to `pending`.
- Only assigned alumni can accept pending bookings as `upcoming`.
- Only assigned alumni can reject pending bookings as `rejected`.
- Only the booking student can cancel pending/upcoming bookings.
- Only assigned alumni can mark upcoming bookings as `completed`.

Side effects:

- Status changes create notifications for the other party.

## Availability

Routes defined in `backend/app/routes/availability.py`.

### POST /availability/

Requires bearer token.

Only alumni can create availability slots. A slot must use exactly one of `day_of_week` or `date`.

Request body for weekly availability:

```json
{
  "day_of_week": 0,
  "start_time": "14:00",
  "end_time": "16:00"
}
```

Request body for date-specific availability:

```json
{
  "date": "2026-06-24",
  "start_time": "14:00",
  "end_time": "16:00"
}
```

Validation:

- `day_of_week` must be 0-6, where Python weekday semantics apply: Monday is 0 and Sunday is 6.
- `date` uses Pydantic date parsing, normally `YYYY-MM-DD`.
- `start_time` and `end_time` use Pydantic time parsing, normally `HH:MM` or `HH:MM:SS`.
- `start_time` must be before `end_time`.
- Exactly one of `day_of_week` or `date` must be present.

Success response:

```json
{
  "id": 1,
  "alumni_id": 2,
  "day_of_week": 0,
  "date": null,
  "start_time": "14:00:00",
  "end_time": "16:00:00"
}
```

### GET /availability/{alumni_id}

Requires bearer token.

Returns availability slots for an alumni user. Missing or non-alumni users return 404.

Response:

```json
[
  {
    "id": 1,
    "alumni_id": 2,
    "day_of_week": 0,
    "date": null,
    "start_time": "14:00:00",
    "end_time": "16:00:00"
  }
]
```

### DELETE /availability/{availability_id}

Requires bearer token.

Only the owner alumni can delete their own slot.

Success response:

```text
204 No Content
```

## Saved Alumni

Routes defined in `backend/app/routes/saved.py`.

### POST /saved/{alumni_id}

Requires bearer token.

Only students can save alumni.

Success response:

```json
{
  "message": "Alumni saved successfully"
}
```

Duplicate response:

```json
{
  "message": "Already saved"
}
```

### DELETE /saved/{alumni_id}

Requires bearer token.

Removes a saved alumni record for the current user.

Success response:

```json
{
  "message": "Removed successfully"
}
```

### GET /saved/me

Requires bearer token.

Response:

```json
[
  {
    "id": 2,
    "full_name": "Alumni Name",
    "company": "Google",
    "designation": "Software Engineer"
  }
]
```

## Reviews

Routes defined in `backend/app/routes/reviews.py`.

### POST /reviews/

Requires bearer token.

Only the booking student can review, and only when booking status is `completed`.

Request body:

```json
{
  "booking_id": 1,
  "rating": 5,
  "comment": "Helpful session."
}
```

Success response:

```json
{
  "message": "Review submitted"
}
```

Validation:

- `rating` must be between 1 and 5.
- The current user must be the booking student.
- The booking must be completed.
- Duplicate reviews for the same `booking_id` are rejected.

Side effect:

- Creates a notification for the alumni user.

### GET /reviews/alumni/{alumni_id}

Returns all reviews for an alumni user.

Response shape is raw ORM-shaped JSON from FastAPI serialization, not a dedicated response schema.

Typical response:

```json
[
  {
    "id": 1,
    "booking_id": 1,
    "student_id": 1,
    "alumni_id": 2,
    "rating": 5,
    "comment": "Helpful session.",
    "created_at": "2026-06-21T12:00:00"
  }
]
```

## Dashboard

Routes defined in `backend/app/routes/dashboard.py`.

### GET /dashboard/student

Requires bearer token.

Only students can access.

Response:

```json
{
  "pending_requests": 1,
  "upcoming_sessions": 2,
  "completed_sessions": 3,
  "saved_alumni": 4,
  "recent_bookings": [
    {
      "id": 1,
      "name": "Alumni Name",
      "date": "2026-06-21",
      "time": "14:30",
      "status": "pending"
    }
  ]
}
```

### GET /dashboard/alumni

Requires bearer token.

Only alumni can access.

Response:

```json
{
  "pending_requests": 1,
  "upcoming_sessions": 2,
  "completed_sessions": 3,
  "total_students_helped": 4,
  "recent_bookings": [
    {
      "id": 1,
      "name": "Student Name",
      "date": "2026-06-21",
      "time": "14:30",
      "status": "pending"
    }
  ]
}
```

## Notifications

Routes defined in `backend/app/routes/notifications.py`.

### GET /notifications/me

Requires bearer token.

Returns current-user notifications ordered newest first.

Response:

```json
[
  {
    "id": 1,
    "user_id": 2,
    "booking_id": 1,
    "message": "New booking request from student@example.com for 2026-06-21 at 14:30.",
    "is_read": false,
    "created_at": "2026-06-21T12:00:00"
  }
]
```

### PATCH /notifications/{notification_id}/read

Requires bearer token.

Only the notification owner can mark it read.

Response:

```json
{
  "id": 1,
  "user_id": 2,
  "booking_id": 1,
  "message": "Message",
  "is_read": true,
  "created_at": "2026-06-21T12:00:00"
}
```

## Not Implemented Yet

- `/api/v1` route prefix.
- Cookie auth.
- `POST /auth/logout`.
- `POST /auth/verify-email`.
- `GET /users/me`.
- `/colleges`.
- Admin endpoints.
- Payment endpoints.
- Meeting-link endpoints.
- Password reset endpoints.
