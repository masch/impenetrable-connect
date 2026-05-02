import { Context, Next } from "hono";
import { logger } from "../services/logger.service";
import { getAppConfig } from "../config/env";

/**
 * Request Logger Middleware
 * Logs incoming requests and their responses.
 * Automatically resolves configuration (logBody) via getAppConfig.
 */
export const requestLogger = () => {
  return async (c: Context, next: Next) => {
    const config = getAppConfig(c);

    // Architect Rule: Tune the global logger with actual config on the first request
    logger.init(config);

    const { logBody } = config;
    const { method, url } = c.req;
    const start = Date.now();

    let reqBody: unknown;

    // 1. Capture Request Body (if enabled)
    if (logBody && ["POST", "PUT", "PATCH"].includes(method)) {
      try {
        const clonedReq = c.req.raw.clone();
        const contentType = c.req.header("content-type");
        if (contentType?.includes("application/json")) {
          reqBody = await clonedReq.json();
        } else {
          reqBody = await clonedReq.text();
        }
      } catch (error) {
        logger.warn(`Failed to parse request body: ${method} ${url}`, { error });
        reqBody = "[Unparseable Body]";
      }
    }

    logger.info(`--> ${method} ${url}`, reqBody ? { body: reqBody } : undefined);

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;

    let resBody: unknown;

    // 2. Capture Response Body (if enabled)
    if (logBody) {
      try {
        const clonedRes = c.res.clone();
        const contentType = clonedRes.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          resBody = await clonedRes.json();
        } else {
          resBody = await clonedRes.text();
        }
      } catch (error) {
        logger.warn(`Failed to parse response body: ${method} ${url}`, { error });
        resBody = "[Unparseable Response]";
      }
    }

    const message = `<-- ${method} ${url} ${status} (${duration}ms)`;
    const context = {
      status,
      duration: `${duration}ms`,
      ...(resBody ? { response: resBody } : {}),
    };

    if (status >= 500) {
      logger.error(message, null, context);
    } else if (status >= 400) {
      logger.warn(message, context);
    } else {
      logger.info(message, context);
    }
  };
};
