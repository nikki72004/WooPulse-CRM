import { logger } from '../lib/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`API Error on ${req.method} ${req.url}:`, { message: err.message, stack: err.stack });
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
