# Claude Notes

Last audited: 2026-06-21.

Use `AGENTS.md` as the primary frontend guidance file. The short version:

- This is a Next 16.2.9 frontend for the Alumly alumni platform.
- The app currently has TypeScript errors and production build/root issues.
- Auth uses backend JWT bearer tokens stored in localStorage.
- Backend routes are direct paths such as `/auth/login`, not `/api/v1/auth/login`.
- Check `README.md` and `../docs/` before making route, API, or workflow changes.
