import { createDb } from "../db/factory";
import { getAppConfig, type AppEnv } from "../config/env";
import { createMiddleware } from "hono/factory";

/**
 * Middleware to inject the database client into the Hono context.
 * In Cloudflare Workers, bindings are available in env.
 */
let cachedDb: ReturnType<typeof createDb> | null = null;

/**
 * ONLY FOR TESTING: Resets the cached database instance.
 */
export const resetDbCache = () => {
  cachedDb = null;
};

export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  try {
    const config = getAppConfig(c);

    if (!cachedDb) {
      cachedDb = createDb(config.databaseUrl);
    }

    c.set("db", cachedDb);
    await next();
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});
