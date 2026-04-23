import { Hono } from "hono";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { logger } from "../services/logger.service";

const health = new Hono();

health.get("/", async (c) => {
  const start = Date.now();
  let dbStatus = "ok";
  let dbLatency: number | null = null;

  try {
    // DBA Expert Rule: Measure connectivity and latency
    await db.execute(sql`SELECT 1`);
    dbLatency = Date.now() - start;
  } catch (error) {
    logger.error("❌ Database health check failed:", error);
    dbStatus = "error";
  }

  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database: {
      status: dbStatus,
      latency: dbLatency !== null ? `${dbLatency}ms` : "N/A",
    },
  });
});

export const healthRouter = health;
