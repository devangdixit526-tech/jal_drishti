/**
 * The ONLY place in the frontend that knows how to talk to the backend.
 *
 * Every component calls these functions instead of calling fetch() directly.
 * That way the base URL, error handling and response unwrapping are defined
 * once - and if the API changes, exactly one file changes.
 */

// Vite only exposes env vars prefixed with VITE_. The fallback keeps the app
// working if someone forgets to create .env.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

/** An HTTP error carrying the status code and the server's message. */
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Builds a query string, skipping params that are undefined, null or ''.
 *
 * Without the skip, `season=undefined` reaches the server as the literal
 * string "undefined" and fails validation with a confusing 400.
 */
function query(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const string = search.toString();
  return string ? `?${string}` : '';
}

async function send(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      signal,
      headers: { Accept: 'application/json' },
    });
  } catch (cause) {
    // fetch() only rejects on network-level failure - server down, DNS, CORS.
    // A 404 or 500 does NOT reject, which is the classic fetch gotcha.
    if (cause.name === 'AbortError') throw cause;
    throw new ApiError(
      `Cannot reach the API at ${BASE_URL}. Is the server running?`,
      0,
      { cause: cause.message },
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.error?.details,
    );
  }

  return payload;
}

/** For the normal endpoints, which wrap success in { data, meta }. */
async function request(path, opts) {
  const payload = await send(path, opts);
  return { data: payload?.data ?? null, meta: payload?.meta ?? null };
}

/**
 * For /risk/map, which returns a bare GeoJSON FeatureCollection.
 *
 * It is not wrapped in `data` because L.geoJSON() takes a FeatureCollection
 * directly. Shaped as { data, meta } here anyway so useApi() - which expects
 * that pair - works unchanged for it.
 */
async function requestRaw(path, opts) {
  const payload = await send(path, opts);
  return { data: payload, meta: payload?._meta ?? null };
}

export const api = {
  health: (opts) => request('/health', opts),

  listStates: (opts) => request('/states', opts),
  listDistricts: (stateId, opts) =>
    request(`/states/${encodeURIComponent(stateId)}/districts`, opts),
  getDistrict: (districtId, opts) =>
    request(`/districts/${encodeURIComponent(districtId)}`, opts),

  listCrops: (season, opts) =>
    request(season ? `/crops?season=${encodeURIComponent(season)}` : '/crops', opts),
  getCrop: (cropId, opts) => request(`/crops/${encodeURIComponent(cropId)}`, opts),
  compareCrops: (season, opts) =>
    request(
      season ? `/crops/compare?season=${encodeURIComponent(season)}` : '/crops/compare',
      opts,
    ),

  // --- groundwater: CGWB block categorisation (Haryana) -----------------
  getGroundwaterStatus: (district, opts) =>
    request(`/groundwater/status${query({ district })}`, opts),

  // --- crop water demand: computed, FAO-56 ------------------------------
  // `year` is the SOWING year and defaults server-side to 2025.
  getWaterDemand: ({ district, crop, year, daily } = {}, opts) =>
    request(`/water-demand${query({ district, crop, year, daily })}`, opts),
  compareWaterDemand: ({ district, season, year } = {}, opts) =>
    request(`/water-demand/compare${query({ district, season, year })}`, opts),

  // --- risk --------------------------------------------------------------
  getRiskScore: ({ district, season, year } = {}, opts) =>
    request(`/risk/score${query({ district, season, year })}`, opts),
  getRiskRanking: ({ season, year } = {}, opts) =>
    request(`/risk/ranking${query({ season, year })}`, opts),
  getRiskMethodology: (opts) => request('/risk/methodology', opts),

  // Bare GeoJSON - see requestRaw above.
  getRiskMap: ({ season, year } = {}, opts) =>
    requestRaw(`/risk/map${query({ season, year })}`, opts),
};
