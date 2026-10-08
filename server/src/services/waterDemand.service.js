import * as weatherRepo from '../repositories/weather.repo.js';
import * as cropsRepo from '../repositories/crops.repo.js';
import * as regionsRepo from '../repositories/regions.repo.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * BUSINESS LOGIC LAYER for crop water demand - FAO-56.
 *
 * This is the file that replaces the provisional mockup numbers. Everything
 * here is derived from two real inputs:
 *
 *   ETo  - reference evapotranspiration, mm/day, from the weather data
 *   Kc   - crop coefficient, dimensionless, from crops.json (FAO-56 Table 12)
 *
 * and the single FAO-56 identity:
 *
 *   ETc = ETo x Kc            (crop water requirement, mm/day)
 *
 * Kc is not one number - it rises and falls over the season. The curve is
 * built in kcForDay() below.
 */

const STAGES = ['initial', 'development', 'mid', 'late'];

/**
 * Kc on day `dayIndex` of a season `seasonDays` long.
 *
 * The FAO-56 curve has four straight segments:
 *
 *   Kc
 *   |        ____________            <- kc.mid, held through mid-season
 *   |       /            \
 *   |      /              \          <- linear fall to kc.late (FAO: Kc_end)
 *   |_____/                \____
 *      ^ kc.initial, held     ^ harvest
 *        through initial
 *
 * Returning a single season-average Kc instead would understate peak demand,
 * which is exactly the period that empties an aquifer. The peak is the point.
 */
function kcForDay(dayIndex, seasonDays, crop) {
  const { initial: kcIni, mid: kcMid, late: kcEnd } = crop.kc;

  // Stage lengths in days. Fractions sum to 1, so these sum to seasonDays.
  const len = {};
  for (const stage of STAGES) {
    len[stage] = crop.stageFractions[stage] * seasonDays;
  }

  const endInitial = len.initial;
  const endDevelopment = endInitial + len.development;
  const endMid = endDevelopment + len.mid;

  if (dayIndex < endInitial) return kcIni;

  if (dayIndex < endDevelopment) {
    const progress = (dayIndex - endInitial) / len.development;
    return kcIni + (kcMid - kcIni) * progress;
  }

  if (dayIndex < endMid) return kcMid;

  const progress = Math.min((dayIndex - endMid) / len.late, 1);
  return kcMid + (kcEnd - kcMid) * progress;
}

/**
 * Rain the crop can actually use, mm.
 *
 * Two deliberate simplifications, both of which make this an ESTIMATE:
 *
 *  1. 20% of rainfall is assumed lost to runoff and deep percolation. That is
 *     the conventional field factor, not a measurement.
 *  2. Rain beyond the day's own ETc is discarded rather than stored in the
 *     soil for later. A real FAO-56 water balance carries soil moisture
 *     forward, which needs soil texture, rooting depth and field capacity -
 *     none of which we hold.
 *
 * The consequence is a CONSERVATIVE bias: on days with heavy rain this
 * under-credits the crop, so irrigation need comes out slightly high. Stated
 * plainly in the methodology endpoint rather than buried here.
 */
export const RAINFALL_EFFICIENCY = 0.8;

function effectiveRainfall(rainMm, etcMm) {
  if (!rainMm || rainMm <= 0) return 0;
  return Math.min(rainMm * RAINFALL_EFFICIENCY, etcMm);
}

/**
 * Walks one crop season day by day for one district.
 *
 * `sowingYear` picks which season: wheat sown 2025-11-15 runs into 2026, and
 * sugarcane runs 330 days, so a season routinely crosses the year boundary.
 */
