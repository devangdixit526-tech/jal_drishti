import { loadJson } from './loadJson.js';

/**
 * DATA ACCESS LAYER for daily weather.
 *
 * Same contract as the other repos: when Postgres lands, these bodies become
 * SQL and no service changes. That matters more here than elsewhere - a daily
 * series for 22 districts is already 500 KB of JSON, and the DWLR/telemetry
 * work will multiply it. This is the seam where that swap happens.
 */

const db = () => loadJson('weather-eto.json');

/** The shared date axis. Every district's arrays are aligned to this. */
export async function findDates() {
  return db()._meta.dates;
}

export async function findWeatherMeta() {
  return db()._meta;
}

/**
 * Daily series for one district, or null if we hold no weather for it.
 *
 * Returns the raw parallel arrays rather than an array of objects: the
 * demand calculation walks them index-by-index against the date axis, and
 * rebuilding 1000 little objects per request to immediately discard them
 * would be waste.
 */
export async function findSeriesForDistrict(districtName) {
  const series = db().districts[districtName];
  if (!series) return null;
  return { district: districtName, ...series };
}

export async function findAllDistrictNames() {
  return Object.keys(db().districts);
}
