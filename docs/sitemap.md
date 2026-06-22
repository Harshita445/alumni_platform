# Sitemap And Route Inventory

Last audited: 2026-06-21.

This file lists active frontend pages and backend routes found in the current codebase.

## Active Frontend Routes

Routes are under `frontend/src/app`.

| Route | File | Current Status |
| --- | --- | --- |
| `/` | `page.tsx` | Implemented landing/home page |
| `/login` | `login/page.tsx` | Implemented; live backend login |
| `/register` | `register/page.tsx` | Implemented role choice page |
| `/register/student` | `register/student/page.tsx` | Implemented; persists full name and derived graduation year |
| `/register/alumni` | `register/alumni/page.tsx` | Implemented; live backend registration/profile update |
| `/dashboard` | `dashboard/page.tsx` | Implemented; live backend dashboard data |
| `/search` | `search/page.tsx` | Implemented; live backend alumni fetch and client-side filters |
| `/search/loading` | `search/loading.tsx` | Implemented loading UI |
| `/profile` | `profile/page.tsx` | Implemented current-user profile from local auth storage; has TypeScript issue around `profile_image` |
| `/profile/[id]` | `profile/[id]/page.tsx` | Implemented alumni profile detail; client fetches backend with bearer auth |
| `/profile/[id]/loading` | `profile/[id]/loading.tsx` | Implemented loading UI |
| `/bookings` | `bookings/page.tsx` | Implemented student booking creation |
| `/bookings/confirmation` | `bookings/confirmation/page.tsx` | Implemented localStorage confirmation page |
| `/saved` | `saved/page.tsx` | Implemented saved alumni display through backend hook |
| `/settings` | `settings/page.tsx` | Implemented local-only settings |
| `/onboarding` | `onboarding/page.tsx` | Implemented local-only onboarding/preferences |
| `not-found` | `not-found.tsx` | Implemented app 404 |

## Frontend Navigation

The navbar currently links to:

- `/`
- `/search`
- `/dashboard`
- `/bookings`
- `/profile`
- `/login`
- `/register`

Not linked in the navbar:

- `/saved`
- `/settings`
- `/onboarding`
- `/register/student`
- `/register/alumni`
- `/bookings/confirmation`

## Active Backend Routes

Routes are mounted directly on the FastAPI app. There is currently no `/api/v1` prefix.

### Root

- `GET /`

### Auth

- `GET /auth/health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Profile

- `GET /profile/me`
- `PUT /profile/me`

### Alumni

- `GET /alumni/`
- `GET /alumni/{alumni_id}`; requires bearer token

### Bookings

- `GET /bookings/health`
- `POST /bookings/`
- `GET /bookings/me`
- `GET /bookings/{booking_id}`
- `PATCH /bookings/{booking_id}`

### Saved Alumni

- `POST /saved/{alumni_id}`
- `DELETE /saved/{alumni_id}`
- `GET /saved/me`

### Reviews

- `POST /reviews/`
- `GET /reviews/alumni/{alumni_id}`

### Dashboard

- `GET /dashboard/student`
- `GET /dashboard/alumni`

### Notifications

- `GET /notifications/me`
- `PATCH /notifications/{notification_id}/read`

## Planned Or Previously Documented Routes Not Present

These routes were implied by older docs or product expectations but are not implemented in the current frontend/backend.

Frontend:

- `/alumni/[id]`; current app uses `/profile/[id]` for alumni detail instead.
- `/availability`
- `/sessions`
- `/admin/alumni-verification`
- `/admin/users`
- `/admin/reports`
- A dedicated notifications page.
- A dedicated review submission page.
- A booking detail page.

Backend:

- `/api/v1/...` prefixed routes.
- `/users/me`; current route is `/auth/me`.
- `/colleges`.
- `/alumni/{alumni_id}/availability`.
- `/bookings/{booking_id}/cancel`; current route is generic `PATCH /bookings/{booking_id}`.
- `/alumni/{alumni_id}/reviews`; current route is `/reviews/alumni/{alumni_id}`.
- `/admin/users`.
- `/admin/users/{user_id}/verify`.
- Email verification routes.
- Password reset routes.
- Logout route.

## Routing Work Left

- Decide whether to add an `/api/v1` prefix or keep direct routes.
- Align frontend route naming for alumni detail: `/profile/[id]` vs `/alumni/[id]`.
- Add navigation links for saved alumni, settings, onboarding, and notifications if they remain part of the product.
- Add frontend routes for booking management and reviews.
- Add backend admin routes only if admin role is introduced.
- Add backend availability routes if alumni scheduling should be slot-based.
