import { Router } from 'express';
import * as controller from '../controllers/regions.controller.js';

export const regionRoutes = Router();

// GET /api/v1/states                       -> all states
// GET /api/v1/states/:stateId/districts    -> districts of ONE state (cascading)
// GET /api/v1/districts/:districtId        -> one district + its state
//
// The nested shape is what makes the dropdowns cascade correctly: the client
// cannot ask for districts without naming a state, so Punjab can never again
// show Haryana's districts.
regionRoutes.get('/states', controller.getStates);
regionRoutes.get('/states/:stateId/districts', controller.getDistrictsForState);
regionRoutes.get('/districts/:districtId', controller.getDistrict);
