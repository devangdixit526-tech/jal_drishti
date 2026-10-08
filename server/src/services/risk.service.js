import * as groundwaterRepo from '../repositories/groundwater.repo.js';
import * as regionsRepo from '../repositories/regions.repo.js';
import { compareCropDemand, RAINFALL_EFFICIENCY } from './waterDemand.service.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * BUSINESS LOGIC LAYER for groundwater stress risk.
 *
 * The audience for this number is a government officer deciding where to
 * restrict extraction. That has two consequences for how it is built:
 *
 *  1. Every weight and threshold is a named constant in this file, and
 *     getMethodology() returns them. A score nobody can audit is a score
 *     nobody should act on.
 *  2. The score is split into its components in every response. "Critical"
 *     alone is not actionable; "Critical because 7 of 9 blocks are
 *     over-exploited AND demand is high" tells you what to do about it.
 */

/**
 * The four CGWB categories, which are the official ones.
 *
 * Deliberately four, not three. server/README.md flagged that the dashboard
 * legend declared four classes while RiskMap.jsx implemented three; CGWB's own
 * categorisation is the tie-breaker, and it is these four.
 *
 * Scores are the midpoint of each category's stage-of-extraction band, so the
 * number means something physical rather than being an arbitrary 1-2-3-4:
 *   Safe <=70%, Semi-Critical 70-90%, Critical 90-100%, Over-Exploited >100%.
 */
export const CATEGORY_SCORES = Object.freeze({
  Safe: 35,
  'Semi-Critical': 80,
  Critical: 95,
  'Over-Exploited': 110,
  // Saline blocks are a water-QUALITY exclusion, not a quantity category.
  // Scoring them would silently mix two different problems, so they are
  // counted and reported but left out of the extraction average.
  Saline: null,
});

const WEIGHTS = Object.freeze({
  extraction: 0.6,
  demand: 0.4,
});

/** Added on top of the weighted score when blocks are trending the wrong way. */
const TREND_PENALTY_PER_WORSENED_BLOCK = 2;
const TREND_PENALTY_CAP = 10;

const RISK_BANDS = Object.freeze([
  { max: 40, band: 'Low' },
  { max: 60, band: 'Moderate' },
  { max: 80, band: 'High' },
  { max: Infinity, band: 'Critical' },
]);

/**
 * Demand normalisation reference, mm of irrigation over one season.
 *
 * 1000 mm is roughly what paddy needs across a Haryana kharif season, so it
 * anchors "100% demand stress" to the thirstiest realistic case rather than
 * to whatever happens to be the maximum in the current request. Using a
 * request-relative maximum would make a district's score change depending on
 * which other districts were asked about, which is indefensible.
 */
const DEMAND_REFERENCE_MM = 1000;

export async function getDistrictRisk({ districtName, season, sowingYear }) {
  const district = await resolveHaryanaDistrict(districtName);
  const blocks = await groundwaterRepo.findBlocksForDistrict(district.name);
  if (blocks.length === 0) {
    throw ApiError.notFound(`No groundwater assessment blocks for '${district.name}'`);
  }

  const extraction = scoreExtraction(blocks);
  const demand = await scoreDemand({ district, season, sowingYear });

  const weighted =
    extraction.score * WEIGHTS.extraction + demand.score * WEIGHTS.demand;
  const trendPenalty = Math.min(
    extraction.blocksWorsened * TREND_PENALTY_PER_WORSENED_BLOCK,
    TREND_PENALTY_CAP,
  );
  const total = clamp(weighted + trendPenalty, 0, 100);

  return {
    district: district.name,
    districtId: district.id,
    riskScore: round1(total),
    riskBand: bandFor(total),
    components: {
      extraction,
      demand,
      trendPenalty,
    },
    // Named so a reader can tell WHY this district scores what it does
    // without having to reverse-engineer the arithmetic.
    drivers: buildDrivers(extraction, demand),
    methodologyUrl: '/api/v1/risk/methodology',
  };
}

/**
 * The STRUCTURAL half of the score: CGWB's annual block categorisation.
 *
 * Averaged across the district's blocks rather than taking the worst one. A
 * district with 1 over-exploited block out of 9 is not in the same trouble as
 * one with 9 of 9, and max() would call them identical.
 */
