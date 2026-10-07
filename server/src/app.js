import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { config } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';

/**
 * Builds the Express application WITHOUT starting a server.
 *
 * Keeping "build the app" separate from "listen on a port" means tests can
 * exercise every endpoint in-process with no port, no race conditions and no
 * cleanup. server.js is the only file that opens a socket.
 *
 * MIDDLEWARE ORDER IS SIGNIFICANT. Express runs these top to bottom:
 *   1. CORS        - must run before routes, or the browser rejects responses
 *   2. body parser - must run before routes, or req.body is undefined
 *   3. logging
 *   4. routes
 *   5. notFound    - only reached when nothing above matched
 *   6. errorHandler- must be LAST; it is the catch-all
 */
export function createApp() {
  const app = express();

  // Browsers block cross-origin responses unless the server opts in.
  // The frontend runs on :5173 and this API on :4000 - different origins -
  // so without this every fetch from React fails with a CORS error.
  app.use(
    cors({
      origin(origin, callback) {
        // Allow tools with no Origin header (curl, Postman, health checks).
        if (!origin) return callback(null, true);
        if (config.corsOrigins.includes(origin)) return callback(null, true);
        // An unapproved origin is a CLIENT error (403), not a server fault.
        // Throwing a plain Error here would surface as a 500 and log a stack
        // trace on every drive-by request.
        return callback(new ApiError(403, `Origin not allowed by CORS: ${origin}`));
      },
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));

  // Everything lives under /api/v1 so a future v2 can coexist without
  // breaking clients still on v1.
  app.use(config.apiPrefix, apiRouter);

  // Friendly root so hitting the bare host is not a confusing 404.
  app.get('/', (_req, res) => {
    res.json({ data: { message: 'JalDrishti API', docs: config.apiPrefix } });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
