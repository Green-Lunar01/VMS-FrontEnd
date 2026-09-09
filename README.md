# DHQ Visitors Management System — Frontend

Next.js (App Router) + TypeScript + Tailwind CSS implementation of the
DHQ-VISITORS-MANAGEMENT-SYSTEM Figma design, covering all four role dashboards.

Screens are built to match the Figma file directly: colours, spacing, typography, iconography
and flows were taken from the file itself rather than approximated. The app is wired to the
live backend described in `FRONTEND_INTEGRATION_GUIDE.md`.

## Getting started

```bash
npm install
cp .env.example .env.local   # points at the deployed API by default
npm run dev
```

Open http://localhost:3000 — it redirects to `/login`.

Set `NEXT_PUBLIC_API_BASE_URL` to switch environments:

| Environment | Value |
|---|---|
| Local backend | `http://localhost:8080/api/v1` |
| Deployed | `https://vms-r80z.onrender.com/api/v1` |

Log in with real credentials. The role on the returned user decides which dashboard you land
on, and accounts still carrying `mustChangePassword` are routed to `/change-password` first.

The backend only accepts requests from origins in its `CORS_ORIGINS`, so a new dev origin
needs adding there.

## Structure

```
src/
  app/
    login/                  shared login screen
    admin/                  Institution Admin
    security/               Security Officer
    host/                   Officer/Soldier (Host)
    super-admin/            Greenlunar Super Admin
  components/
    ui/                     design-system primitives (Button, DataTable, Dropdown,
                            Modal, Drawer, Tabs, Toolbar, EmptyState, ...)
    layout/                 Sidebar, Topbar, DashboardShell, HostShell, PlatformShell,
                            AuthLayout, InstitutionCrest
    dashboard/              composed pieces (HomeBoard, VisitorQueueCard, ContractorPermit,
                            AddOfficerModal, drawers, ...)
    pages/                  views shared between roles (VisitorsLogView, OfficersView,
                            ContractorsView, DispatcherView, ProfileView)
    icons/                  Hugeicons wrapper
  lib/
    api/                    client (bearer + refresh interceptor), endpoints, useApi hook
    auth/                   AuthProvider, RequireRole guard, token storage
    types.ts, labels.ts, filter-options.ts, date-range.ts, csv.ts, nav-config.ts, utils.ts
```

## Design tokens

Colours in `src/app/globals.css`, sampled from the Figma file:

| Token | Value | Use |
|---|---|---|
| primary | `#008751` | buttons, active nav, links |
| gold-header | `#d4af37` | table headers |
| row-selected | `#f5eccf` | selected/hovered table row |
| nav-active | `#fafcfa` | active sidebar item background |
| red | `#e31e24` | destructive actions, offline |
| blue | `#0072bc` | call button, institution icon |
| ink | `#1c1c1c` | body text |
| grey | `#f4f4f4` | page background |

Fonts: Inter for UI, Montserrat Underline for the institution wordmark. Icons come from
[Hugeicons](https://hugeicons.com) — the same set used in the Figma file, so the layer names
map one-to-one onto component names.

Brand assets in `public/branding/` are exported from Figma: the Defence Headquarters crest,
the login artwork panel, the Green Lunar logo, the empty-state illustration, the avatar
placeholder and the success check.

## Notable UI behaviour

- **Notifications and visitor details are slide-over drawers**, not pages.
- **Add Officer/Soldier is a popup**, as are the officer credentials and contractor permit.
- **Home is a carousel** — the topbar "Signed In / Signed Out Visitors" links swap the two
  queue columns.
- **Contractors** is a three-tab flow: permit builder, list, and check-in/check-out.
- **Analytics** uses a gold area chart, with Overview / Admins / Officers tabs.

## API integration

`src/lib/api/client.ts` handles the base URL, the bearer header, and the 401 → refresh → retry
cycle. Refresh tokens rotate, so concurrent 401s share a single in-flight refresh rather than
each firing their own; if the refresh itself fails the session is cleared and the user is sent
back to `/login`.

Errors come back in the backend's envelope (`statusCode` / `path` / `timestamp` / `message`,
where `message` may be a string or an array of validation strings). `ApiError` normalises that
into a `messages` array which the screens surface directly, so users see the backend's own
wording.

Notes on specific flows:

- **Logout** is one route for all four dashboards (`POST /auth/logout`), wired to every
  sidebar. Local tokens are cleared even if the call fails.
- **Walk-ins**: Security Officers get an "Onboard New Visitors" panel on Home
  (`POST /visitors/walk-in`). Those start at `awaiting_approval`, and the Sign In action is
  hidden for that status because the API rejects approving before the host confirms.
- **Host confirm**: a host sees "Confirm visitor" on a walk-in raised for them
  (`PATCH /visitors/:id/confirm`), plus "End appointment" on their signed-in visitors.
- **Date presets** ("Last 7 days" and friends) resolve to concrete `from`/`to` dates in
  `src/lib/date-range.ts` before the request goes out.
- **Export** has no backend endpoint; `src/lib/csv.ts` builds the CSV from the filtered rows.
- **Officer profiles** show `visitorsReceivedCount`, which only the single-record
  `GET /officers/:id` returns, so opening a row re-fetches that officer.
- **Super Admin stat cards** come from `GET /institutions/stats`, and "Act as User" swaps the
  session for an impersonation token.
