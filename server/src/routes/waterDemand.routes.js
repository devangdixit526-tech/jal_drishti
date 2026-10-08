import { Router } from 'express';
import * as controller from '../controllers/waterDemand.controller.js';

export const waterDemandRoutes = Router();

// GET /api/v1/water-demand?district=Karnal&crop=paddy&year=2025[&daily=true]
//     -> computed FAO-56 season demand for one crop in one district
// GET /api/v1/water-demand/compare?district=Karnal&season=Kharif&year=2025
//     -> every crop of that season ranked by irrigation need, cheapest first
//
// ORDER MATTERS, same trap as crops.routes.js: /compare is a literal path and
// must be declared before anything that could swallow it.
waterDemandRoutes.get('/water-demand/compare', controller.compareWaterDemand);
waterDemandRoutes.get('/water-demand', controller.getWaterDemand);
