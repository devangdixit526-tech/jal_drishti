import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { regionRoutes } from './regions.routes.js';
import { cropRoutes } from './crops.routes.js';

/**
 * Single place where every route group is mounted. Adding a feature means
 * adding one line here - and it is the fastest way to see the whole API
 * surface at a glance.
 */
export const apiRouter = Router();

apiRouter.use(healthRoutes);
apiRouter.use(regionRoutes);
apiRouter.use(cropRoutes);

// Self-describing index, so a new developer can discover the API by
// opening the base URL in a browser instead of reading the source.
apiRouter.get('/', (_req, res) => {
  res.json({
    data: {
      service: 'JalDrishti API',
      version: 'v1',
      endpoints: [
        'GET /api/v1/health',
        'GET /api/v1/states',
        'GET /api/v1/states/:stateId/districts',
        'GET /api/v1/districts/:districtId',
        'GET /api/v1/crops?season=Kharif|Rabi|Annual',
        'GET /api/v1/crops/compare',
        'GET /api/v1/crops/:cropId',
      ],
    },
  });
});
