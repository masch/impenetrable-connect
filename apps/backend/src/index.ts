import { logger } from "./services/logger.service";
import app from "./app";

const port = process.env.PORT || 3000;

logger.info(`Backend running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
