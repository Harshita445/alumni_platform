# Changes To Remember

Last updated: 2026-06-22.

## Session 1: Completed Scheduling And Reviews Work

- Added backend alumni availability support with `Availability` SQLAlchemy model and `/availability/` routes.
- Booking creation now requires a matching alumni availability slot and rejects active overlapping bookings.
- Frontend `/bookings` now includes `My Bookings` management for students and alumni.
- Alumni can accept, reject, and mark bookings complete from the frontend.
- Students can cancel pending/upcoming bookings from the frontend.
- Completed student bookings show a review form with rating 1-5 and optional comment.
- Alumni profile pages fetch and display average rating plus review list.
- Frontend prevents duplicate review prompts by comparing completed bookings with fetched alumni reviews.
- Dashboard recent bookings now use status badges and link to booking management.

## Session 2: Production Readiness Refactoring

### Booking Date/Time Type Migration
- Converted `bookings.date` column from `String` to `Date` type in SQLAlchemy model
- Converted `bookings.time` column from `String` to `Time` type in SQLAlchemy model
- Updated `BookingCreate` schema to accept `date` and `time` as native types with backward-compatible string validators (mode="before")
- Updated `BookingResponse` schema to serialize Date/Time objects to ISO format strings
- Updated `_booking_window()` helper function to use `datetime.combine()` instead of string parsing
- Updated availability filtering in `_has_overlapping_booking()` to compare Date objects
- **Backward compatibility maintained**: Frontend can still send string dates/times in YYYY-MM-DD and HH:MM format

### Pagination for Alumni Search
- Added `page` (default=1) and `limit` (default=10) query parameters to `GET /alumni/`
- Implemented offset/limit SQL logic with validation
- Default values ensure backward compatibility for existing clients not using pagination
- Fixed validation to gracefully handle invalid page/limit values instead of rejecting

### Email Verification Enforcement
- Added `is_verified` check to `/auth/login` endpoint
- Users with `is_verified=False` now receive 403 Forbidden response with message: "Email not verified. Please verify your email before logging in."
- Registration still sets `is_verified=False` by default (verification flow not yet implemented)

### Password Validation Policy
- Added configurable password policies in `backend/app/core/config.py`:
  - `PASSWORD_MIN_LENGTH`: 8 characters (configurable via environment)
  - `PASSWORD_REQUIRE_UPPERCASE`: True (requires at least one A-Z)
  - `PASSWORD_REQUIRE_NUMBERS`: True (requires at least one 0-9)
  - `PASSWORD_REQUIRE_SPECIAL`: True (requires at least one special character)
- Implemented validators in `RegisterRequest` schema using regex checks
- Password validation occurs at registration time with clear error messages

### Alembic Migration Setup
- Initialized Alembic in `backend/alembic/` directory
- Created `alembic.ini` configuration file pointing to `backend/` directory
- Created `alembic/env.py` with database URL configuration from `app.core.config.settings`
- Created `alembic/script.py.mako` template for migration scripts
- Generated initial migration `001_initial_migration.py` with all current tables:
  - `users` table with email verification support
  - `profiles` table for alumni/student data
  - `bookings` table with Date/Time columns
  - `availability` table with proper constraints
  - `notifications` table
  - `reviews` table with booking unique constraint
  - `saved_alumni` table with unique constraint

## Session 3: API Integration Alignment

### Schema Updates
- Updated `SavedAlumniResponse` schema to return complete alumni profile fields:
  - Added: `branch`, `graduation_year`, `bio`, `linkedin_url`
  - Changed from limited response to full profile data
- Updated `AlumniResponse` schema to include optional `profile_image` field
- Created complete `ReviewResponse` schema in `backend/app/schemas/review.py` with all review fields
- Updated `RecentBooking` schema in dashboard to use native `date` and `time` types (serialized as ISO strings)

### Route Updates
- Updated `GET /saved/me` route to return complete `SavedAlumniResponse` objects using proper schema
- Updated `GET /reviews/alumni/{alumni_id}` to return `list[ReviewResponse]` with proper typing
- Updated `POST /reviews/` to return `{"message": str}` response
- Fixed saved alumni route to construct `SavedAlumniResponse` objects instead of plain dicts

### Frontend/Backend Contract Alignment
- Verified all fetch functions in `frontend/src/lib/api.ts` match backend routes exactly:
  - `/auth/register`, `/auth/login`, `/auth/me` ✓
  - `/profile/me` (GET, PUT) ✓
  - `/alumni/` (with pagination params) ✓
  - `/alumni/{id}` ✓
  - `/bookings/` (POST, PATCH), `/bookings/me` (GET) ✓
  - `/reviews/`, `/reviews/alumni/{id}` ✓
  - `/saved/me` (GET), `/saved/{id}` (POST, DELETE) ✓
  - `/dashboard/student`, `/dashboard/alumni` ✓
  - `/notifications/me`, `/notifications/{id}/read` ✓
- Verified all response types match between schemas and frontend type expectations
- Ensured proper Authorization header construction with Bearer tokens
- Ensured Content-Type headers set correctly for all request types

### Error Handling & Loading States
- All API calls in frontend include proper error state management
- All data fetching includes loading state with user feedback
- Error responses parse `.detail` field from FastAPI error responses
- Graceful fallbacks for network/parsing failures

## Verification Notes

- Backend compile check passed with `py -m compileall backend\app`.
- Frontend lint passes with one existing `@next/next/no-img-element` warning on `frontend/src/app/page.tsx`.
- Frontend production build passes with `npm run build`.
- All schema files validated with no type errors.
- No database errors during model creation (tables auto-created on startup).

## Work Completed

✅ Booking date/time converted from String to Date/Time types  
✅ Pagination added to GET /alumni with page/limit params  
✅ Email verification check enforced on login (403 if not verified)  
✅ Password validation with complexity rules implemented  
✅ Alembic migrations initialized with initial migration  
✅ API response schemas aligned between frontend/backend  
✅ SavedAlumni and Review schemas completed  
✅ Dashboard RecentBooking schema updated for Date/Time types  
✅ All routes verified for correct request/response contracts  
✅ Backward compatibility maintained for existing clients  

## Known Limitations & Future Work

- Email verification tokens and email sending not implemented (login blocks unverified users, but no way to verify)
- Password reset functionality not implemented
- OAuth/social login not implemented
- Meeting links/video call integration not present
- Payment/pricing functionality not implemented
- Rate limiting not configured
- CORS policy may need adjustment for production
- HTTP-only cookies recommended for JWT storage in production
- Database connection pooling not configured for production
- Logging and monitoring not configured
- Database backups/disaster recovery not configured