function scoreExtraction(blocks) {
  const counts = {};
  let sum = 0;
  let scored = 0;
  let saline = 0;
  let worsened = 0;
  let improved = 0;

  for (const block of blocks) {
    const category = block.category2025;
    counts[category] = (counts[category] ?? 0) + 1;
    const score = CATEGORY_SCORES[category];
    if (score === null || score === undefined) {
      saline += 1;
    } else {
      sum += score;
      scored += 1;
    }
    if (block.trend === 'worsened') worsened += 1;
    if (block.trend === 'improved') improved += 1;
  }

  const mean = scored > 0 ? sum / scored : 0;
  const stressed = blocks.filter((block) =>
    ['Critical', 'Over-Exploited'].includes(block.category2025),
  ).length;

  return {
    // Capped at 100 for the weighting, because Over-Exploited scores 110 by
    // design - the raw mean is kept alongside it so nothing is hidden.
    score: round1(clamp(mean, 0, 100)),
    rawMeanCategoryScore: round1(mean),
    blockCount: blocks.length,
    blocksScored: scored,
    blocksSaline: saline,
    blocksCriticalOrWorse: stressed,
    blocksWorsened: worsened,
    blocksImproved: improved,
    categoryCounts: counts,
    worstCategory: worstCategoryOf(counts),
    source: 'CGWB block-wise categorisation, GWRA-2025 vs GWRA-2024',
    tier: 'structural (annual, authoritative)',
  };
}

/**
 * The DEMAND half: how much irrigation this district's cropping actually needs.
 *
 * Uses the thirstiest crop of the season, not the average. The aquifer is
 * drawn down by what is actually grown, and in Haryana that is paddy and
 * wheat - averaging them against millets would flatter the score.
 */
async function scoreDemand({ district, season, sowingYear }) {
  let comparison;
  try {
    comparison = await compareCropDemand({
      districtName: district.name,
      season,
      sowingYear,
    });
  } catch (error) {
    if (error.isApiError) {
      // No weather window for this season: report the demand half as
      // unavailable rather than scoring it as zero, which would understate
      // risk for the worst-affected districts.
      return {
        score: 0,
        available: false,
        reason: error.message,
        tier: 'dynamic (computed from weather, FAO-56)',
      };
    }
    throw error;
  }

  const thirstiest = comparison.items.find(
    (item) => item.cropId === comparison.thirstiestCropId,
  );

  return {
    score: round1(clamp((thirstiest.irrigationNeedMm / DEMAND_REFERENCE_MM) * 100, 0, 100)),
    available: true,
    referenceCropId: thirstiest.cropId,
    referenceCropName: thirstiest.name,
    irrigationNeedMm: thirstiest.irrigationNeedMm,
    cropWaterRequirementMm: thirstiest.cropWaterRequirementMm,
    rainfallMetPct: thirstiest.rainfallMetPct,
    truncatedSeason: thirstiest.truncated,
    normalisedAgainstMm: DEMAND_REFERENCE_MM,
    source: 'FAO-56 ETc = ETo x Kc, Open-Meteo ERA5 reanalysis',
    tier: 'dynamic (computed from weather, FAO-56)',
  };
}

function buildDrivers(extraction, demand) {
  const drivers = [];
  const { blockCount, blocksCriticalOrWorse, blocksWorsened, categoryCounts } = extraction;

  const overExploited = categoryCounts['Over-Exploited'] ?? 0;
  if (overExploited > 0) {
    drivers.push(
      `${overExploited} of ${blockCount} blocks are Over-Exploited (extraction above 100% of recharge).`,
    );
  }
  if (blocksCriticalOrWorse > 0 && overExploited !== blocksCriticalOrWorse) {
    drivers.push(`${blocksCriticalOrWorse} of ${blockCount} blocks are Critical or worse.`);
  }
  if (blocksWorsened > 0) {
    drivers.push(
      `${blocksWorsened} block(s) moved to a worse category between GWRA-2024 and GWRA-2025.`,
    );
  }
  if (extraction.blocksImproved > 0) {
    drivers.push(`${extraction.blocksImproved} block(s) improved since GWRA-2024.`);
  }
  if (demand.available) {
    drivers.push(
      `Thirstiest crop ${demand.referenceCropName} needs ${demand.irrigationNeedMm} mm of irrigation, ` +
        `with rainfall covering only ${demand.rainfallMetPct}% of crop water requirement.`,
    );
  } else {
    drivers.push('Crop water demand could not be computed for this season (no weather window).');
  }
  if (drivers.length === 0) {
    drivers.push('All blocks are in the Safe category and demand is low.');
  }
  return drivers;
}

