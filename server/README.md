# JalDrishti API (`server/`)

Backend for JalDrishti: groundwater stress detection for **Haryana**.

It joins four things - CGWB groundwater categorisation, daily weather,
FAO-56 crop water demand, and administrative geography - into a single risk
score per district, for authorities deciding where to restrict extraction.

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
79 assertions - status codes, then the computed numbers.

## Architecture

Requests flow in one direction. Each layer only knows about the one beneath it:

```
routes/        URL -> handler. No logic.
controllers/   HTTP in/out. Validates input. No logic, no data access.
services/      The actual logic (FAO-56, risk scoring, comparisons).
repositories/  The ONLY layer that knows where data physically lives.
data/          JSON data files (see Data sources below).
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
| `scripts/smoke.mjs` | Hits every endpoint, asserts status codes AND computed values. |

## Response shape

Success is always wrapped in `data`, errors always in `error`:

```json
{ "data": [ ... ], "meta": { "count": 23 } }
{ "error": { "message": "No state with id 'ZZ'", "status": 404 } }
```

A predictable envelope means the frontend writes error handling once.

**One deliberate exception:** `/risk/map` returns a bare GeoJSON
`FeatureCollection`, because `L.geoJSON()` takes one directly and making the
client unwrap `data` first is friction for no benefit. Errors there still use
the `error` envelope.

## Endpoints

### Reference data

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/health` | Liveness probe. Touches no data. |
| GET | `/api/v1` | Self-describing endpoint list. |
| GET | `/api/v1/states` | All states. |
| GET | `/api/v1/states/:stateId/districts` | Districts of one state. Makes the dropdowns cascade. |
| GET | `/api/v1/districts/:districtId` | One district + its state. |
| GET | `/api/v1/crops` | Optional `?season=Kharif\|Rabi\|Annual`. |
| GET | `/api/v1/crops/compare` | Reference comparison (seed values, provisional). |
| GET | `/api/v1/crops/:cropId` | By id, name or legacy UI alias (`Paddy (Rice)`). |

### Groundwater

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/groundwater/status` | Haryana-wide block category counts, 2025 vs 2024 + trend. |
| GET | `/api/v1/groundwater/status?district=Karnal` | That district's blocks, with each one's category and trend. |

### Crop water demand (computed, FAO-56)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/water-demand?district=&crop=&year=` | One crop season. Add `&daily=true` for the day-by-day series. |
| GET | `/api/v1/water-demand/compare?district=&season=&year=` | Every crop of that season, least thirsty first. |

`year` is the **sowing** year and defaults to 2025 - the only year where both a
kharif season (sown June) and a rabi season (sown November, harvested the
following April) fit inside the weather window.

### Risk

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/risk/score?district=&season=&year=` | One district, with components and named drivers. |
| GET | `/api/v1/risk/ranking?season=&year=` | All 22 districts, worst first. |
| GET | `/api/v1/risk/map?season=&year=` | GeoJSON with the score on each polygon. |
| GET | `/api/v1/risk/methodology` | Every weight, threshold, source and limitation. |

## How the risk score works

```
risk = 0.6 x extraction stress        (CGWB block categories, annual)
     + 0.4 x crop water demand        (FAO-56 ETc vs rainfall, daily)
     + trend penalty                  (2 points per block that worsened, max 10)
