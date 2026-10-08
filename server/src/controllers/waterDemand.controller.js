import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import * as waterDemandService from '../services/waterDemand.service.js';

/**
 * The weather axis runs 2024-01-01 to 2026-09-30. 2025 is the default sowing
 * year because it is the only one where BOTH a kharif season (sown June) and a
 * rabi season (sown November, harvested the following April) fit entirely
 * inside that window.
 */
const DEFAULT_SOWING_YEAR = 2025;

const seasonSchema = z.enum(['Kharif', 'Rabi', 'Annual']);

const demandQuerySchema = z.object({
  district: z.string().min(1, 'district is required'),
  crop: z.string().min(1, 'crop is required'),
  // coerce because every query-string value arrives as a string.
  year: z.coerce.number().int().min(2024).max(2026).optional(),
  // Opt-in, because the daily array is ~130 rows and most callers only want
  // the totals. Keeping it off by default keeps the dashboard payload small.
  daily: z.enum(['true', 'false']).optional(),
});

const compareQuerySchema = z.object({
  district: z.string().min(1, 'district is required'),
  season: seasonSchema.optional(),
  year: z.coerce.number().int().min(2024).max(2026).optional(),
});

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw ApiError.badRequest('Invalid query parameters', result.error.flatten());
  }
  return result.data;
}

export const getWaterDemand = asyncHandler(async (req, res) => {
  const { district, crop, year, daily } = parse(demandQuerySchema, req.query);
  const result = await waterDemandService.computeSeasonDemand({
    districtName: district,
    cropTerm: crop,
    sowingYear: year ?? DEFAULT_SOWING_YEAR,
  });

  const includeDaily = daily === 'true';
  const payload = includeDaily ? result : { ...result, daily: undefined };

  res.json({
    data: payload,
    meta: {
      unit: 'mm',
      dailyIncluded: includeDaily,
      dailyRowCount: result.daily.length,
      hint: includeDaily ? undefined : 'Add &daily=true for the day-by-day series.',
    },
  });
});

export const compareWaterDemand = asyncHandler(async (req, res) => {
  const { district, season, year } = parse(compareQuerySchema, req.query);
  const result = await waterDemandService.compareCropDemand({
    districtName: district,
    season,
    sowingYear: year ?? DEFAULT_SOWING_YEAR,
  });
  res.json({ data: result, meta: { count: result.items.length, unit: 'mm' } });
});