/** Every Haryana district, ranked worst first. This is the dashboard's table. */
export async function getRiskRanking({ season, sowingYear }) {
  const districts = await regionsRepo.findDistrictsByStateId('HR');
  const rows = [];
  const skipped = [];

  for (const district of districts) {
    try {
      const risk = await getDistrictRisk({
        districtName: district.name,
        season,
        sowingYear,
      });
      rows.push({
        districtId: risk.districtId,
        district: risk.district,
        riskScore: risk.riskScore,
        riskBand: risk.riskBand,
        blocksCriticalOrWorse: risk.components.extraction.blocksCriticalOrWorse,
        blockCount: risk.components.extraction.blockCount,
        blocksWorsened: risk.components.extraction.blocksWorsened,
        worstCategory: risk.components.extraction.worstCategory,
        irrigationNeedMm: risk.components.demand.irrigationNeedMm ?? null,
        demandAvailable: risk.components.demand.available,
      });
    } catch (error) {
      if (error.isApiError) {
        skipped.push({ district: district.name, reason: error.message });
        continue;
      }
      throw error;
    }
  }

  rows.sort((a, b) => b.riskScore - a.riskScore);
  return {
    state: 'Haryana',
    season: season ?? 'all',
    sowingYear,
    count: rows.length,
    bandCounts: countBy(rows.map((row) => row.riskBand)),
    items: rows,
    skipped,
  };
}

/**
 * GeoJSON for the map, with the risk score attached to each district polygon.
 *
 * This is what replaces the hardcoded coordinate list in RiskMap.jsx. The
 * component should style from properties.riskBand and stop carrying its own
 * copy of the data.
 */
export async function getRiskMap({ season, sowingYear }) {
  const geometry = await groundwaterRepo.findDistrictGeometry();
  const ranking = await getRiskRanking({ season, sowingYear });
  const byDistrict = new Map(ranking.items.map((row) => [row.district, row]));

  const features = geometry.features.map((feature) => {
    const row = byDistrict.get(feature.properties.district);
    return {
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        ...feature.properties,
        riskScore: row?.riskScore ?? null,
        riskBand: row?.riskBand ?? null,
        blocksCriticalOrWorse: row?.blocksCriticalOrWorse ?? null,
        blockCount: row?.blockCount ?? null,
        blocksWorsened: row?.blocksWorsened ?? null,
        worstCategory: row?.worstCategory ?? null,
        irrigationNeedMm: row?.irrigationNeedMm ?? null,
      },
    };
  });

  return {
    type: 'FeatureCollection',
    _meta: {
      season: ranking.season,
      sowingYear,
      bands: RISK_BANDS.map((band) => band.band),
      categories: Object.keys(CATEGORY_SCORES),
      districtsScored: ranking.count,
      methodologyUrl: '/api/v1/risk/methodology',
      caveat:
        'Polygons are DISTRICT level. CGWB assesses per BLOCK, so a district ' +
        'polygon averages several blocks - see components.extraction for the split.',
    },
    features,
  };
}

/**
 * The audit trail. Returns every constant the score depends on.
 *
 * An officer asked to justify a restriction order needs to be able to show
 * where the number came from. That makes this endpoint part of the product,
 * not documentation.
 */
