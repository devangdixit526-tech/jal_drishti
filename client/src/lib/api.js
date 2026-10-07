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

async function request(path, { signal } = {}) {
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

  // The server always wraps success in { data, meta }. Hand both back.
  return { data: payload?.data ?? null, meta: payload?.meta ?? null };
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
};
