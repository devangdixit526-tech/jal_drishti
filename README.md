# JalDrishti

Groundwater-stress and crop-water-demand intelligence for Indian agriculture.
Helps identify agricultural water-stress hotspots by combining groundwater
status, crop water demand and trend data.

## Layout

```
client/   React 19 + Vite + Tailwind frontend
server/   Node + Express API
```

## Running locally

Two terminals. Backend first:

```bash
cd server
npm install
cp .env.example .env
npm run dev          # http://localhost:4000/api/v1
```

Then the frontend:

```bash
cd client
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

The frontend reads `VITE_API_BASE_URL` from `client/.env`. If the backend is not
running, the dashboard shows an error banner telling you so rather than
silently displaying nothing.

## Documentation

- [`server/README.md`](server/README.md) - API endpoints, architecture, roadmap

## Status

| Area | State |
|---|---|
| Frontend UI (5 pages) | complete |
| Reference data API (states, districts, crops) | complete, wired to the dashboard |
| Groundwater / risk / map / insights data | **still hardcoded in the UI** - see the server roadmap |
