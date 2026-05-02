import { describe, expect, it, beforeAll, spyOn } from "bun:test";
import app from "./app";
import * as dbFactory from "./db/index";

describe("Health Check Endpoint", () => {
  beforeAll(() => {
    spyOn(dbFactory, "createDb").mockReturnValue({
      execute: () => Promise.resolve(),
    } as unknown as ReturnType<typeof dbFactory.createDb>);
  });

  it("should return 200 OK and status ok", async () => {
    const res = await app.request(
      "/health",
      { headers: { "X-Health-Key": "test-health-key" } },
      {
        DATABASE_URL: "postgres://localhost:5432/db",
        HEALTH_TOKEN: "test-health-key",
        JWT_SECRET: "test-secret",
      },
    );

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("uptime");
    expect(typeof body.uptime).toBe("number");

    // Expert check: Verify database monitoring
    expect(body).toHaveProperty("database");
    expect(body.database).toHaveProperty("status");
    expect(body.database).toHaveProperty("latency");
    expect(["ok", "error"]).toContain(body.database.status);
  });
});

describe("CORS Security Guard", () => {
  it("should return 500 if ALLOWED_ORIGINS is missing in production", async () => {
    const res = await app.request(
      "/health",
      {},
      {
        ENVIRONMENT: "production",
        DATABASE_URL: "postgres://localhost:5432/db",
        JWT_SECRET: "test-secret",
      },
    );

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Secure CORS configuration required");
  });

  it("should allow access if ALLOWED_ORIGINS is defined in production", async () => {
    const res = await app.request(
      "/health",
      { headers: { "X-Health-Key": "test-health-key" } },
      {
        ENVIRONMENT: "production",
        ALLOWED_ORIGINS: "http://localhost:3000",
        DATABASE_URL: "postgres://localhost:5432/db",
        HEALTH_TOKEN: "test-health-key",
        JWT_SECRET: "test-secret",
      },
    );

    expect(res.status).toBe(200);
  });

  it("should allow access in non-production even if ALLOWED_ORIGINS is missing", async () => {
    const res = await app.request(
      "/health",
      { headers: { "X-Health-Key": "test-health-key" } },
      {
        ENVIRONMENT: "development",
        DATABASE_URL: "postgres://localhost:5432/db",
        HEALTH_TOKEN: "test-health-key",
        JWT_SECRET: "test-secret",
      },
    );

    expect(res.status).toBe(200);
  });
});
