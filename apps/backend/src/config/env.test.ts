import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { getAppConfig } from "./env";
import { Context } from "hono";

describe("Environment Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // Clear potentially interfering env vars
    delete process.env.JWT_SECRET;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should resolve JWT_SECRET from bindings (Cloudflare pattern)", () => {
    const mockContext = {
      env: {
        JWT_SECRET: "binding-secret",
      },
    } as unknown as Context;

    const config = getAppConfig(mockContext);
    expect(config.jwtSecret).toBe("binding-secret");
  });

  it("should resolve JWT_SECRET from process.env as fallback", () => {
    process.env.JWT_SECRET = "process-secret";

    // No context provided (boot-time or traditional server)
    const config = getAppConfig();
    expect(config.jwtSecret).toBe("process-secret");
  });

  it("should prioritize bindings over process.env", () => {
    process.env.JWT_SECRET = "process-secret";
    const mockContext = {
      env: {
        JWT_SECRET: "binding-secret",
      },
    } as unknown as Context;

    const config = getAppConfig(mockContext);
    expect(config.jwtSecret).toBe("binding-secret");
  });

  it("should throw error if JWT_SECRET is missing during request-time (with context)", () => {
    const mockContext = {
      env: {},
    } as unknown as Context;

    expect(() => getAppConfig(mockContext)).toThrow(
      "CRITICAL: JWT_SECRET is not defined in environment bindings or process variables.",
    );
  });

  it("should NOT throw error if JWT_SECRET is missing during Worker boot-time", () => {
    // Simulate Worker environment without a request context
    // We mock globalThis.caches to satisfy isWorker detection
    const global = globalThis as unknown as Record<string, unknown>;
    const originalCaches = global.caches;
    global.caches = {};

    try {
      const config = getAppConfig();
      expect(config.jwtSecret).toBe("");
    } finally {
      global.caches = originalCaches;
    }
  });

  it("should throw error if JWT_SECRET is missing in non-Worker environment even at boot-time", () => {
    // Ensure we don't look like a Worker
    const global = globalThis as unknown as Record<string, unknown>;
    const originalCaches = global.caches;
    const originalWebSocketPair = global.WebSocketPair;
    delete global.caches;
    delete global.WebSocketPair;

    try {
      expect(() => getAppConfig()).toThrow(
        "CRITICAL: JWT_SECRET is not defined in environment bindings or process variables.",
      );
    } finally {
      global.caches = originalCaches;
      global.WebSocketPair = originalWebSocketPair;
    }
  });

  it("should correctly identify production environment", () => {
    const mockContext = {
      env: {
        ENVIRONMENT: "production",
        JWT_SECRET: "any",
      },
    } as unknown as Context;

    const config = getAppConfig(mockContext);
    expect(config.isProduction).toBe(true);
    expect(config.environment).toBe("production");
  });

  it("should detect isWorker correctly based on global context", () => {
    const global = globalThis as unknown as Record<string, unknown>;
    const originalCaches = global.caches;
    const originalWS = global.WebSocketPair;

    try {
      // 1. Simulate Worker environment
      global.caches = {};
      const workerConfig = getAppConfig();
      expect(workerConfig.isWorker).toBe(true);

      // 2. Simulate Non-Worker environment
      delete global.caches;
      delete global.WebSocketPair;

      // We need these to avoid throwing in non-worker mode during the test
      process.env.JWT_SECRET = "test-secret";
      process.env.DATABASE_URL = "test-db";

      const nonWorkerConfig = getAppConfig();
      expect(nonWorkerConfig.isWorker).toBe(false);
    } finally {
      // Cleanup
      global.caches = originalCaches;
      global.WebSocketPair = originalWS;
    }
  });
});
