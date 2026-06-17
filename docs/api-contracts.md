# API Contracts

## Base URL

### Local Development

```text
http://localhost:8000/api/v1
```

### Production

```text
https://api.yourdomain.com/api/v1
```


## Authentication

Authentication uses JWT access tokens stored in HTTP-only cookies.

Protected routes require authentication.

User roles:

* `student`
* `alumni`
* `admin`

---

# Health Check

## GET /

### Description

Verify that the API is running.

### Response

```json
{
  "message": "API running"
}
```

---

# Authentication Endpoints

## POST /auth/register

### Description

Register a new user.

### Request Body

```json
{
  "full_name": "John Doe",
  "email": "john@iitd.ac.in",
  "password": "StrongPassword123!",
  "role": "student",
  "college_id": 1,
  "graduation_year": 2027
}
```

### Validation Rules

* `full_name`: required
* `email`: required, valid email
* `password`: minimum 8 characters
* `role`: student or alumni
* `college_id`: required
* `graduation_year`: required

### Success Response

**201 Created**

```json
{
  "message": "Registration successful. Please verify your email."
}
```

### Error Responses

**400 Bad Request**

```json
{
  "detail": "Invalid request data"
}
```

**409 Conflict**

```json
{
  "detail": "Email already registered"
}
```

---

## POST /auth/login

### Description

Authenticate a user.

### Request Body

```json
{
  "email": "john@iitd.ac.in",
  "password": "StrongPassword123!"
}
```

### Success Response

**200 OK**

```json
{
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@iitd.ac.in",
    "role": "student",
    "is_verified": true
  }
}
```

### Error Responses

**401 Unauthorized**

```json
{
  "detail": "Invalid credentials"
}
```

**403 Forbidden**

```json
{
  "detail": "Email not verified"
}
```

---

## POST /auth/logout

### Description

Log out the current user.

### Success Response

**200 OK**

```json
{
  "message": "Logged out successfully"
}
```

---

## POST /auth/verify-email

### Description

Verify user email using a verification token.

### Request Body

```json
{
  "token": "verification_token"
}
```

### Success Response

**200 OK**

```json
{
  "message": "Email verified successfully"
}
```

### Error Responses

**400 Bad Request**

```json
{
  "detail": "Invalid or expired token"
}
```

---

## GET /users/me

### Description

Return the currently authenticated user.

### Success Response

**200 OK**

```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@iitd.ac.in",
  "role": "student",
  "is_verified": true,
  "college": {
    "id": 1,
    "name": "IIT Delhi"
  }
}
```

### Error Responses

**401 Unauthorized**

```json
{
  "detail": "Not authenticated"
}
```

---

# College Endpoints

## GET /colleges

### Description

Return all colleges.

### Success Response

**200 OK**

```json
[
  {
    "id": 1,
    "name": "IIT Delhi",
    "domain": "iitd.ac.in"
  },
  {
    "id": 2,
    "name": "Stanford University",
    "domain": "stanford.edu"
  }
]
```

---

# Alumni Endpoints

## GET /alumni

### Description

Return a paginated list of alumni.

### Query Parameters

| Parameter    | Type    | Example         |
| ------------ | ------- | --------------- |
| college_id   | integer | 1               |
| company      | string  | Google          |
| position     | string  | Product Manager |
| session_type | string  | resume_review   |
| min_rating   | float   | 4.5             |
| is_paid      | boolean | true            |
| page         | integer | 1               |
| limit        | integer | 20              |

### Example

```text
GET /alumni?company=Google&position=Software Engineer&page=1&limit=20
```

### Success Response

**200 OK**