export async function computeSeasonDemand({ districtName, cropTerm, sowingYear }) {
  const district = await resolveHaryanaDistrict(districtName);
  const crop = await cropsRepo.resolveCrop(cropTerm);
  if (!crop) throw ApiError.notFound(`No crop matching '${cropTerm}'`);

  const series = await weatherRepo.findSeriesForDistrict(district.name);
  if (!series) {
    throw ApiError.notFound(`No weather series for district '${district.name}'`);
  }

  const dates = await weatherRepo.findDates();
  const sowingDate = `${sowingYear}-${crop.typicalSowing}`;
  const startIndex = dates.indexOf(sowingDate);
  if (startIndex === -1) {
    throw ApiError.badRequest(
      `No weather data for sowing date ${sowingDate}`,
      { availableFrom: dates[0], availableTo: dates.at(-1) },
    );
  }

  const seasonDays = crop.growthDays;
  const lastIndex = Math.min(startIndex + seasonDays - 1, dates.length - 1);
  const daysCovered = lastIndex - startIndex + 1;

  const daily = [];
  let etcTotal = 0;
  let rainTotal = 0;
  let effectiveRainTotal = 0;
  let irrigationTotal = 0;
  let peak = { etcMmPerDay: -1 };

  for (let i = startIndex; i <= lastIndex; i += 1) {
    const dayIndex = i - startIndex;
    const eto = series.eto[i];
    const rain = series.rain[i] ?? 0;
    if (eto === null || eto === undefined) continue;

    const kc = kcForDay(dayIndex, seasonDays, crop);
    const etc = eto * kc;
    const rainEffective = effectiveRainfall(rain, etc);
    const irrigation = Math.max(0, etc - rainEffective);

    etcTotal += etc;
    rainTotal += rain;
    effectiveRainTotal += rainEffective;
    irrigationTotal += irrigation;

    const day = {
      date: dates[i],
      dayOfSeason: dayIndex + 1,
      stage: stageForDay(dayIndex, seasonDays, crop),
      etoMmPerDay: round2(eto),
      kc: round3(kc),
      etcMmPerDay: round2(etc),
      rainMm: round1(rain),
      effectiveRainMm: round2(rainEffective),
      irrigationNeedMm: round2(irrigation),
    };
    daily.push(day);
    if (etc > peak.etcMmPerDay) peak = day;
  }

  if (daily.length === 0) {
    throw ApiError.notFound(`No usable weather days for ${district.name} from ${sowingDate}`);
  }

  return {
    district: district.name,
    districtId: district.id,
    crop: { id: crop.id, name: crop.name, season: crop.season },
    season: {
      sowingDate,
      harvestDate: dates[lastIndex],
      plannedDays: seasonDays,
      daysWithWeatherData: daysCovered,
      // True when the weather axis ran out before the season ended. Totals
      // below are then partial, and saying so is the difference between an
      // estimate and a wrong number.
      truncated: daysCovered < seasonDays,
    },
    totals: {
      cropWaterRequirementMm: round1(etcTotal),
      rainfallMm: round1(rainTotal),
      effectiveRainfallMm: round1(effectiveRainTotal),
      // The number that actually matters: what must come from somewhere else,
      // and in Haryana that somewhere is overwhelmingly groundwater.
      irrigationNeedMm: round1(irrigationTotal),
      rainfallMetPct: etcTotal > 0 ? round1((effectiveRainTotal / etcTotal) * 100) : 0,
    },
    averages: {
      etcMmPerDay: round2(etcTotal / daily.length),
      etoMmPerDay: round2(daily.reduce((sum, d) => sum + d.etoMmPerDay, 0) / daily.length),
    },
    peakDemand: {
      date: peak.date,
      stage: peak.stage,
      etcMmPerDay: peak.etcMmPerDay,
    },
    method: 'FAO-56 single crop coefficient (ETc = ETo x Kc)',
    // The whole point of this service: these are computed, not carried over
    // from the UI mockup. crops.json still flags its own seed value as
    // provisional - this result is not.
    provisional: false,
    daily,
  };
}

function stageForDay(dayIndex, seasonDays, crop) {
  let cumulative = 0;
  for (const stage of STAGES) {
    cumulative += crop.stageFractions[stage] * seasonDays;
    if (dayIndex < cumulative) return stage;
  }
  return 'late';
}

