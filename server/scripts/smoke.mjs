/**
 * Smoke test: hits every endpoint and asserts the HTTP status, then checks
 * that the computed numbers are sane.
 *
 * Not a substitute for real unit tests - it is the 10-second check that the
 * API is wired up and the error paths behave. Run it after any change:
 *
 *   npm run dev          (in one terminal)
 *   npm run smoke        (in another)
 *
 * The second section exists because status codes alone cannot catch a broken
 * calculation: /water-demand returning 200 with nonsense numbers would have
 * passed the first section happily. Anything that computes a value gets at
 * least one assertion about that value.
 */
const base = process.env.SMOKE_BASE_URL ?? 'http://localhost:4000';

const statusTests = [
  ['/api/v1', 200, 'API index'],
  ['/api/v1/health', 200, 'health probe'],
  ['/api/v1/states', 200, 'all states'],
  ['/api/v1/states/PB/districts', 200, 'Punjab districts (cascade)'],
  ['/api/v1/states/HR/districts', 200, 'Haryana districts (cascade)'],
  ['/api/v1/states/pb/districts', 200, 'lowercase state id still works'],
  ['/api/v1/states/ZZ/districts', 404, 'unknown state -> 404'],
  ['/api/v1/districts/PB-LDH', 200, 'Ludhiana detail'],
  ['/api/v1/districts/NOPE', 404, 'unknown district -> 404'],
  ['/api/v1/crops', 200, 'all crops'],
  ['/api/v1/crops?season=Rabi', 200, 'crops filtered by season'],
  ['/api/v1/crops?season=Monsoon', 400, 'bad season -> 400 validation'],
  ['/api/v1/crops/compare', 200, 'comparison payload'],
  ['/api/v1/crops/compare?season=Kharif', 200, 'comparison, one season'],
  ['/api/v1/crops/paddy', 200, 'crop by id'],
  ['/api/v1/crops/Paddy%20(Rice)', 200, 'crop by legacy UI alias'],
  ['/api/v1/crops/bananas', 404, 'unknown crop -> 404'],

  // --- groundwater (CGWB block categorisation) ---
  ['/api/v1/groundwater/status', 200, 'Haryana block summary'],
  ['/api/v1/groundwater/status?district=Karnal', 200, 'blocks of one district'],
  ['/api/v1/groundwater/status?district=Ludhiana', 404, 'non-Haryana district -> 404'],

  // --- water demand (FAO-56) ---
  ['/api/v1/water-demand?district=Karnal&crop=paddy&year=2025', 200, 'FAO-56 season demand'],
  ['/api/v1/water-demand?district=Karnal&crop=paddy&year=2025&daily=true', 200, 'with daily series'],
  ['/api/v1/water-demand?district=HR-KNL&crop=Paddy%20(Rice)', 200, 'district id + crop alias'],
  ['/api/v1/water-demand?district=Karnal', 400, 'missing crop -> 400'],
  ['/api/v1/water-demand?district=Karnal&crop=bananas', 404, 'unknown crop -> 404'],
  ['/api/v1/water-demand?district=Ludhiana&crop=paddy', 404, 'non-Haryana district -> 404'],
  ['/api/v1/water-demand?district=Karnal&crop=paddy&year=2019', 400, 'year outside weather window -> 400'],
  ['/api/v1/water-demand/compare?district=Karnal&season=Kharif&year=2025', 200, 'crop comparison'],
  ['/api/v1/water-demand/compare?district=Karnal&season=Monsoon', 400, 'bad season -> 400'],

  // --- risk ---
  ['/api/v1/risk/methodology', 200, 'auditable methodology'],
  ['/api/v1/risk/score?district=Karnal&season=Kharif&year=2025', 200, 'one district risk'],
  ['/api/v1/risk/score?district=ZZZ', 404, 'unknown district -> 404'],
  ['/api/v1/risk/score', 400, 'missing district -> 400'],
  ['/api/v1/risk/ranking?season=Kharif&year=2025', 200, 'all districts ranked'],
  ['/api/v1/risk/map?season=Kharif&year=2025', 200, 'GeoJSON for the map'],

  ['/api/v1/nope', 404, 'unknown route -> 404 JSON'],
];

