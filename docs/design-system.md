# Design System And UI Audit

Last audited: 2026-06-21.

The current frontend is a Next app with mostly inline styles and global CSS variables in `frontend/src/app/globals.css`.

## Current Brand And Layout

- Product name shown in the UI: `Alumly`.
- Root layout: `frontend/src/app/layout.tsx`.
- Navigation component: `frontend/src/components/Navbar.tsx`.
- Global stylesheet: `frontend/src/app/globals.css`.
- Main page width token: `--container-width: 1200px`.
- The navbar is sticky and uses a translucent warm surface background.
- Most pages use centered `main` containers with `padding: 48px 24px 80px` or similar.
- Cards and panels are used heavily for page sections and content blocks.

## Typography

- Body font: Inter via `next/font/google`.
- Heading font: DM Serif Display via `next/font/google`.
- Heading letter spacing is currently `-0.03em`.
- Several pages use `clamp(...)` for large headings.
- The home hero uses a hard-coded `72px` heading.

Build note:

- Production build currently attempts to fetch Google font assets and fails in restricted network environments.

## Current CSS Tokens

Defined in `frontend/src/app/globals.css`.

| Token | Value | Usage |
| --- | --- | --- |
| `--background` | `#e9ddd0` | Page background |
| `--surface` | `#f5eee5` | Cards, panels, navbar buttons |
| `--surface-secondary` | `#dbc5ad` | Pills, profile role tag |
| `--text-primary` | `#2b1d16` | Main text |
| `--text-secondary` | `#6a5648` | Secondary text |
| `--border` | `#d3c0ad` | Borders |
| `--primary` | `#6a4430` | Primary buttons |
| `--primary-hover` | `#553425` | Hover-ready token, not widely used |
| `--accent` | `#c16f3d` | Dashboard eyebrow/status and onboarding button |
| `--success` | `#6c7a53` | Defined, little or no current usage |
| `--radius-sm` | `12px` | Small radius |
| `--radius-md` | `16px` | Buttons and inputs |
| `--radius-lg` | `28px` | Large cards/panels |
| `--shadow-sm` | `0 4px 12px rgba(47, 33, 26, 0.06)` | Cards/panels |
| `--shadow-md` | `0 12px 32px rgba(47, 33, 26, 0.1)` | Hero image panel |

## Current Components

- `Navbar`: global navigation, login/register links, logged-in user label, logout button.
- `AlumniCard`: alumni summary with image, save toggle, and profile link.
- `Avatar`: reusable avatar component.
- `Badge`: reusable badge component.
- `Button`: reusable button component.
- `Card`: reusable card component.
- `EmptyState`: empty state component.
- `Input`: reusable input component.
- `SearchBar`: present in components, but search page currently uses inline filter inputs.
- `components/auth/LoginForm.tsx`: file exists but is empty.
- `components/auth/RegisterForm.tsx`: file exists but is empty.
- `components/onboarding/OnboardingForm.tsx`: local-only onboarding/preferences form.

## Current Page UI

- `/`: hero landing page with stats, CTA links, and external Unsplash image.
- `/login`: centered login panel.
- `/register`: role choice cards.
- `/register/student`: student registration form with derived admission/graduation year and profile persistence.
- `/register/alumni`: alumni registration form with company select, LinkedIn, bio.
- `/dashboard`: stat cards and recent booking list.
- `/search`: filter panel and alumni card grid.
- `/profile`: current-user profile summary from local auth storage.
- `/profile/[id]`: authenticated alumni detail card with student booking CTA.
- `/bookings`: student booking request form.
- `/bookings/confirmation`: latest-booking confirmation from localStorage.
- `/saved`: saved alumni list with explicit logged-out and alumni-account states.
- `/settings`: local settings toggles and timezone select.
- `/onboarding`: onboarding preferences form.
- `not-found.tsx`: app-level 404 page.

## Encoding And Copy Issues To Fix

Several files contain mojibake, likely from Unicode characters being saved or displayed through the wrong encoding:

- `frontend/src/app/page.tsx`: broken bullet/star text in hero badge and stats.
- `frontend/src/app/dashboard/page.tsx`: broken middle dot between date/time.
- `frontend/src/app/page.tsx`: broken bullet/star text in hero badge and stats.
- Older docs also contained mojibake arrows/box drawing; this audit rewrites them in ASCII.

## Accessibility And UX Notes

- Most forms have visible labels.
- Buttons generally have disabled states where submission is async.
- Several controls are raw HTML inputs/selects with inline styles.
- The save button uses text rather than an icon component.
- There is no global toast/notification system.
- Error states exist on login, registration, dashboard, search, booking, and saved pages.
- Loading states exist on dashboard, search, booking alumni loading, and saved alumni.
- The saved alumni page explicitly tells unauthenticated users to log in.
- The app uses many large rounded cards; card radius is currently `28px`.
- The current palette is strongly warm brown/tan, which differs from the earlier blue/white design note.

## Design Work Left

- Finish mojibake cleanup if broken strings reappear.
- Decide whether to keep the warm editorial palette or return to the earlier neutral/blue system.
- Add consistent hover/focus states across buttons, links, inputs, and cards.
- Convert repeated inline styles into shared components or CSS classes.
- Use the existing component primitives more consistently.
- Replace homepage raw `<img>` with Next `<Image />` or document why raw image loading is acceptable.
- Add notification UI.
- Add booking management controls for alumni and students.
- Add review UI.
- Add clearer unauthenticated states for pages like `/saved`.
- Consider reducing page-section card nesting and large radii if the product should feel more operational.
- Make mobile behavior explicit for navbar, cards, and filters.
