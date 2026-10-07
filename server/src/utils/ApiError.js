/**
 * An error that carries an HTTP status code.
 *
 * Throwing `new ApiError(404, 'District not found')` anywhere in the app
 * produces a clean 404 JSON response. Any OTHER kind of error becomes a
 * 500 and gets its details hidden from the client (see errorHandler).
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isApiError = true;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static notFound(message) {
    return new ApiError(404, message);
  }
}
