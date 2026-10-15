import app from './app.js';
import { ENV } from './config/env.js';
import { logger } from './lib/logger.js';

const PORT = ENV.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`✨ WooPulse CRM Server operational on port ${PORT} [${ENV.NODE_ENV}]`);
  logger.info(`🔗 Connected Store: ${ENV.CONNECTED_STORE_NAME}`);
  logger.info(`🚀 API Base URL: http://localhost:${PORT}/api`);
});
