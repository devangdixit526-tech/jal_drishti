# JalDrishti API (`server/`)

Backend for JalDrishti. Serves reference data today; groundwater, crop water
demand and risk scoring are being added in the phases below.

## Run it

```bash
cd server
npm install
cp .env.example .env     # first time only
npm run dev              # http://localhost:4000/api/v1
```

In a second terminal:

```bash
cd client
npm install
cp .env.example .env     # first time only
npm run dev              # http://localhost:5173
```

Check it works: `npm run smoke` (in `server/`, with the server running).

## Architecture

Requests flow in one direction. Each layer only knows about the one beneath it:

```
routes/        URL -> handler. No logic.
controllers/   HTTP in/out. Validates input. No logic, no data access.
services/      The actual logic (comparisons, formulas, risk scoring).
repositories/  The ONLY layer that knows where data physically lives.
data/          JSON seed files (temporary - see phase 2).
```

Why this matters: `repositories/` is the single seam to the database. When
Postgres/PostGIS lands, you rewrite those function bodies as SQL and **nothing
else in the codebase changes**. Services and controllers never learn about it.

Supporting files:

| Path | Purpose |
|---|---|
| `src/app.js` | Builds the Express app (no port). Testable in-process. |
| `src/server.js` | Opens the socket, handles graceful shutdown. |
| `src/config/env.js` | Reads + validates env vars once, at boot. |
| `src/middleware/errorHandler.js` | Every error becomes a JSON response here. |
| `src/utils/ApiError.js` | Error carrying an HTTP status code. |
| `src/utils/asyncHandler.js` | Forwards async errors to Express. Wrap every async handler. |
| `scripts/smoke.mjs` | Hits every endpoint, asserts status codes. |

## Response shape

Success is always wrapped in `data`, errors always in `error`:

```json
{ "data": [ ... ], "meta": { "count": 23 } }
{ "error": { "message": "No state with id 'ZZ'", "status": 404 } }
```

A predictable envelope means the frontend writes error handling once.

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/health` | Liveness probe. Touches no data. |
| GET | `/api/v1` | Self-describing endpoint list. |
| GET | `/api/v1/states` | All states. |
| GET | `/api/v1/states/:stateId/districts` | Districts of one state. Makes the dropdowns cascade. |
| GET | `/api/v1/districts/:districtId` | One district + its state. |
| GET | `/api/v1/crops` | Optional `?season=Kharif\|Rabi\|Annual`. |
| GET | `/api/v1/crops/compare` | Comparison payload incl. bar percentages. |
| GET | `/api/v1/crops/:cropId` | By id, name or legacy UI alias (`Paddy (Rice)`). |

## Known caveats

- **Crop water demand values are provisional.** They were carried over from the
  UI mockup and are flagged `provisional: true` in every response. They are NOT
  computed yet. Replace them with FAO-56 (ETo x Kc) output before presenting
  them as authoritative.
- **No district geometry.** `regions.json` holds no coordinates on purpose -
  real polygons arrive with the boundary GeoJSON import (phase 2).
- **Uttar Pradesh district list is partial** (16 of 75). Punjab and Haryana
  are complete.
- **No database, no auth, no caching yet.** See the roadmap.

## Roadmap

| Phase | Work | Status |
|---|---|---|
| 1 | Express scaffold, error handling, reference data API | **done** |
| 2 | Postgres + PostGIS, migrations, district/block boundaries | next |
| 3 | CGWB groundwater assessment ETL -> `/groundwater/status` | |
| 4 | Weather integration + FAO-56 -> real `/crops/water-demand` | |
| 5 | Risk score engine + `/risk/score`, `/risk/methodology` | |
| 6 | `/risk/map` GeoJSON (replaces hardcoded points in `RiskMap.jsx`) | |
| 7 | `/recommendations`, `/insights` | |
| 8 | India-WRIS + GRACE trends; GEE crop classification | |
| 9 | Auth, saved regions, notifications | |
| 10 | Redis caching, rate limits, tests, CI, deploy | |

### Open issues to resolve with the frontend

- The dashboard legend declares **four** risk classes (Low/Moderate/High/Critical)
  but `RiskMap.jsx` implements **three**. Standardise on the CGWB four:
  Safe / Semi-Critical / Critical / Over-Exploited.
- The dashboard's "Paddy -> Maize, -32%" does not match the data
  (5.8 -> 3.5 mm/day is -39.7%). Decide the metric when `/recommendations` is built.
