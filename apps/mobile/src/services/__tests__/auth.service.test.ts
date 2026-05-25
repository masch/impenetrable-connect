jest.mock("../../config/env", () => ({
  __esModule: true,
  default: { API_URL: "http://test.api/v1", USE_MOCKS: false },
}));

import { authService } from "../auth.service";
import { UserRole } from "@repo/shared";

const globalFetch = globalThis.fetch;

describe("RestAuthService - createTourist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn();
  });

  afterAll(() => {
    globalThis.fetch = globalFetch;
  });

  it("should make POST request to /auth/tourist/create and return parsed data", async () => {
    const mockUser = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      email: null,
      alias: "test-tourist",
      firstName: "Test",
      lastName: "User",
      phoneNumber: "+123456789",
      role: UserRole.TOURIST,
      isActive: true,
      zzz_failed_login_attempts: 0,
      zzz_last_login_at: null,
      createdAt: "2026-05-25T12:00:00.000Z",
      updatedAt: "2026-05-25T12:00:00.000Z",
    };

    const mockResponseData = {
      accessToken: "access-token-123",
      refreshToken: "refresh-token-456",
      user: mockUser,
    };

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponseData),
    });

    const input = {
      alias: "test-tourist",
      firstName: "Test",
      lastName: "User",
      phoneNumber: "+123456789",
      role: UserRole.TOURIST,
      email: null,
    };

    const result = await authService.createTourist(input);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://test.api/v1/auth/tourist/create",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    );

    expect(result).toEqual(mockResponseData);
  });

  it("should throw connection_failed if fetch fails due to network error", async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new TypeError("Network request failed"));

    const input = {
      alias: "test-tourist",
      firstName: null,
      lastName: null,
      phoneNumber: null,
      role: UserRole.TOURIST,
      email: null,
    };

    await expect(authService.createTourist(input)).rejects.toThrow("errors.auth.connection_failed");
  });
});
