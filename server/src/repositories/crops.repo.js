import { loadJson } from './loadJson.js';

/**
 * DATA ACCESS LAYER for crops. Same contract as regions.repo.js - swap the
 * bodies for SQL when the database lands, callers stay unchanged.
 */

const db = () => loadJson('crops.json');

export async function findAllCrops() {
  return db().crops;
}

export async function findCropById(cropId) {
  const id = String(cropId).toLowerCase();
  return db().crops.find((crop) => crop.id === id) ?? null;
}

/**
 * Resolves a crop by id OR display name OR alias, case-insensitively.
 *
 * Needed because the existing frontend passes human labels like
 * "Paddy (Rice)" rather than ids. Accepting both keeps the API usable
 * during the migration instead of forcing a big-bang frontend rewrite.
 */
export async function resolveCrop(term) {
  const needle = String(term).trim().toLowerCase();
  return (
    db().crops.find(
      (crop) =>
        crop.id === needle ||
        crop.name.toLowerCase() === needle ||
        crop.aliases.some((alias) => alias.toLowerCase() === needle),
    ) ?? null
  );
}