```json
{
  "items": [
    {
      "id": 10,
      "full_name": "Sarah Chen",
      "college": "Stanford University",
      "company": "Google",
      "position": "Product Manager",
      "rating": 4.9,
      "hourly_rate": 500,
      "profile_photo": "https://example.com/photo.jpg"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

## GET /alumni/{alumni_id}

### Description

Return a single alumni profile.

### Success Response

**200 OK**

```json
{
  "id": 10,
  "full_name": "Sarah Chen",
  "college": "Stanford University",
  "graduation_year": 2019,
  "company": "Google",
  "position": "Product Manager",
  "bio": "Helping students break into product management.",
  "rating": 4.9,
  "review_count": 24,
  "hourly_rate": 500,
  "session_types": [
    "resume_review",
    "mock_interview",
    "career_guidance"
  ]
}
```

### Error Responses

**404 Not Found**

```json
{
  "detail": "Alumni not found"
}
```

---

# Availability Endpoints

## GET /alumni/{alumni_id}/availability

### Description

Return available time slots.

### Success Response

**200 OK**

```json
[
  {
    "start_time": "2026-06-20T14:00:00Z",
    "end_time": "2026-06-20T14:30:00Z"
  },
  {
    "start_time": "2026-06-20T15:00:00Z",
    "end_time": "2026-06-20T15:30:00Z"
  }
]
```

---

# Booking Endpoints

## POST /bookings

### Description

Create a new booking.

### Request Body

```json
{
  "alumni_id": 10,
  "session_type": "resume_review",
  "scheduled_at": "2026-06-20T14:00:00Z"
}
```

### Success Response

**201 Created**

```json
{
  "id": 100,
  "status": "confirmed",
  "meeting_link": null,
  "scheduled_at": "2026-06-20T14:00:00Z"
}
```

### Error Responses

**409 Conflict**

```json
{
  "detail": "Time slot unavailable"
}
```

---

## GET /bookings

### Description

Return bookings for the authenticated user.

### Success Response

**200 OK**

```json
[
  {
    "id": 100,
    "alumni_name": "Sarah Chen",
    "session_type": "resume_review",
    "scheduled_at": "2026-06-20T14:00:00Z",
    "status": "confirmed"
  }
]
```

---

## GET /bookings/{booking_id}

### Description

Return booking details.

### Success Response

**200 OK**

```json
{
  "id": 100,
  "student_name": "John Doe",
  "alumni_name": "Sarah Chen",
  "session_type": "resume_review",
  "scheduled_at": "2026-06-20T14:00:00Z",
  "meeting_link": "https://meet.google.com/example",
  "status": "confirmed"
}
```

---

## PATCH /bookings/{booking_id}/cancel

### Description

Cancel a booking.

### Success Response

**200 OK**

```json
{
  "message": "Booking cancelled successfully"
}
```

---

# Review Endpoints

## POST /reviews

### Description

Create a review for a completed session.

### Request Body

```json
{
  "booking_id": 100,
  "rating": 5,
  "comment": "Very helpful session."
}
```

### Validation Rules

* Rating must be between 1 and 5
* Booking must belong to the user
* Booking status must be completed

### Success Response

**201 Created**

```json
{
  "message": "Review submitted successfully"
}
```

---

## GET /alumni/{alumni_id}/reviews

### Description

Return reviews for an alumni profile.

### Success Response

**200 OK**

```json
[
  {
    "student_name": "John Doe",
    "rating": 5,
    "comment": "Excellent guidance.",
    "created_at": "2026-06-20T15:00:00Z"
  }
]
```

---

# Admin Endpoints

## GET /admin/users

### Description

Return all users.

### Authorization

Admin only.

---

## PATCH /admin/users/{user_id}/verify

### Description

Verify an alumni account manually.

### Authorization

Admin only.

### Success Response

**200 OK**

```json
{
  "message": "User verified successfully"
}
```

---

# Common Error Format

All errors follow this structure.

```json
{
  "detail": "Error message"
}
```

---

# Status Codes

| Code | Meaning                 |
| ---- | ----------------------- |
| 200  | Success                 |
| 201  | Resource created        |
| 400  | Invalid request         |
| 401  | Authentication required |
| 403  | Permission denied       |
| 404  | Resource not found      |
| 409  | Conflict                |
| 422  | Validation error        |
| 500  | Internal server error   |