```

**Extraction stress** averages the district's blocks, each scored at the
midpoint of its category band (Safe 35, Semi-Critical 80, Critical 95,
Over-Exploited 110). Averaged rather than worst-case: 1 over-exploited block
out of 9 is not the same situation as 9 out of 9, and `max()` would call them
identical.

**Crop water demand** is `ETc = ETo x Kc` summed over the season, minus
effective rainfall, for the thirstiest crop of that season. Kc follows the
four-segment FAO-56 curve rather than a season average, because the peak is
what empties an aquifer.

Every constant above is returned by `/risk/methodology`. A score an officer
cannot audit is a score they should not act on - so the audit trail is an
endpoint, not documentation.

## Data sources

All in `src/data/`, each with a `_meta` block carrying its source URL,
retrieval date, units and caveats.

| File | Source | Notes |
|---|---|---|
| `regions.json` | Government district lists | 22 Haryana districts (plus Punjab/UP, now out of scope). |
| `crops.json` | FAO-56 Tables 11 & 12 | Kc values, stage lengths, Haryana sowing calendar. |
| `groundwater-blocks.json` | CGWB GWRA-2025 + GWRA-2024 | 143 blocks. Parsed totals match CGWB's published figures exactly. |
| `weather-eto.json` | Open-Meteo (ERA5 reanalysis) | 1004 days x 22 districts of ETo, rainfall, temperature. |
| `haryana-districts.geojson` | Census 2011 boundaries | 22 polygons. Joins to `regions.json` on district name, 22/22. |

Haryana state-wide position from GWRA-2025: **91 of 143 blocks (63.6%)
Over-Exploited**, stage of extraction 136.75%. Nine blocks moved to a worse
category since GWRA-2024; four improved.

## Known caveats

Read these before presenting any number as authoritative. The full list is at
`/api/v1/risk/methodology`.

- **No live groundwater readings in the risk score yet.** CGWB categorisation
  is annual, so the structural half of the score cannot see within-year
  deterioration. DWLR telemetry (6-hourly, ~169 Haryana stations) is
  retrievable from India-WRIS and is the next thing to wire in.
- **The reference crop may not be grown there.** Demand uses the thirstiest
  crop of the season regardless of local cropping pattern, so cotton drives the
  kharif figure even for districts with no cotton. Only real cropping-area data
  fixes this.
- **Paddy risk is understated.** ETc is evapotranspiration only. Puddled rice
  also loses large volumes to percolation, seepage and land preparation, none
  of which FAO-56 ETc captures.
- **Effective rainfall is approximate.** 20% is assumed lost, and no soil
  moisture carries between days, because soil texture and rooting depth are not
  held. This biases irrigation need slightly high.
- **Stage lengths and sowing dates are generic**, from FAO-56 and the standard
  Haryana calendar. Not field-verified. An agronomist should review them.
- **Demand does not vary within a district** - it is computed at the district
  centroid, while CGWB assesses per block.
- **District polygons, not block polygons.** The map averages several blocks
  per district. Block boundaries are still needed for a true choropleth.
- `crops.json`'s own `referenceWaterDemandMmPerDay` remains **provisional**
  (carried from the UI mockup) and still powers `/crops/compare`. The computed
  endpoints under `/water-demand` do not use it and are not provisional.

## Roadmap

| Phase | Work | Status |
|---|---|---|
| 1 | Express scaffold, error handling, reference data API | **done** |
| 2 | CGWB block categorisation + district boundaries + weather ETL | **done** |
| 3 | FAO-56 crop water demand (`/water-demand`) | **done** |
| 4 | Risk engine (`/risk/score`, `/ranking`, `/map`, `/methodology`) | **done** |
| 5 | DWLR time series: water-level trends, pre/post-monsoon recovery | next |
| 6 | Postgres + PostGIS, migrations, block boundaries | |
| 7 | Wire `CropIntelligence`, `Insights`, `RiskMap` to the API | |
| 8 | `/recommendations` built on real crop-switch savings | |
| 9 | Sentinel-2 crop classification -> actual cropped area | |
| 10 | Auth, saved regions, caching, rate limits, unit tests, CI, deploy | |

### Resolved

- **Four risk classes, not three.** The dashboard legend declared four while
  `RiskMap.jsx` implemented three. Settled on CGWB's official four - Safe /
  Semi-Critical / Critical / Over-Exploited - because they are the published
  categories this data actually uses. `RiskMap.jsx` still needs updating to
  match.
- **The "Paddy -> Maize, -32%" figure.** It did not match its own data. Crop
  savings now come from `/water-demand/compare`, computed per district from
  that district's weather, with the basis named in the payload
  (`irrigationNeedMm` over the whole season).
