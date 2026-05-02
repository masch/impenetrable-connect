import { describe, expect, it, beforeEach } from "bun:test";
import { Hono } from "hono";
import { dbMiddleware, resetDbCache } from "./db";
import { type AppEnv } from "../config/env";

describe("dbMiddleware", () => {
  beforeEach(() => {
    resetDbCache();
  });

  it("should inject db into context when DATABASE_URL is provided", async () => {
    const app = new Hono<AppEnv>();

    app.use("*", dbMiddleware);

    app.get("/test", (c) => {
      const db = c.get("db");
      return c.json({ hasDb: !!db });
    });

    const res = await app.request(
      "/test",
      {},
      {
        DATABASE_URL: "postgres://localhost:5432/db",
        JWT_SECRET: "test-secret",
      },
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.hasDb).toBe(true);
  });

  it("should return 500 if DATABASE_URL is missing", async () => {
    const app = new Hono<AppEnv>();

    // Clear process.env for this test to ensure it only relies on c.env
    const originalUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    app.use("*", dbMiddleware);

    app.get("/test", (c) => c.text("ok"));

    const res = await app.request(
      "/test",
      {},
      { JWT_SECRET: "test-secret" }, // JWT_SECRET is mandatory for getAppConfig
    );

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe(
      "CRITICAL: DATABASE_URL is not defined in environment bindings or process variables.",
    );

    // Restore process.env
    process.env.DATABASE_URL = originalUrl;
  });
});