export async function getMethodology() {
  const groundwaterMeta = await groundwaterRepo.findGroundwaterMeta();

  return {
    summary:
      'Risk = 0.6 x extraction stress + 0.4 x crop water demand, plus a trend ' +
      'penalty of 2 points per block that worsened since last year (capped at 10).',
    components: {
      extraction: {
        weight: WEIGHTS.extraction,
        tier: 'structural',
        input: 'CGWB block-wise categorisation (GWRA-2025, compared with GWRA-2024)',
        method:
          'Each block scores the midpoint of its category stage-of-extraction band. ' +
          'The district score is the mean across its blocks, clamped to 100.',
        categoryScores: CATEGORY_SCORES,
        categoryDefinition: groundwaterMeta.categoryDefinition,
        salineHandling:
          'Saline blocks are a water-quality exclusion, not a quantity category. ' +
          'They are counted and reported but excluded from the mean.',
      },
      demand: {
        weight: WEIGHTS.demand,
        tier: 'dynamic',
        input: 'Open-Meteo ERA5 daily ETo + FAO-56 Table 12 crop coefficients',
        method:
          'ETc = ETo x Kc summed over the season, minus effective rainfall, ' +
          'for the THIRSTIEST crop of the season (not the average).',
        normalisedAgainstMm: DEMAND_REFERENCE_MM,
        rainfallEfficiency: RAINFALL_EFFICIENCY,
      },
      trend: {
        pointsPerWorsenedBlock: TREND_PENALTY_PER_WORSENED_BLOCK,
        cap: TREND_PENALTY_CAP,
        input: 'GWRA-2025 category vs GWRA-2024 category, per block',
      },
    },
    bands: RISK_BANDS.map(({ max, band }) => ({
      band,
      upperBound: max === Infinity ? null : max,
    })),
    limitations: [
      'No live DWLR/telemetry data. CGWB categorisation is ANNUAL, so the ' +
        'structural half of the score cannot detect within-year deterioration.',
      'Observation-well readings available publicly cover 2019-2022 and are ' +
        'manual quarterly measurements, not continuous sensor output.',
      'Effective rainfall assumes 20% loss and carries NO soil moisture ' +
        'between days, because soil texture and rooting depth are not held. ' +
        'This biases irrigation need slightly high.',
      'Crop water demand assumes one representative sowing date per crop and ' +
        'generic FAO-56 stage lengths, neither field-verified for Haryana.',
      'Demand is computed per DISTRICT centroid, so it does not vary between ' +
        'blocks inside a district.',
      'Actual cropped AREA is not used - demand is per-hectare intensity, not ' +
        'total district abstraction. Sentinel-2 crop classification would fix this.',
      'The reference crop is the thirstiest crop of the season, whether or not ' +
        'it is actually grown in that district. Cotton, for example, drives the ' +
        'kharif figure for districts outside the cotton belt where nobody plants ' +
        'it. This overstates demand there, and only real cropping-pattern data ' +
        'can correct it.',
      'ETc for PADDY is evapotranspiration only. Puddled rice also loses large ' +
        'volumes to percolation and seepage, plus water for land preparation, ' +
        'none of which FAO-56 ETc captures. Field water applied to paddy in ' +
        'Haryana is therefore substantially higher than the figure here - which ' +
        'means paddy risk is UNDERSTATED, not overstated.',
    ],
    sources: {
      groundwater: groundwaterMeta.sourceUrls,
      weather: 'https://archive-api.open-meteo.com/v1/archive',
      cropCoefficients: 'FAO Irrigation and Drainage Paper 56, Table 12',
      stageLengths: 'FAO Irrigation and Drainage Paper 56, Table 11',
    },
  };
}

export async function getGroundwaterStatus({ districtName } = {}) {
  const meta = await groundwaterRepo.findGroundwaterMeta();

  if (!districtName) {
    const summary = await groundwaterRepo.findStateSummary();
    return { scope: 'state', state: 'Haryana', summary, _meta: meta };
  }

  const district = await resolveHaryanaDistrict(districtName);
  const blocks = await groundwaterRepo.findBlocksForDistrict(district.name);
  if (blocks.length === 0) {
    throw ApiError.notFound(`No groundwater assessment blocks for '${district.name}'`);
  }

  return {
    scope: 'district',
    district: district.name,
    districtId: district.id,
    blockCount: blocks.length,
    categoryCounts: countBy(blocks.map((block) => block.category2025)),
    trendCounts: countBy(blocks.map((block) => block.trend).filter(Boolean)),
    blocks,
    _meta: meta,
  };
}

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

function worstCategoryOf(counts) {
  const order = ['Over-Exploited', 'Critical', 'Semi-Critical', 'Safe'];
  return order.find((category) => counts[category] > 0) ?? null;
}

function bandFor(score) {
  return RISK_BANDS.find((band) => score <= band.max).band;
}

function countBy(values) {
  const out = {};
  for (const value of values) out[value] = (out[value] ?? 0) + 1;
  return out;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round1(value) {
  return Math.round(value * 10) / 10;
}
