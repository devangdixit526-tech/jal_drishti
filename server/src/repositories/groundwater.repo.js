import { loadJson } from './loadJson.js';

/**
 * DATA ACCESS LAYER for groundwater status.
 *
 * Today this reads CGWB's annual block-level categorisation. That is the
 * STRUCTURAL tier: authoritative, published once a year, and therefore always
 * out of date. The DYNAMIC tier - DWLR / observation-well readings - is not
 * public and arrives later; when it does it becomes a second function here
 * (findReadingsForBlock) and the risk service gains a second input. Nothing
 * else in the codebase should need to change.
 */

const db = () => loadJson('groundwater-blocks.json');

export async function findGroundwaterMeta() {
  return db()._meta;
}

export async function findStateSummary() {
  return db().summary;
}

export async function findAllBlocks() {
  return db().units;
}

/** Blocks of one district. Case-insensitive so the API matches regions.repo. */
export async function findBlocksForDistrict(districtName) {
  const needle = String(districtName).trim().toLowerCase();
  return db().units.filter((unit) => unit.district.toLowerCase() === needle);
}

export async function findDistrictNamesWithBlocks() {
  return [...new Set(db().units.map((unit) => unit.district))];
}

/**
 * District boundary polygons, loaded only when actually asked for.
 *
 * Kept out of findAllBlocks deliberately: 107 KB of geometry has no business
 * being attached to a request that only wants a category name.
 */
export async function findDistrictGeometry() {
  return loadJson('haryana-districts.geojson');
}
