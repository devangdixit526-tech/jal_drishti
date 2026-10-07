import { ApiError } from '../utils/ApiError.js';

/**
 * Runs when no route matched. Without this, Express returns an HTML error
 * page - which breaks any frontend expecting JSON.
 */
export function notFound(req, _res, next) {
  next(ApiError.notFound(`No route for ${req.method} ${req.originalUrl}`));
}
