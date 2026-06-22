# User Flows

Last audited: 2026-06-22.

This file describes the current user journeys supported by the codebase and the gaps that still block a complete production workflow.

## Authentication Model

- The backend issues JWT bearer tokens.
- The frontend stores the token and user summary in `localStorage` under `current-user`.
- Auth state is synchronized in the browser with a custom `current-user-changed` event.
- Protected backend routes require `Authorization: Bearer <token>`.
- There is no active HTTP-only cookie session flow.
- There is no logout backend route; frontend logout clears localStorage.
- There is no email verification flow even though `is_verified` exists on users.

## Student Registration Flow

Current intended flow:

1. User opens `/register`.
2. User chooses `I'm a Student`.
3. User lands on `/register/student`.
4. Frontend validates the email with `isThaparStudentEmail`, expecting a pattern like `xyz_be24@thapar.edu`.
5. Frontend derives admission year from the `_beYY` part of the email.
6. Frontend derives graduation year as admission year plus 4.
7. Frontend calls `POST /auth/register` with role `student`.
8. Backend checks that the email ends with `@thapar.edu`.
9. Backend creates the user and returns a bearer token.
10. Frontend calls `GET /auth/me`.
11. Frontend calls `GET /profile/me`, which creates a blank profile if needed.
12. Frontend calls `PUT /profile/me` with full name and derived graduation year.
13. Frontend saves the user/profile/token in localStorage.
14. User is routed to `/dashboard`.

Missing:

- Email verification.
- College database validation.
- Strong password rules beyond backend schema accepting a string.
- Student branch/department persistence during registration.

## Alumni Registration Flow

Current flow:

1. User opens `/register`.
2. User chooses `I'm an Alumni`.
3. User lands on `/register/alumni`.
4. User enters name, email, password, graduation year, company, designation, LinkedIn URL, and bio.
5. Frontend calls `POST /auth/register` with role `alumni`.
6. Backend creates user and returns a bearer token.
7. Frontend fetches current user and profile.
8. Frontend calls `PUT /profile/me` with alumni profile fields.
9. Frontend saves user/profile/token in localStorage.
10. User is routed to `/dashboard`.

Missing:

- Alumni verification.
- Proof of graduation or employment.
- Admin approval flow.
- Profile photo upload.
- Availability setup UI.

## Login Flow

Current flow:

1. User opens `/login`.
2. User enters email and password.
3. Frontend sends OAuth2 form data to `POST /auth/login`.
4. Backend validates email and password.
5. Backend returns a bearer token.
6. Frontend calls `GET /auth/me`.
7. Frontend calls `GET /profile/me`.
8. Frontend stores the user/profile/token in localStorage.
9. User is routed to `/dashboard`.

Missing:

- Backend logout.
- Email verification check.
- Password reset.
- Remember-me/session expiry UI.
- Token refresh.

## Student Dashboard Flow

Current flow:

1. Logged-in student opens `/dashboard`.
2. Frontend calls `GET /dashboard/student`.
3. Backend returns counts for pending requests, upcoming sessions, completed sessions, saved alumni, and recent bookings.
4. Frontend renders stat cards and recent booking cards.
5. The recent bookings section links to `/bookings` for booking management.

Missing:

- Notification summary.
- Empty-state links to search/book.

## Alumni Dashboard Flow

Current flow:

1. Logged-in alumni opens `/dashboard`.
2. Frontend calls `GET /dashboard/alumni`.
3. Backend returns counts for pending requests, upcoming sessions, completed sessions, total students helped, and recent bookings.
4. Frontend renders stat cards and recent booking cards.
5. The recent bookings section links to `/bookings` for booking management.

Missing:

- Availability management UI.
- Notification summary.

## Alumni Search Flow

Current flow:

1. Logged-in user opens `/search`.
2. Frontend calls `GET /alumni` with bearer token.
3. Backend returns all alumni profiles.
4. Frontend filters locally by company and designation.
5. Frontend renders `AlumniCard` rows/cards.
6. User can click `View Profile` to open `/profile/[id]`.
7. Student users can toggle saved alumni through the save button.

Backend filter support exists but is not used by the frontend:

- `company`
- `branch`
- `graduation_year`
- `search`

Missing:

- Server-side query parameters from the frontend.
- Pagination.
- Filter by session type.
- Filter by rating.
- Filter by paid/free status.
- Sort order.
- Search loading skeleton polish.

## Alumni Profile Detail Flow

Current flow:

1. User opens `/profile/[id]`.
2. Client page requires a logged-in user.
3. Frontend fetches `GET /alumni/{id}` with bearer auth.
4. Frontend fetches `GET /reviews/alumni/{id}` with bearer auth.
5. If the alumni response is not OK, the page shows an unavailable-profile state.
6. Page displays image, name, designation, company, class year, bio, branch, LinkedIn URL, average rating, review list, and a student-only booking CTA.
7. Review loading and error states are handled separately from alumni profile loading.

