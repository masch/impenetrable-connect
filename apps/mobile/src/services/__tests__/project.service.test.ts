import { ProjectService } from "../project.service";
import { useAuthStore } from "../../stores/auth.store";

jest.mock("../../stores/auth.store", () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

jest.mock("../../config/env", () => ({
  __esModule: true,
  default: {
    API_URL: "http://localhost:3000/v1",
    USE_MOCKS: false,
  },
}));

globalThis.fetch = jest.fn();

describe("ProjectService (REST)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should inject Bearer token from AuthStore into request headers", async () => {
    const mockToken = "super-secret-token";
    (useAuthStore.getState as jest.Mock).mockReturnValue({ accessToken: mockToken });

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{ zzz_id: 1, zzz_name: "Test Project" }],
    });

    await ProjectService.getProjects();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/v1/projects",
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      }),
    );
  });

  it("should handle unauthorized responses using handleResponse", async () => {
    (useAuthStore.getState as jest.Mock).mockReturnValue({ accessToken: null });

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "errors.auth.unauthorized" }),
    });

    // We expect it to throw because handleResponse throws on !ok
    await expect(ProjectService.getProjects()).rejects.toThrow();
  });
});
