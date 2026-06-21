# API Contracts

Last audited: 2026-06-21.

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

- Tokens are returned from `/auth/register` and `/auth/login`.
- Protected requests require `Authorization: Bearer <access_token>`.
- The frontend stores token data in localStorage under `current-user`.
- The backend does not currently use HTTP-only cookies.
- The backend does not currently enforce email verification.

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

Success response:

```json
{
  "access_token": "jwt",
  "token_type": "bearer"
}
```

Known gaps:

- No full name in registration payload.
- No email verification token.
- No college id.
- No graduation year in registration payload.
- No password complexity rule beyond being a string.

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

Error response:

```json
{
  "detail": "Invalid credentials"
}
```

Known gap:

- `is_verified` is not checked.

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

Returns all alumni profiles matching optional filters.

Query parameters:

| Parameter | Type | Notes |
| --- | --- | --- |
| `company` | string | Case-insensitive contains filter |
| `branch` | string | Case-insensitive contains filter |
| `graduation_year` | integer | Exact match |
| `search` | string | Searches full name, company, designation, and bio |

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
    "linkedin_url": "https://linkedin.com/in/example"
  }
]
```

Known gaps:

- No pagination.
- No rating fields.
- No session type fields.
- No paid/free fields.
- Frontend currently fetches all alumni and filters client-side.

### GET /alumni/{alumni_id}

Does not currently require bearer token.

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
  "linkedin_url": "https://linkedin.com/in/example"
}
```

Known bug:

- Missing alumni/profile is not handled; the route can crash by reading fields from `None`.

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

- No availability check.
- No conflict check.
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

Known gap:

- `rating` is not validated to 1-5.

### GET /reviews/alumni/{alumni_id}

Returns all reviews for an alumni user.

Response shape is raw ORM-shaped JSON from FastAPI serialization, not a dedicated response schema.

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
- Alumni availability endpoints.
- Admin endpoints.
- Payment endpoints.
- Meeting-link endpoints.
- Password reset endpoints.
