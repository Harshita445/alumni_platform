# Frontend Agent Notes

Last audited: 2026-06-21.

## Important Context

- This frontend uses Next.js 16.2.9 and React 19.2.4.
- Before making framework-sensitive changes, check the installed Next docs in `node_modules/next/dist/docs/` if behavior is unclear.
- The app is currently not a clean production build.
- Do not assume the stock create-next-app README still applies; see `README.md` and `../docs/*`.
- Most styling is inline plus CSS variables in `src/app/globals.css`.
- The active backend routes have no `/api/v1` prefix.
- Auth is bearer-token based and stored in localStorage, not HTTP-only cookies.

## Current Checks

- `npx tsc --noEmit` passes.
- `npm run lint` passes with one warning about raw `<img>` in `src/app/page.tsx`.
- `npm run build` previously failed in this workspace because Next inferred `C:\Users\hp` as root and hit access restrictions.
- `npm run build -- --webpack` previously hit blocked Google font fetching plus root/readlink issues.

## Known Product Gaps

- No frontend booking status controls even though backend supports status changes.
- No frontend notification UI even though backend/API helpers exist.
- No frontend review UI even though backend routes exist.
- Onboarding and settings are localStorage-only.
- Booking confirmation is localStorage-only.
- Several visible strings contain mojibake artifacts.
- Saved alumni page needs an explicit unauthenticated state.
- Alumni detail route fetches without bearer auth.

## Editing Guidance

- Prefer fixing the TypeScript errors before broad UI work.
- Keep docs updated when changing routes, API shapes, or localStorage behavior.
- Avoid introducing new mock-only flows unless the docs clearly label them as local-only.
- If adding backend-backed UI, use the helpers in `src/lib/api.ts` or extend that file consistently.
- If changing auth storage, update `src/lib/api.ts`, `src/hooks/useAuth.ts`, backend auth docs, and user-flow docs together.
