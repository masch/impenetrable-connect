import { Hono } from "hono";
import { healthRouter } from "./routes/health";
import { requestLogger } from "./middleware/logger";
import projectsRouter from "./routes/projects";
import { authRouter } from "./routes/auth";
import { cors } from "hono/cors";
import { dbMiddleware } from "./middleware/db";
import { logger } from "./services/logger.service";
import { getAppConfig, type AppEnv } from "./config/env";

const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
  const config = getAppConfig(c);

  if (!config.allowedOrigins && config.isProduction) {
    logger.error(
      "SECURITY ALERT: ALLOWED_ORIGINS is not defined in production!",
      new Error("Missing CORS configuration"),
    );
    return c.json({ error: "Secure CORS configuration required" }, 500);
  }

  const corsMiddleware = cors({
    origin: config.allowedOrigins || ["*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  });

  return await corsMiddleware(c, next);
});
app.use("*", dbMiddleware);

app.use("*", requestLogger());

app.route("/health", healthRouter);
app.route("/v1/projects", projectsRouter);
app.route("/v1/auth", authRouter);

export default app;
export { type AppEnv };
