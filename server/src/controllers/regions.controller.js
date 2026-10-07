import { asyncHandler } from '../utils/asyncHandler.js';
import * as regionsService from '../services/regions.service.js';

/**
 * HTTP LAYER. Controllers are deliberately boring: read the request, call a
 * service, send a response. No calculations, no data access. If a controller
 * starts growing logic, that logic belongs in a service.
 *
 * Every success response is wrapped in { data: ... } to match the error shape
 * { error: ... }. A predictable envelope means the frontend never has to guess.
 */

export const getStates = asyncHandler(async (_req, res) => {
  const states = await regionsService.listStates();
  res.json({ data: states, meta: { count: states.length } });
});

export const getDistrictsForState = asyncHandler(async (req, res) => {
  const { stateId } = req.params;
  const { state, districts } = await regionsService.listDistrictsForState(stateId);
  res.json({
    data: districts,
    meta: { count: districts.length, state },
  });
});

export const getDistrict = asyncHandler(async (req, res) => {
  const district = await regionsService.getDistrict(req.params.districtId);
  res.json({ data: district });
});
