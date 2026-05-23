import { Hono } from "hono";
import { healthRouter } from "./routes/health";
import { requestLogger } from "./middleware/logger";
import { projectsRouter } from "./routes/projects";
import { venturesRouter } from "./routes/ventures";
import { authRouter } from "./routes/auth";
import { productsRouter } from "./routes/products";
import { servicesRouter } from "./routes/services";
import { cors } from "hono/cors";
import { dbMiddleware } from "./middleware/db";
import { logger } from "./services/logger.service";
import { getAppConfig, type AppEnv } from "./config/env";

const CORS_MAX_AGE_SECONDS = 600;
const HTTP_INTERNAL_ERROR = 500;

const corsMiddleware = cors({
  origin: (origin, c) => {
    const config = getAppConfig(c);
    if (config.allowedOrigins.length === 0) return null;
    if (config.allowedOrigins.includes("*")) return origin;
    if (config.allowedOrigins.includes(origin)) return origin;
    return null;
  },
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-Health-Key"],
  maxAge: CORS_MAX_AGE_SECONDS,
});

const app = new Hono<AppEnv>();

// CORS origin security check: block requests in production if no origins configured
app.use("*", async (c, next) => {
  const config = getAppConfig(c);

  if (config.allowedOrigins.length === 0 && config.isProduction) {
    logger.error(
      "SECURITY ALERT: ALLOWED_ORIGINS is not defined in production!",
      new Error("Missing CORS configuration"),
    );
    return c.json({ message: "errors.common.security_cors_required" }, HTTP_INTERNAL_ERROR);
  }

  return next();
});

app.use("*", corsMiddleware);
app.use("*", dbMiddleware);

app.use("*", requestLogger());

app.route("/health", healthRouter);
app.route("/v1/projects", projectsRouter);
app.route("/v1/ventures", venturesRouter);
app.route("/v1/auth", authRouter);
app.route("/v1/products", productsRouter);
app.route("/v1/services", servicesRouter);

export default app;
export { type AppEnv };
