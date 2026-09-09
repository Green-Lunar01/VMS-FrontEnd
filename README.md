# DHQ Visitors Management System — Frontend

Next.js (App Router) + TypeScript + Tailwind CSS implementation of the
DHQ-VISITORS-MANAGEMENT-SYSTEM Figma design, covering all four role dashboards.

Screens are built to match the Figma file directly: colours, spacing, typography, iconography
and flows were taken from the file itself rather than approximated. Data is currently mock data
shaped to the DTOs in `FRONTEND_INTEGRATION_GUIDE.md`, so swapping in the real API is a
drop-in change.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/login`.

### Trying each dashboard

Until real auth is wired, the email you type decides which dashboard you land on:

| Email contains | Dashboard |
|---|---|
| `security` | Security Officer |
| `super` | Super Admin (Greenlunar) |
| `musa`, `host`, `officer` | Officer/Soldier (Host) |
| anything else | Institution Admin |

Password isn't checked. See `src/lib/mock-session.ts`.

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
  data/mock-data.ts         seed data
  lib/                      types, labels, filter options, nav config, utils
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

## Next: API integration

`src/lib/types.ts` mirrors the backend DTOs. Wiring up means adding an API client (base URL,
bearer token, refresh-token interceptor per §3 of the integration guide) and replacing the
`mock-data.ts` reads in each view — the component layer shouldn't need to change.
