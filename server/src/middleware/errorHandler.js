import { config } from '../config/env.js';

/**
 * The single place where every error becomes an HTTP response.
 *
 * Every error response in this API has the SAME shape:
 *   { "error": { "message": "...", "status": 404, "details": ... } }
 *
 * That consistency is the whole point - the frontend writes error handling
 * once instead of guessing per endpoint.
 *
 * Express identifies error middleware by its FOUR arguments. Do not remove
 * the unused `next` parameter or Express will treat this as a normal handler.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isKnown = err?.isApiError === true;
  const status = isKnown ? err.statusCode : 500;

  // Unexpected errors: log the real thing server-side, show the client nothing.
  // Leaking a stack trace or SQL error to a browser is an information leak.
  if (!isKnown) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  const body = {
    error: {
      message: isKnown ? err.message : 'Internal server error',
      status,
    },
  };

  if (isKnown && err.details !== undefined) {
    body.error.details = err.details;
  }

  // Stack traces are a development convenience only.
  if (!config.isProduction && !isKnown) {
    body.error.stack = err?.stack;
  }

  res.status(status).json(body);
}
