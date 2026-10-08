import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import * as riskService from '../services/risk.service.js';

const DEFAULT_SOWING_YEAR = 2025;

const seasonSchema = z.enum(['Kharif', 'Rabi', 'Annual']);

const scoreQuerySchema = z.object({
  district: z.string().min(1, 'district is required'),
  season: seasonSchema.optional(),
  year: z.coerce.number().int().min(2024).max(2026).optional(),
});

const stateQuerySchema = z.object({
  season: seasonSchema.optional(),
  year: z.coerce.number().int().min(2024).max(2026).optional(),
});

const statusQuerySchema = z.object({
  district: z.string().min(1).optional(),
});

function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw ApiError.badRequest('Invalid query parameters', result.error.flatten());
  }
  return result.data;
}

export const getRiskScore = asyncHandler(async (req, res) => {
  const { district, season, year } = parse(scoreQuerySchema, req.query);
  const data = await riskService.getDistrictRisk({
    districtName: district,
    season,
    sowingYear: year ?? DEFAULT_SOWING_YEAR,
  });
  res.json({ data });
});

export const getRiskRanking = asyncHandler(async (req, res) => {
  const { season, year } = parse(stateQuerySchema, req.query);
  const data = await riskService.getRiskRanking({
    season,
    sowingYear: year ?? DEFAULT_SOWING_YEAR,
  });
  res.json({ data, meta: { count: data.count } });
});

/**
 * Returns a bare FeatureCollection, NOT wrapped in `data`.
 *
 * Deliberate exception to the response envelope: Leaflet's L.geoJSON() takes a
 * FeatureCollection directly, and making the frontend unwrap `data` first is
 * friction for no benefit. The envelope exists to make error handling uniform,
 * and errors here still come back as `error` like everywhere else.
 */
export const getRiskMap = asyncHandler(async (req, res) => {
  const { season, year } = parse(stateQuerySchema, req.query);
  const geojson = await riskService.getRiskMap({
    season,
    sowingYear: year ?? DEFAULT_SOWING_YEAR,
  });
  res.json(geojson);
});

export const getMethodology = asyncHandler(async (_req, res) => {
  const data = await riskService.getMethodology();
  res.json({ data });
});

export const getGroundwaterStatus = asyncHandler(async (req, res) => {
  const { district } = parse(statusQuerySchema, req.query);
  const data = await riskService.getGroundwaterStatus({ districtName: district });
  res.json({ data });
});
