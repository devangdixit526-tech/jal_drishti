import { Router } from 'express';
import * as controller from '../controllers/risk.controller.js';

export const riskRoutes = Router();

// GET /api/v1/groundwater/status                  -> Haryana block-category summary
// GET /api/v1/groundwater/status?district=Karnal  -> that district's blocks + trend
riskRoutes.get('/groundwater/status', controller.getGroundwaterStatus);

// GET /api/v1/risk/methodology  -> every weight, threshold and limitation.
//     Declared FIRST so it can never be mistaken for a district lookup.
riskRoutes.get('/risk/methodology', controller.getMethodology);

// GET /api/v1/risk/score?district=Karnal&season=Kharif  -> one district
// GET /api/v1/risk/ranking?season=Kharif                -> all 22, worst first
// GET /api/v1/risk/map?season=Kharif                    -> GeoJSON for Leaflet
riskRoutes.get('/risk/score', controller.getRiskScore);
riskRoutes.get('/risk/ranking', controller.getRiskRanking);
riskRoutes.get('/risk/map', controller.getRiskMap);
