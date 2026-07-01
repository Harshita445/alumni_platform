# Alumly Frontend

Last audited: 2026-06-21.

This is the active Next.js frontend for the alumni platform. It talks to the FastAPI backend in `../backend` and uses localStorage for current client-side auth/session state.

## Stack

- Next.js 16.2.9
- React 19.2.4
- TypeScript 5
- ESLint 9 with `eslint-config-next`
- Tailwind/PostCSS packages are installed, but the app currently relies mostly on inline styles and CSS variables.

## Run Locally

Install dependencies if needed:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Default app URL:

```text
http://localhost:3000
```

Backend default expected by `src/lib/api.ts`:

```text
http://localhost:8000
```

Override backend URL:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

Create a local frontend environment file:

```bash
copy .env.example .env.local
```

Then update `.env.local` with your real Google OAuth client ID:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

The same client ID should also be copied into the backend `.env` file as `GOOGLE_CLIENT_ID`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Current Pages

- `/`: landing page.
- `/login`: live backend login.
- `/register`: account type choice.
- `/register/student`: student registration with derived graduation year and profile update.
- `/register/alumni`: alumni registration.
- `/dashboard`: student/alumni dashboard from backend data.
- `/search`: alumni discovery from backend data with client-side filters.
- `/profile`: current-user profile from local stored auth data.
- `/profile/[id]`: alumni detail fetched from backend.
- `/bookings`: student booking creation.
- `/bookings/confirmation`: localStorage-based booking confirmation.
- `/saved`: saved alumni.
- `/settings`: local-only settings.
- `/onboarding`: local-only preference capture.

## Current Backend Integration

Implemented frontend API helpers in `src/lib/api.ts`:

- Register user.
- Login user.
- Fetch current user.
- Fetch/update profile.
- Fetch alumni list/details.
- Fetch/save/remove saved alumni.
- Create booking.
- Fetch dashboard.
- Fetch notifications.
- Mark notification read.

Not yet surfaced in UI:

- Notification list/read controls.
- Booking accept/reject/cancel/complete controls.
- Review creation.
- Review listing.
- Server-side alumni filtering.

## Local Storage Keys

- `current-user`: auth token, role, email, id, and profile snapshot.
- `latest-booking`: latest booking response used by confirmation page.
- `student-profile`: onboarding preferences.
- `app-settings`: settings toggles and timezone.

## Verified Status

- `npm run lint` passes.
- Lint warning remains in `src/app/page.tsx`: raw `<img>` should be replaced by Next `<Image />` or intentionally kept.
- `npx tsc --noEmit` passes.
- `npm run build` currently fails in this environment because Next infers `C:\Users\hp` as workspace root and hits access denied.
- `npm run build -- --webpack` also fails because restricted network blocks Google font fetching and the root access issue remains.

## Known UI/Data Issues

- Several strings contain mojibake characters from broken Unicode encoding.
- Settings and onboarding are local-only and not persisted to backend.
- Booking confirmation is local-only and depends on `latest-booking`.
- Profile page uses stored profile data instead of refetching.
- Empty auth form component files exist under `src/components/auth`.

## High Priority Frontend Work

1. Configure Next root/build behavior.
2. Make fonts build-safe in restricted environments.
3. Finish mojibake cleanup if any broken strings reappear.
4. Add booking management UI.
5. Add notification UI.
6. Add review UI.
7. Decide which localStorage-only flows need backend persistence.
8. Add frontend tests for auth, search, bookings, saved alumni, and dashboards.
