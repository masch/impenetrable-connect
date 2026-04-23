import { MockStatusService, RestStatusService } from "../status.service";

// Mock global fetch
globalThis.fetch = jest.fn();

describe("StatusService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("RestStatusService", () => {
    it("should fetch backend health with latency", async () => {
      const mockHealth = {
        status: "ok",
        timestamp: "2024-03-20T12:00:00Z",
        uptime: 3600,
        environment: "development",
        database: { status: "ok", latency: "10ms" },
      };

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
      });

      const health = await RestStatusService.fetchBackendHealth();
      expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining("/health"));
      expect(health.apiLatency).toBeDefined();
      expect(health.status).toBe("ok");
    });

    it("should fetch github runs", async () => {
      const mockRuns = {
        workflow_runs: [
          {
            id: 1,
            name: "CI",
            status: "completed",
            conclusion: "success",
            head_commit: { message: "test commit" },
          },
        ],
      };

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRuns,
      });

      const runs = await RestStatusService.fetchGitHubRuns();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("impenetrable-connect/actions/runs"),
        expect.anything(),
      );
      expect(runs).toEqual(mockRuns.workflow_runs);
    });

    it("should handle backend health failure", async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(RestStatusService.fetchBackendHealth()).rejects.toThrow("Health check failed");
    });

    it("should handle github api failure", async () => {
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(RestStatusService.fetchGitHubRuns()).rejects.toThrow("GH API failed");
    });

    it("should fetch check runs, retrieve annotations, and deduplicate identical messages", async () => {
      const mockCheckRuns = {
        check_runs: [
          {
            name: "CI",
            output: {
              annotations_count: 1,
              annotations_url: "https://api.github.com/ci/annotations",
            },
          },
          {
            name: "Deploy",
            output: {
              annotations_count: 1,
              annotations_url: "https://api.github.com/deploy/annotations",
            },
          },
        ],
      };

      const mockAnnotations = [{ message: "Node.js 20 actions are deprecated." }];

      (globalThis.fetch as jest.Mock)
        // First call: fetch check runs
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCheckRuns,
        })
        // Second call: fetch CI annotations
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnnotations,
        })
        // Third call: fetch Deploy annotations
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAnnotations,
        });

      const result = await RestStatusService.fetchCheckRuns("abcdef1");

      expect(globalThis.fetch).toHaveBeenCalledTimes(3);
      expect(result.messages.length).toBe(2);
      expect(result.messages[0]).toBe("[CI] Node.js 20 actions are deprecated.");
      expect(result.messages[1]).toBe("[Deploy] Node.js 20 actions are deprecated.");
    });
  });

  describe("MockStatusService", () => {
    it("should return mock health data", async () => {
      const health = await MockStatusService.fetchBackendHealth();
      expect(health.status).toBe("ok");
      expect(health.apiLatency).toBe("0ms");
    });

    it("should fetch real github runs even in mock mode", async () => {
      const mockRuns = {
        workflow_runs: [
          {
            id: 1,
            name: "CI",
            status: "completed",
            conclusion: "success",
            head_commit: { message: "test commit", id: "123" },
          },
        ],
      };

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRuns,
      });

      const runs = await MockStatusService.fetchGitHubRuns();
      expect(globalThis.fetch).toHaveBeenCalled();
      expect(runs.length).toBe(1);
      expect(runs[0].name).toBe("CI");
    });
  });
});
