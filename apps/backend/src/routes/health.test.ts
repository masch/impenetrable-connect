import { describe, expect, it, spyOn } from "bun:test";
import { Hono } from "hono";

// SET ENV VARS BEFORE REQUIRING THE ROUTER
process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/db";
process.env.GITHUB_REPO = "masch/impenetrable-connect";
process.env.GITHUB_TOKEN = "test-token";
process.env.HEALTH_TOKEN = "test-secret";
process.env.JWT_SECRET = "test-secret";

// Use require to bypass import hoisting and ensure environment is set first
const { healthRouter } = require("./health");

const testApp = new Hono();
testApp.route("/health", healthRouter);

describe("Health Router Integration", () => {
  it("should return health status with github runs", async () => {
    // Mock GitHub API
    const mockRuns = { workflow_runs: [{ id: 1, name: "CI", status: "completed" }] };
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockRuns)),
    );

    const res = await testApp.request(
      "/health",
      { headers: { "X-Health-Key": "test-secret" } },
      {
        HEALTH_TOKEN: "test-secret",
        GITHUB_REPO: "masch/impenetrable-connect",
        GITHUB_TOKEN: "test-token",
        JWT_SECRET: "test-secret",
      },
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.github).toBeDefined();
    expect(body.github.runs).toHaveLength(1);
    expect(body.github.runs[0].name).toBe("CI");

    fetchSpy.mockRestore();
  });

  it("should hide github data if key is missing or incorrect", async () => {
    const res = await testApp.request(
      "/health",
      {},
      { HEALTH_TOKEN: "test-secret", JWT_SECRET: "test-secret" },
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.github).toBeUndefined();
  });

  it("should handle github fetch failure gracefully", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Error", { status: 500 }),
    );

    const res = await testApp.request(
      "/health",
      { headers: { "X-Health-Key": "test-secret" } },
      {
        HEALTH_TOKEN: "test-secret",
        GITHUB_REPO: "masch/impenetrable-connect",
        GITHUB_TOKEN: "test-token",
        JWT_SECRET: "test-secret",
      },
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.github.runs).toEqual([]);

    fetchSpy.mockRestore();
  });

  it("should fetch check runs and annotations through the proxy", async () => {
    const mockCheckRuns = {
      check_runs: [
        {
          name: "Lint",
          output: {
            annotations_count: 1,
            annotations_url: "https://api.github.com/annotations",
          },
        },
      ],
    };
    const mockAnnotations = [{ message: "Trailing whitespace" }];

    const fetchSpy = spyOn(globalThis, "fetch").mockImplementation((async (
      url: string | URL | Request,
    ) => {
      if (url.toString().includes("check-runs")) {
        return new Response(JSON.stringify(mockCheckRuns));
      }
      if (url.toString().includes("annotations")) {
        return new Response(JSON.stringify(mockAnnotations));
      }
      return new Response("Not Found", { status: 404 });
    }) as unknown as typeof fetch);

    const res = await testApp.request(
      "/health/check-runs/ref123",
      { headers: { "X-Health-Key": "test-secret" } },
      {
        HEALTH_TOKEN: "test-secret",
        GITHUB_REPO: "masch/impenetrable-connect",
        GITHUB_TOKEN: "test-token",
        JWT_SECRET: "test-secret",
      },
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.annotations_count).toBe(1);
    expect(body.messages[0]).toBe("[Lint] Trailing whitespace");

    fetchSpy.mockRestore();
  });

  it("should return 401 for check-runs if key is missing", async () => {
    const res = await testApp.request(
      "/health/check-runs/ref123",
      {},
      { HEALTH_TOKEN: "test-secret", JWT_SECRET: "test-secret" },
    );
    expect(res.status).toBe(401);
  });
});