/**
 * Value assertions. Each returns a list of [label, ok] pairs.
 *
 * Bounds are deliberately loose - they are here to catch a broken formula
 * (a zero, a NaN, a unit slip of 10x), not to pin exact values that would
 * churn every time the weather data is refreshed.
 */
const valueChecks = [
  ['FAO-56 demand is computed, not provisional', async () => {
    const { data } = await getJson('/api/v1/water-demand?district=Karnal&crop=paddy&year=2025');
    return [
      ['provisional flag is false', data.provisional === false],
      ['season is not truncated', data.season.truncated === false],
      ['sowing date matches crops.json', data.season.sowingDate === '2025-06-15'],
      ['ETc total in 100-2000 mm', between(data.totals.cropWaterRequirementMm, 100, 2000)],
      ['irrigation need > 0 and <= ETc', data.totals.irrigationNeedMm > 0
        && data.totals.irrigationNeedMm <= data.totals.cropWaterRequirementMm],
      ['peak ETc >= mean ETc', data.peakDemand.etcMmPerDay >= data.averages.etcMmPerDay],
      ['mean ETo in 1-12 mm/day', between(data.averages.etoMmPerDay, 1, 12)],
    ];
  }],

  ['Kc curve runs through all four stages', async () => {
    const { data } = await getJson('/api/v1/water-demand?district=Karnal&crop=paddy&year=2025&daily=true');
    const stages = new Set(data.daily.map((d) => d.stage));
    const kcs = data.daily.map((d) => d.kc);
    return [
      ['daily rows match planned days', data.daily.length === data.season.plannedDays],
      ['all four stages present', ['initial', 'development', 'mid', 'late'].every((s) => stages.has(s))],
      ['Kc peaks at kc.mid (1.2 for paddy)', Math.max(...kcs) === 1.2],
      ['ETc = ETo x Kc on every row', data.daily.every((d) =>
        Math.abs(d.etoMmPerDay * d.kc - d.etcMmPerDay) < 0.02)],
      ['effective rain never exceeds ETc', data.daily.every((d) => d.effectiveRainMm <= d.etcMmPerDay + 1e-9)],
    ];
  }],

  ['Crop comparison is ordered and consistent', async () => {
    const { data } = await getJson('/api/v1/water-demand/compare?district=Karnal&season=Kharif&year=2025');
    const needs = data.items.map((i) => i.irrigationNeedMm);
    return [
      ['at least 3 kharif crops', data.items.length >= 3],
      ['sorted ascending by irrigation need', needs.every((n, i) => i === 0 || needs[i - 1] <= n)],
      ['thirstiest has 0% saving', data.items.at(-1).savingVsThirstiestPct === 0],
      ['least thirsty saves the most', data.items[0].savingVsThirstiestPct
        === Math.max(...data.items.map((i) => i.savingVsThirstiestPct))],
      ['millets thirstier than nothing / cheapest is not paddy', data.leastThirstyCropId !== 'paddy'],
    ];
  }],

  ['Groundwater matches CGWB published totals', async () => {
    const { data } = await getJson('/api/v1/groundwater/status');
    const s2025 = data.summary['2025'];
    const total = Object.values(s2025).reduce((a, b) => a + b, 0);
    return [
      ['143 assessment units', total === 143],
      ['91 Over-Exploited', s2025['Over-Exploited'] === 91],
      ['6 Critical', s2025.Critical === 6],
      ['15 Semi-Critical', s2025['Semi-Critical'] === 15],
      ['31 Safe', s2025.Safe === 31],
      ['9 blocks worsened since 2024', data.summary.trend.worsened === 9],
    ];
  }],

  ['Risk score decomposes and bands correctly', async () => {
    const { data } = await getJson('/api/v1/risk/score?district=Mahendragarh&season=Kharif&year=2025');
    const { extraction, demand, trendPenalty } = data.components;
    const expected = extraction.score * 0.6 + demand.score * 0.4 + trendPenalty;
    return [
      ['score in 0-100', between(data.riskScore, 0, 100)],
      ['band is one of the four', ['Low', 'Moderate', 'High', 'Critical'].includes(data.riskBand)],
      ['score equals its own weighted components', Math.abs(data.riskScore - Math.min(expected, 100)) < 0.15],
      ['all 8 blocks counted', extraction.blockCount === 8],
      ['demand half is available', demand.available === true],
      ['drivers explain the score', Array.isArray(data.drivers) && data.drivers.length > 0],
    ];
  }],

  ['Ranking covers every district, worst first', async () => {
    const { data } = await getJson('/api/v1/risk/ranking?season=Kharif&year=2025');
    const scores = data.items.map((i) => i.riskScore);
    return [
      ['all 22 Haryana districts', data.count === 22],
      ['sorted descending by score', scores.every((s, i) => i === 0 || scores[i - 1] >= s)],
      ['no district skipped', data.skipped.length === 0],
      ['bands add up to 22', Object.values(data.bandCounts).reduce((a, b) => a + b, 0) === 22],
    ];
  }],

  ['Risk map is valid GeoJSON with scores attached', async () => {
    const geo = await getJson('/api/v1/risk/map?season=Kharif&year=2025');
    return [
      ['is a FeatureCollection', geo.type === 'FeatureCollection'],
      ['22 features', geo.features.length === 22],
      ['every feature has geometry', geo.features.every((f) => f.geometry?.coordinates?.length > 0)],
      ['every feature scored', geo.features.every((f) => typeof f.properties.riskScore === 'number')],
      ['every feature banded', geo.features.every((f) => typeof f.properties.riskBand === 'string')],
    ];
  }],

  ['Methodology exposes every constant it uses', async () => {
    const { data } = await getJson('/api/v1/risk/methodology');
    const weights = data.components.extraction.weight + data.components.demand.weight;
    return [
      ['weights sum to 1', Math.abs(weights - 1) < 1e-9],
      ['four CGWB categories scored', Object.keys(data.components.extraction.categoryScores).length >= 4],
      ['four risk bands published', data.bands.length === 4],
      ['limitations are stated', data.limitations.length >= 5],
      ['sources are cited', Boolean(data.sources.weather && data.sources.cropCoefficients)],
    ];
  }],
];

