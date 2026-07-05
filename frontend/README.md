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
- `/login`, `/register/student`, and `/register/alumni`: live authentication and richer registration flows.
- `/onboarding`: editable profile completion flow with inline validation and tag-style inputs.
- `/dashboard`: role-aware dashboard data from the backend.
- `/search`: premium alumni discovery experience with filtering and better empty/error states.
- `/profile`: authenticated profile management.
- `/profile/[id]`: public alumni profile with booking entry points.
- `/bookings`: booking creation and management for both students and alumni.
- `/saved`: saved alumni list.
- `/settings`: local settings surface.
- `/mentorship`: mentorship hub experience.

## Current Backend Integration

Implemented frontend API helpers in `src/lib/api.ts`:

- Register user.
- Login user.
- Fetch current user.
- Fetch/update profile.
- Fetch alumni list/details.
- Fetch/save/remove saved alumni.
- Create and manage bookings.
- Fetch dashboard data.
- Fetch notifications and mark them read.
- Submit reviews.

## Current Status

- The core discovery, booking, dashboard, onboarding, and profile experiences are now implemented and wired up in the current codebase.
- The frontend production build was verified successfully.
- The remaining work is focused on polish, hardening, and broader test coverage rather than core feature gaps.

## Local Storage Keys

- `current-user`: auth token, role, email, id, and profile snapshot.
- `latest-booking`: latest booking response used by confirmation flows.
- `student-profile`: onboarding preferences.
- `app-settings`: settings toggles and timezone.

## Verified Status

- `npm run lint` passes.
- `npx tsc --noEmit` passes.
- `npm run build` succeeds in the current workspace setup.

## Remaining Work

1. Add deeper end-to-end tests for onboarding, registration, search, bookings, saved alumni, and profile updates.
2. Polish notification and review presentation further, especially around empty states and edge cases.
3. Configure real Google OAuth, SMTP, and admin environment values for production-like environments.
4. Add production hardening such as rate limiting, logging, monitoring, and deployment-safe security settings.
5. Decide whether any additional local-only settings flows should be persisted to the backend for deeper sync.
