import { describe, expect, it, spyOn, beforeEach, afterEach, type Mock } from "bun:test";
import { Hono } from "hono";
import { logger } from "../services/logger.service";
import { requestLogger } from "./logger";

describe("Request Logger Middleware", () => {
  let infoSpy: Mock<typeof logger.info>;
  let warnSpy: Mock<typeof logger.warn>;
  let errorSpy: Mock<typeof logger.error>;

  beforeEach(() => {
    // Spy on the actual logger methods
    infoSpy = spyOn(logger, "info").mockImplementation(() => {});
    warnSpy = spyOn(logger, "warn").mockImplementation(() => {});
    errorSpy = spyOn(logger, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("should log request and response without bodies by default", async () => {
    const app = new Hono();
    app.use("*", requestLogger());
    app.get("/test", (c) => c.text("ok"));

    const res = await app.request("/test", {}, { JWT_SECRET: "test-secret" });
    expect(res.status).toBe(200);

    // Verify logs (info called for --> and <--)
    expect(infoSpy).toHaveBeenCalledTimes(2);
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("--> GET"), undefined);
  });

  it("should log request and response bodies when logBody is true in config", async () => {
    const app = new Hono();
    app.use("*", requestLogger());
    app.post("/test", async (c) => {
      const body = await c.req.json();
      return c.json({ received: body, status: "success" });
    });

    const payload = { hello: "world" };
    const res = await app.request(
      "/test",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      },
      {
        JWT_SECRET: "test-secret",
        LOG_BODY: "true",
      },
    );

    expect(res.status).toBe(200);

    // Verify request log has the body
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("--> POST"), {
      body: payload,
    });

    // Verify response log has the body
    expect(infoSpy).toHaveBeenLastCalledWith(
      expect.stringContaining("<-- POST"),
      expect.objectContaining({
        response: { received: payload, status: "success" },
      }),
    );
  });

  it("should handle and log errors when request body is malformed JSON", async () => {
    const app = new Hono();
    app.use("*", requestLogger());
    app.post("/test", (c) => c.text("ok"));

    const res = await app.request(
      "/test",
      {
        method: "POST",
        body: '{"malformed": json', // Invalid JSON
        headers: { "Content-Type": "application/json" },
      },
      {
        JWT_SECRET: "test-secret",
        LOG_BODY: "true",
      },
    );

    expect(res.status).toBe(200);

    // Verify warning was logged
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to parse request body"),
      expect.objectContaining({ error: expect.any(Error) }),
    );

    // Verify request log used the fallback string
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining("--> POST"), {
      body: "[Unparseable Body]",
    });
  });
});
