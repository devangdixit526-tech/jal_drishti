import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Reads a JSON file from src/data ONCE at startup and caches it in memory.
 *
 * Read at boot, not per-request: a 61-district file does not need re-reading
 * 100 times a second, and a malformed file should crash the server on start
 * rather than on a user's first click.
 */
const cache = new Map();

export function loadJson(filename) {
  if (!cache.has(filename)) {
    const path = join(here, '..', 'data', filename);
    cache.set(filename, JSON.parse(readFileSync(path, 'utf8')));
  }
  return cache.get(filename);
}
