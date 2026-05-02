import { logger } from "./services/logger.service";
import app from "./app";
import { getAppConfig } from "./config/env";

const config = getAppConfig();
if (!config.isWorker) {
  logger.info(`Backend running on port ${config.port}`);
}

export default app;
