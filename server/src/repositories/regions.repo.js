import { loadJson } from './loadJson.js';

/**
 * DATA ACCESS LAYER for states and districts.
 *
 * This is the ONLY file in the app that knows regions live in a JSON file.
 * When Postgres/PostGIS arrives, rewrite the bodies of these functions as SQL
 * queries - every caller keeps working untouched.
 *
 * All functions are async even though JSON reads are synchronous, precisely so
 * that swapping in a real database does not change a single call site.
 */

const db = () => loadJson('regions.json');

export async function findAllStates() {
  return db().states;
}

export async function findStateById(stateId) {
  const id = String(stateId).toUpperCase();
  return db().states.find((state) => state.id === id) ?? null;
}

export async function findDistrictsByStateId(stateId) {
  const id = String(stateId).toUpperCase();
  return db()
    .districts.filter((district) => district.stateId === id)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function findDistrictById(districtId) {
  const id = String(districtId).toUpperCase();
  return db().districts.find((district) => district.id === id) ?? null;
}