function between(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

async function getJson(path) {
  const res = await fetch(base + path);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
}

let pass = 0;
let total = 0;
const failures = [];

console.log('STATUS CODES');
for (const [path, want, label] of statusTests) {
  total++;
  try {
    const res = await fetch(base + path);
    if (res.status === want) {
      pass++;
      console.log(`  ok    ${String(res.status).padEnd(3)}  ${path.padEnd(58)} ${label}`);
    } else {
      failures.push(`${path} -> ${res.status}, expected ${want}`);
      console.log(`  FAIL  ${String(res.status).padEnd(3)}  ${path.padEnd(58)} expected ${want}`);
    }
  } catch (error) {
    failures.push(`${path} -> ${error.message}`);
    console.log(`  FAIL  ERR  ${path.padEnd(58)} ${error.message}`);
  }
}

console.log('\nCOMPUTED VALUES');
for (const [group, run] of valueChecks) {
  let results;
  try {
    results = await run();
  } catch (error) {
    total++;
    failures.push(`${group} -> ${error.message}`);
    console.log(`  FAIL  ${group}: ${error.message}`);
    continue;
  }
  console.log(`  ${group}`);
  for (const [label, ok] of results) {
    total++;
    if (ok) {
      pass++;
      console.log(`    ok    ${label}`);
    } else {
      failures.push(`${group} / ${label}`);
      console.log(`    FAIL  ${label}`);
    }
  }
}

console.log(`\n${pass}/${total} passed`);
if (failures.length) {
  console.error('\nFailures:');
  failures.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
