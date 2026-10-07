/**
 * Express 4 does not catch errors thrown inside async functions - they become
 * unhandled promise rejections and the request hangs forever.
 *
 * Wrapping a handler in asyncHandler() forwards any rejection to Express's
 * error middleware instead. Wrap every async route handler in this.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
