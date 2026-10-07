import * as regionsRepo from '../repositories/regions.repo.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * BUSINESS LOGIC LAYER for regions.
 *
 * Knows nothing about HTTP (no req/res here) and nothing about storage
 * (it asks the repository). That is what makes it testable in isolation.
 */

export async function listStates() {
  return regionsRepo.findAllStates();
}

export async function listDistrictsForState(stateId) {
  // Validate the parent exists so the client gets 404 "no such state"
  // instead of a confusing empty list that looks like a state with no districts.
  const state = await regionsRepo.findStateById(stateId);
  if (!state) {
    throw ApiError.notFound(`No state with id '${stateId}'`);
  }

  const districts = await regionsRepo.findDistrictsByStateId(state.id);
  return { state, districts };
}

export async function getDistrict(districtId) {
  const district = await regionsRepo.findDistrictById(districtId);
  if (!district) {
    throw ApiError.notFound(`No district with id '${districtId}'`);
  }
  const state = await regionsRepo.findStateById(district.stateId);
  return { ...district, state };
}