/**
 * Compares every crop of a season for one district, cheapest water first.
 *
 * This is what a crop-switching recommendation must be built on. The
 * dashboard's existing "Paddy -> Maize, -32%" claim came from provisional
 * mockup numbers and does not match its own data; this replaces it with a
 * figure derived from that district's actual weather.
 */
export async function compareCropDemand({ districtName, season, sowingYear }) {
  const district = await resolveHaryanaDistrict(districtName);
  const allCrops = await cropsRepo.findAllCrops();
  const crops = season
    ? allCrops.filter((crop) => crop.season.toLowerCase() === season.toLowerCase())
    : allCrops;

  if (crops.length === 0) {
    throw ApiError.notFound(`No crops found for season '${season}'`);
  }

  const results = [];
  const skipped = [];
  for (const crop of crops) {
    try {
      const demand = await computeSeasonDemand({
        districtName: district.name,
        cropTerm: crop.id,
        sowingYear,
      });
      results.push({
        cropId: crop.id,
        name: crop.name,
        season: crop.season,
        sowingDate: demand.season.sowingDate,
        truncated: demand.season.truncated,
        cropWaterRequirementMm: demand.totals.cropWaterRequirementMm,
        irrigationNeedMm: demand.totals.irrigationNeedMm,
        rainfallMetPct: demand.totals.rainfallMetPct,
        avgEtcMmPerDay: demand.averages.etcMmPerDay,
      });
    } catch (error) {
      // One crop whose season falls outside the weather window must not fail
      // the whole comparison - report it as skipped instead.
      if (error.isApiError) {
        skipped.push({ cropId: crop.id, reason: error.message });
        continue;
      }
      throw error;
    }
  }

  if (results.length === 0) {
    throw ApiError.badRequest(
      `No crop season for '${season ?? 'any season'}' fits the available weather window`,
      { skipped },
    );
  }

  results.sort((a, b) => a.irrigationNeedMm - b.irrigationNeedMm);
  const thirstiest = results.at(-1);

  // Saving is expressed against the thirstiest crop, and the basis is named
  // in the payload. The dashboard's old -32% was ambiguous about whether it
  // meant total demand or daily rate; this is not.
  for (const row of results) {
    row.savingVsThirstiestPct = thirstiest.irrigationNeedMm > 0
      ? round1(((thirstiest.irrigationNeedMm - row.irrigationNeedMm) / thirstiest.irrigationNeedMm) * 100)
      : 0;
  }

  return {
    district: district.name,
    districtId: district.id,
    season: season ?? 'all',
    sowingYear,
    basis: 'irrigationNeedMm over the whole season',
    unit: 'mm',
    thirstiestCropId: thirstiest.cropId,
    leastThirstyCropId: results[0].cropId,
    provisional: false,
    items: results,
    skipped,
  };
}

/**
 * Looks a district up and refuses anything outside Haryana.
 *
 * regions.json still carries Punjab and partial Uttar Pradesh from the
 * original seed, but weather and groundwater were collected for Haryana only.
 * Failing loudly here beats silently returning an empty series.
 */
async function resolveHaryanaDistrict(districtName) {
  const districts = await regionsRepo.findDistrictsByStateId('HR');
  const needle = String(districtName).trim().toLowerCase();
  const match = districts.find(
    (district) =>
      district.name.toLowerCase() === needle || district.id.toLowerCase() === needle,
  );
  if (!match) {
    throw ApiError.notFound(
      `No Haryana district matching '${districtName}'`,
      { hint: 'This dataset covers Haryana only. GET /api/v1/states/HR/districts lists the 22.' },
    );
  }
  return match;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}
function round2(value) {
  return Math.round(value * 100) / 100;
}
function round3(value) {
  return Math.round(value * 1000) / 1000;
}
