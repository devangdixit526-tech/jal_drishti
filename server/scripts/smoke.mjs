/**
 * Smoke test: hits every endpoint and asserts the HTTP status.
 *
 * Not a substitute for real unit tests - it is the 10-second check that the
 * API is wired up and the error paths behave. Run it after any change:
 *
 *   npm run dev          (in one terminal)
 *   npm run smoke        (in another)
 */
const base = process.env.SMOKE_BASE_URL ?? 'http://localhost:4000';

const tests = [
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
  ['/api/v1/nope', 404, 'unknown route -> 404 JSON'],
];

let pass = 0;
const failures = [];

for (const [path, want, label] of tests) {
  try {
    const res = await fetch(base + path);
    if (res.status === want) {
      pass++;
      console.log(`  ok    ${String(res.status).padEnd(3)}  ${path.padEnd(36)} ${label}`);
    } else {
      failures.push(`${path} -> ${res.status}, expected ${want}`);
      console.log(`  FAIL  ${String(res.status).padEnd(3)}  ${path.padEnd(36)} expected ${want}`);
    }
  } catch (error) {
    failures.push(`${path} -> ${error.message}`);
    console.log(`  FAIL  ERR  ${path.padEnd(36)} ${error.message}`);
  }
}

console.log(`\n${pass}/${tests.length} passed`);
if (failures.length) {
  console.error('\nFailures:');
  failures.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
