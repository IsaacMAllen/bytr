# bytr

A small, fast, dark-by-default web UI for inspecting telemetry events ingested
by **[m4l-telemetry-api](../m4lTelemetryAPI)** — the backend that receives
crash and analytic events from the `bz.telemetry` Max for Live external.

It lives at `~/development/bytr` and is meant to be run alongside the API on
your laptop, so you can watch real devices reporting in.

```
┌──────────────┐    HTTP     ┌────────────────────┐    SQL    ┌──────────────┐
│ bz.telemetry │ ──────────► │ m4l-telemetry-api  │ ────────► │ Postgres     │
│ (M4L)        │             │ (FastAPI in kind)  │           │ (CNPG)       │
└──────────────┘             └─────────┬──────────┘           └──────────────┘
                                       │                                ▲
                                       │  /v1/events,                   │
                                       │  /v1/stats/*                   │
                                       ▼                                │
                              ┌────────────────────┐                    │
                              │  bytr (this repo)  │ ───── reads ───────┘
                              │  React + Vite      │
                              └────────────────────┘
```

---

## Features

- **Dashboard** — total events / errors / crashes / active devices, an event
  timeline area chart with separate error & crash sub-series, a live recent-
  events table that polls every 10s, and a per-build rollup.
- **Events** — paginated, filterable, searchable table.  URL-synced filters
  (range, vendor, device, version, kind, level, free-text search) so any view
  is shareable.  Optional live-tail mode (5s polling).
- **Event detail drawer** — slide-out panel with the full envelope, copy-
  buttons for IDs, props pretty-printed with a tiny inline JSON highlighter.
- **Devices** — per-build rollup with a 14-bucket traffic sparkline; click a
  row to open the matching pre-filtered Events view.
- **Dark UI** with sky/violet accents, `Inter` for prose and `JetBrains Mono`
  for IDs / values.

## Stack

| Concern             | Library                                     |
| ------------------- | ------------------------------------------- |
| Build tool          | Vite 6                                      |
| UI                  | React 18 + TypeScript                       |
| Styling             | Tailwind 3 (CSS-first design tokens)        |
| Data fetching       | **TanStack Query** (caching, polling)       |
| Tables              | **TanStack Table**                          |
| Charts              | **Recharts**                                |
| Routing             | React Router v7                             |
| Toasts              | Sonner                                      |
| Icons               | Lucide                                      |
| Time formatting     | date-fns                                    |
| Class composition   | clsx + tailwind-merge + class-variance-authority |

`@tanstack/react-query` is the killer "log management" library here — it gives
us query caching, background refetch, polling, and "stale-while-revalidate"
for free.  Every list and detail screen is just a hook + a UI.

---

## Prerequisites

- Node.js 22 (`nvm use` will pick the version from `.nvmrc`)
- pnpm 9+ (corepack: `corepack enable && corepack prepare pnpm@latest --activate`)
- A running `m4l-telemetry-api` reachable from your machine.  By default the
  app proxies `/api` → `http://127.0.0.1:8080`.

If you used the bootstrap script in the API repo, the API is in your local
`kind` cluster; expose it with:

```bash
make -C ../m4lTelemetryAPI k8s-forward-bg
```

…or use the convenience target here:

```bash
make api-up         # starts the port-forward in the sibling repo
make api-status
```

---

## Run it

```bash
cd ~/development/bytr
pnpm install        # or: make install
pnpm dev            # or: make dev   →  http://127.0.0.1:5173
```

Open <http://127.0.0.1:5173/>.  The Vite dev server proxies `/api/*` to the
target in `VITE_API_URL` (default `http://127.0.0.1:8080`).  Override with:

```bash
VITE_API_URL=http://my-api.internal:8080 pnpm dev
```

### Common make targets

| Target              | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `make install`      | `pnpm install`                                 |
| `make dev`          | Vite dev server on `:5173`                     |
| `make build`        | Production build into `dist/`                  |
| `make preview`      | Build + serve the bundle on `:4173`            |
| `make typecheck`    | `tsc --noEmit`                                 |
| `make format`       | Prettier write across `src/`                   |
| `make clean`        | Wipe `node_modules`, `dist`, `.vite`           |
| `make api-up/down`  | Start / stop the sibling API's port-forward    |
| `make api-status`   | Health-check the sibling API's port-forward    |

---

## Producing test data

If your dashboard is empty, drive the Max device or fire a curl payload at
the API:

```bash
curl -sS -X POST http://127.0.0.1:8080/v1/events \
  -H 'Content-Type: application/x-ndjson' \
  --data-binary @- <<'EOF'
{"vendor":"bugbytz","device_name":"my_device","device_version":"1.0.0","device_id":"a","session_id":"s","platform":"macOS","max_version":"Max 9","kind":"event","level":"info","name":"hello","ts":"2026-05-23T20:00:00Z","ts_ms":1779580800000,"props":{}}
EOF
```

Refresh bytr — the new event will appear at the top of every list and the
stat cards will tick up.

---

## Project layout

```
src/
  main.tsx                React + QueryClient + Router bootstrap
  App.tsx                 Lazy-loaded routes (Dashboard / Events / Devices)
  index.css               Tailwind base + design-token scrollbars/etc
  vite-env.d.ts
  lib/
    api.ts                Typed fetch wrapper for m4l-telemetry-api
    queries.ts            TanStack Query hooks (centralised query keys)
    time.ts               date-fns helpers + range presets
    utils.ts              cn(), pretty JSON, copyText, formatters
  components/
    ui/                   Headless primitives: Button, Card, Input, Select, Badge, Skeleton, Empty
    Layout.tsx            App shell (sidebar + outlet)
    Sidebar.tsx           Logo + nav links
    TopBar.tsx            Page title + API health pill + global refresh
    KindBadge.tsx         Coloured pill per event kind
    LevelBadge.tsx        Coloured pill per severity level
    StatCard.tsx          Big number with a tinted halo
    TimelineChart.tsx     Recharts area chart
    EventsTable.tsx       TanStack Table-driven rows + click handler
    EventDetailDrawer.tsx Slide-in panel with copy actions + JsonView
    JsonView.tsx          Tiny inline JSON syntax highlighter
  pages/
    Dashboard.tsx
    Events.tsx
    Devices.tsx
```

### Adding a new metric to the dashboard

1. Add a column to `Event` and a migration to **m4lTelemetryAPI**.
2. Expose it on `EventOut` (the read schema) and (if it makes sense)
   add a derived stat in `app/routes/stats.py`.
3. Mirror the type in `src/lib/api.ts`, add a hook in `src/lib/queries.ts`.
4. Drop a `<StatCard>` (or chart) on `pages/Dashboard.tsx`.

### Adding a new filter to the Events page

Filters are URL-synced, which means they're shareable and round-trip
through reloads.  Pattern:

1. Add the filter to `ListEventsParams` in `src/lib/api.ts`.
2. Read it from `useSearchParams()` in `pages/Events.tsx`.
3. Pipe it into the `useEvents(...)` query hook.
4. Add a control to the filter bar that calls `patch({ ... })`.

---

## Production deployment

The bundle is fully static.  `pnpm build` produces `dist/` containing
`index.html` + chunked JS/CSS.  Serve it behind any reverse-proxy that

1. Serves `dist/` for everything except `/api/*`.
2. Forwards `/api/*` to your `m4l-telemetry-api` Service.

A minimal nginx snippet:

```nginx
location / {
    try_files $uri /index.html;
}
location /api/ {
    proxy_pass http://m4l-telemetry-api.telemetry.svc.cluster.local/;
    proxy_http_version 1.1;
}
```

If you'd rather not proxy and CORS the API directly, set
`TELEMETRY_CORS_ORIGINS=https://bytr.example.com` on the API and point
the frontend at it via `VITE_API_URL`.

---

## Performance notes

- Routes are lazy-loaded; the entry chunk is ~33 KB gzipped.
- Recharts (~150 KB gzipped) is in its own chunk and only loads when the
  user lands on the Dashboard or Devices page.
- TanStack Query gives us free request de-duplication and stale-while-
  revalidate; quick page-flips don't refetch immediately.
- Dashboard polls every 10s; Events optionally polls every 5s.  All other
  views are 30s `staleTime` and refetch on focus.

---

## Troubleshooting

**Blank page / "API unreachable" pill** — the dev server proxy can't reach
the backend.  Run `make api-status`.  If down, `make api-up` (kind) or
restart `docker compose up` in the API repo.

**`pnpm install` fails on `esbuild`** — pnpm 10 prompts for explicit
build-script approval.  We've already opted out of the install-time esbuild
postinstall (it's not required); regular dev/build works fine.

**`watch: command not found`** — that's the API repo's `make events-watch`;
unrelated to bytr.  See `m4lTelemetryAPI/Makefile` (we replaced it with a
portable `while` loop).

---

## Roadmap

- Per-event source-map / stack symbolication for `crash` events.
- A "live console" view that fans events out via SSE (the API already has
  the bones for it via FastAPI).
- Saved filter presets (in `localStorage`), shareable as deep links.
- Bulk-export to NDJSON / CSV from the Events page.
