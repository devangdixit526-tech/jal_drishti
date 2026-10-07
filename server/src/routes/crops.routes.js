import { Router } from 'express';
import * as controller from '../controllers/crops.controller.js';

export const cropRoutes = Router();

// GET /api/v1/crops              -> all crops, optional ?season=Kharif|Rabi|Annual
// GET /api/v1/crops/compare      -> comparison payload for the chart
// GET /api/v1/crops/:cropId      -> one crop by id, name or alias
//
// ORDER MATTERS: /crops/compare must be declared BEFORE /crops/:cropId,
// otherwise Express matches "compare" as a :cropId and returns 404.
cropRoutes.get('/crops', controller.getCrops);
cropRoutes.get('/crops/compare', controller.compareCrops);
cropRoutes.get('/crops/:cropId', controller.getCrop);
