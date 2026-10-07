import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import * as cropsService from '../services/crops.service.js';

/**
 * Validating query parameters is the controller's job - it is the boundary
 * where untrusted outside input becomes trusted internal input.
 * Never let an unvalidated query string reach a service or a database.
 */
const listQuerySchema = z.object({
  season: z.enum(['Kharif', 'Rabi', 'Annual']).optional(),
});

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw ApiError.badRequest('Invalid query parameters', result.error.flatten());
  }
  return result.data;
}

export const getCrops = asyncHandler(async (req, res) => {
  const { season } = parse(listQuerySchema, req.query);
  const crops = await cropsService.listCrops({ season });
  res.json({ data: crops, meta: { count: crops.length, season: season ?? 'all' } });
});

export const getCrop = asyncHandler(async (req, res) => {
  const crop = await cropsService.getCrop(req.params.cropId);
  res.json({ data: crop });
});

export const compareCrops = asyncHandler(async (req, res) => {
  const { season } = parse(listQuerySchema, req.query);
  const comparison = await cropsService.compareCrops({ season });
  res.json({ data: comparison });
});
