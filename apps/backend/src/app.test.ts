import { describe, expect, it } from "bun:test";
import app from "./app";

describe("Health Check Endpoint", () => {
  it("should return 200 OK and status ok", async () => {
    const res = await app.request("/health");

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("uptime");
    expect(typeof body.uptime).toBe("number");
  });
});
