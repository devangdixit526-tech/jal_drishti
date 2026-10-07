import 'dotenv/config';

/**
 * Reads configuration from environment variables ONCE, validates it, and
 * exports it as a frozen object.
 *
 * Why not read process.env all over the codebase? Because then a typo like
 * process.env.PORTT fails silently at 3am. Here, a missing or bad value
 * crashes the server immediately on boot with a clear message.
 */

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const port = Number(required('PORT', '4000'));
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`PORT must be an integer 1-65535, got: ${process.env.PORT}`);
}

export const config = Object.freeze({
  port,
  nodeEnv: required('NODE_ENV', 'development'),
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
  corsOrigins: required('CORS_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  apiPrefix: '/api/v1',
});
