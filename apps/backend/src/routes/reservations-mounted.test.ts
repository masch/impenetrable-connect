import { describe, expect, it } from "bun:test";
import app from "../app";

const TEST_ENV = {
  DATABASE_URL: "postgres://localhost:5432/db",
  JWT_SECRET: "test-secret",
  HEALTH_TOKEN: "test-health-token",
};

describe("App — route mounting", () => {
  const routes: Array<[string, string]> = [
    ["GET", "/health"],
    ["GET", "/v1/projects"],
    ["GET", "/v1/ventures"],
    ["GET", "/v1/services"],
    ["POST", "/v1/reservations"],
    ["PATCH", "/v1/reservations/test"],
    ["POST", "/v1/orders"],
    ["GET", "/v1/orders"],
  ];

  it.each(routes)("%s %s should be mounted (responds non-404)", async (method, path) => {
    const res = await app.request(path, { method }, TEST_ENV);
    expect(res.status).not.toBe(404);
  });

  it("health endpoint returns 200", async () => {
    const res = await app.request("/health", {}, TEST_ENV);
    expect(res.status).toBe(200);
  });
});
