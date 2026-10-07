import * as cropsRepo from '../repositories/crops.repo.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * BUSINESS LOGIC LAYER for crops.
 */

export async function listCrops({ season } = {}) {
  const crops = await cropsRepo.findAllCrops();
  if (!season) return crops;

  const wanted = season.toLowerCase();
  return crops.filter((crop) => crop.season.toLowerCase() === wanted);
}

export async function getCrop(term) {
  const crop = await cropsRepo.resolveCrop(term);
  if (!crop) {
    throw ApiError.notFound(`No crop matching '${term}'`);
  }
  return crop;
}

/**
 * Builds the crop comparison payload.
 *
 * This logic currently lives in CropIntelligence.jsx:
 *   const maxWaterDemand = Math.max(...cropsData.map(c => c.waterDemand));
 *   const percentage = (crop.waterDemand / maxWaterDemand) * 100;
 *
 * It belongs here, not in the browser: the same comparison is needed by the
 * dashboard, the modal and (later) the recommendation engine. Computing it in
 * one place is how the three stop disagreeing with each other.
 */
export async function compareCrops({ season } = {}) {
  const crops = await listCrops({ season });
  if (crops.length === 0) {
    throw ApiError.notFound(`No crops found for season '${season}'`);
  }

  const demands = crops.map((crop) => crop.referenceWaterDemandMmPerDay);
  const maxDemand = Math.max(...demands);
  const minDemand = Math.min(...demands);

  const items = crops
    .map((crop) => ({
      id: crop.id,
      name: crop.name,
      season: crop.season,
      waterDemandMmPerDay: crop.referenceWaterDemandMmPerDay,
      demandLevel: crop.demandLevel,
      // Bar width for the comparison chart, so the UI does no math.
      relativeDemandPct: round1((crop.referenceWaterDemandMmPerDay / maxDemand) * 100),
      // Saving vs the thirstiest crop - this is the "-32%" figure on the dashboard.
      savingVsHighestPct: round1(
        ((maxDemand - crop.referenceWaterDemandMmPerDay) / maxDemand) * 100,
      ),
      provisional: crop.provisional,
    }))
    .sort((a, b) => b.waterDemandMmPerDay - a.waterDemandMmPerDay);

  return {
    unit: 'mm/day',
    season: season ?? 'all',
    maxDemandMmPerDay: maxDemand,
    minDemandMmPerDay: minDemand,
    // Surfaced so the UI can honestly badge these numbers as not-yet-computed.
    provisional: crops.some((crop) => crop.provisional),
    items,
  };
}

function round1(value) {
  return Math.round(value * 10) / 10;
}
