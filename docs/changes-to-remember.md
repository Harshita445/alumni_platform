# Changes To Remember

Last updated: 2026-06-22.

## Completed Scheduling And Reviews Work

- Added backend alumni availability support with `Availability` SQLAlchemy model and `/availability/` routes.
- Booking creation now requires a matching alumni availability slot and rejects active overlapping bookings.
- Frontend `/bookings` now includes `My Bookings` management for students and alumni.
- Alumni can accept, reject, and mark bookings complete from the frontend.
- Students can cancel pending/upcoming bookings from the frontend.
- Completed student bookings show a review form with rating 1-5 and optional comment.
- Alumni profile pages fetch and display average rating plus review list.
- Frontend prevents duplicate review prompts by comparing completed bookings with fetched alumni reviews.
- Dashboard recent bookings now use status badges and link to booking management.

## Verification Notes

- Backend compile check passed with `py -m compileall backend\app`.
- Frontend lint passes with one existing `@next/next/no-img-element` warning on `frontend/src/app/page.tsx`.
- Frontend production build passes with `npm run build`.
