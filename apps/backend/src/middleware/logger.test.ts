import { describe, expect, it, mock, beforeEach } from "bun:test";
import { Hono } from "hono";
import { requestLogger } from "./logger";

// Create the mock object
const mockLogger = {
  info: mock(() => {}),
  warn: mock(() => {}),
  error: mock(() => {}),
  debug: mock(() => {}),
};

// Use Bun's native module mocking
mock.module("../services/logger.service", () => ({
  logger: mockLogger,
}));

// We import it after mocking to ensure we get the mock (though mock.module is hoisted in Bun)
import "./logger";

describe("Request Logger Middleware", () => {
  beforeEach(() => {
    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
    mockLogger.debug.mockClear();
  });

  it("should log request and response without bodies by default", async () => {
    const app = new Hono();
    app.use("*", requestLogger());
    app.get("/test", (c) => c.text("ok"));

    const res = await app.request("/test");
    expect(res.status).toBe(200);

    // Verify logs
    expect(mockLogger.info).toHaveBeenCalledTimes(2);
    expect(mockLogger.info).toHaveBeenCalledWith("--> GET http://localhost/test", undefined);
  });

  it("should log request and response bodies when logBody option is true", async () => {
    const app = new Hono();
    app.use("*", requestLogger({ logBody: true }));
    app.post("/test", async (c) => {
      const body = await c.req.json();
      return c.json({ received: body, status: "success" });
    });

    const payload = { hello: "world" };
    const res = await app.request("/test", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(200);

    // Verify request log has the body
    expect(mockLogger.info).toHaveBeenCalledWith("--> POST http://localhost/test", {
      body: payload,
    });

    // Verify response log has the body
    expect(mockLogger.info).toHaveBeenLastCalledWith(
      expect.stringContaining("<-- POST http://localhost/test 200"),
      expect.objectContaining({
        response: { received: payload, status: "success" },
      }),
    );
  });

  it("should handle and log errors when request body is malformed JSON", async () => {
    const app = new Hono();
    app.use("*", requestLogger({ logBody: true }));
    app.post("/test", (c) => c.text("ok"));

    const res = await app.request("/test", {
      method: "POST",
      body: '{"malformed": json', // Invalid JSON
      headers: { "Content-Type": "application/json" },
    });

    expect(res.status).toBe(200);

    // Verify warning was logged
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Failed to parse request body"),
      expect.objectContaining({ error: expect.any(Error) }),
    );

    // Verify request log used the fallback string
    expect(mockLogger.info).toHaveBeenCalledWith("--> POST http://localhost/test", {
      body: "[Unparseable Body]",
    });
  });
});