## Booking Request Flow

Current student flow:

1. Student opens `/bookings`.
2. Frontend blocks unauthenticated users.
3. Student users see the booking request form and their `My Bookings` management list.
4. Alumni users see only the `My Bookings` management list.
5. Frontend loads alumni through `GET /alumni`.
6. Student selects alumnus, session type, date, and time.
7. Frontend calls `POST /bookings`.
8. Backend checks current user is a student.
9. Backend checks selected user is alumni.
10. Backend validates the date/time format and rejects past booking times.
11. Backend requires the requested 30-minute session to fit inside an alumni availability slot.
12. Backend rejects active overlapping `pending` or `upcoming` bookings for the same alumni/date.
13. Backend creates a `pending` booking.
14. Backend creates a notification for the alumni user.
15. Frontend stores latest booking in localStorage and routes to `/bookings/confirmation`.

Missing:

- Frontend availability picker or visible available slots.
- Meeting link creation.
- Payment.
- Calendar integration.
- Email notification.
- Booking detail page.

## Booking Status Flow

Backend supports:

- Alumni accepts pending booking with `PATCH /bookings/{id}` and status `upcoming`.
- Alumni rejects pending booking with status `rejected`.
- Student cancels pending/upcoming booking with status `cancelled`.
- Alumni completes upcoming booking with status `completed`.

Frontend supports:

- `/bookings` shows a `My Bookings` section populated by `GET /bookings/me`.
- Alumni see Accept and Reject buttons for pending bookings.
- Alumni see Mark as Completed for upcoming bookings.
- Students see Cancel for pending/upcoming bookings.
- The dashboard links users to `/bookings` to manage current booking state.
- Status badges appear for `pending`, `upcoming`, `completed`, `cancelled`, and `rejected`.
- Loading, refresh, and error states are handled in the booking management UI.

## Alumni Availability Flow

Backend supports:

1. Alumni submits `POST /availability/` with either weekly `day_of_week` or date-specific `date`, plus `start_time` and `end_time`.
2. Backend verifies the current user is alumni.
3. Backend validates exactly one of `day_of_week` or `date`.
4. Backend validates the time range.
5. Any authenticated user can read availability through `GET /availability/{alumni_id}`.
6. Owner alumni can delete a slot with `DELETE /availability/{availability_id}`.
7. Booking creation checks these slots before creating a booking.

Frontend missing:

- Availability creation UI.
- Availability list/edit/delete UI.
- Booking form does not yet show selectable slots from availability.

## Saved Alumni Flow

Current flow:

1. Student clicks save on an `AlumniCard`.
2. `useSavedAlumni` calls `POST /saved/{alumni_id}` or `DELETE /saved/{alumni_id}`.
3. Hook refreshes saved alumni from `GET /saved/me`.
4. `/saved` displays saved alumni using `AlumniCard`.

Current behavior:

- Save UI appears only for student users.
- `/saved` displays explicit logged-out and alumni-account states.

## Review Flow

Backend supports:

1. Student submits `POST /reviews/` with booking id, rating, and optional comment.
2. Backend requires booking to exist.
3. Backend requires current user to be the booking student.
4. Backend requires booking status to be `completed`.
5. Backend prevents duplicate reviews for one booking.
6. Backend creates review and notification for alumni.
7. Reviews can be read with `GET /reviews/alumni/{alumni_id}`.

Frontend missing:

- Displaying reviewer names instead of student IDs.
- Editing or deleting reviews.

Frontend supports:

- Completed student bookings show a review form.
- Review form supports rating 1-5 and optional comment.
- Duplicate reviews are hidden in the UI by comparing completed booking IDs with fetched alumni reviews.
- Alumni profile pages show average rating and review list.
- Review loading and error states are handled.

Backend behavior:

- Rating is validated from 1 to 5.
- Duplicate reviews for the same booking are rejected.

## Notification Flow

Backend supports:

- Listing current-user notifications.
- Marking a current-user notification as read.
- Notifications are created for bookings and reviews.

Frontend state:

- API helpers exist in `frontend/src/lib/api.ts`.
- No notification page, dropdown, badge, or read action UI exists yet.

## Onboarding Flow

Current flow:

1. User opens `/onboarding`.
2. User fills graduation year, department, target companies, desired roles, and goals.
3. Data is saved in localStorage under `student-profile`.
4. Browser alert confirms save.

Missing:

- Backend persistence.
- Integration with `/profile`.
- Recommendation engine integration.
- Validation.

## Settings Flow

Current flow:

1. User opens `/settings`.
2. User toggles email notifications, booking reminders, public profile visibility, and timezone.
3. Data is saved in localStorage under `app-settings`.

Missing:

- Backend persistence.
- Actual notification preference enforcement.
- Public/private profile enforcement.
- Timezone use in bookings.
