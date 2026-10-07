import { Router } from 'express';
import { config } from '../config/env.js';

export const healthRoutes = Router();

/**
 * Liveness probe. Deliberately touches no data so it stays fast and cannot
 * fail for reasons unrelated to "is the process up". Deployment platforms
 * and uptime monitors poll this.
 */
healthRoutes.get('/health', (_req, res) => {
  res.json({
    data: {
      status: 'ok',
      service: 'jaldrishti-api',
      version: '0.1.0',
      environment: config.nodeEnv,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});
