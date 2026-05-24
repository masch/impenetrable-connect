import { apiClient } from "../api-client";
import { useAuthStore } from "../../stores/auth.store";

const mockFetch = jest.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

const mockHandleResponse = jest.fn();
const mockMapNetworkError = jest.fn((e: unknown) => (e instanceof Error ? e : new Error("mapped")));

jest.mock("../api-utils", () => ({
  handleResponse: (...args: Parameters<typeof mockHandleResponse>) => mockHandleResponse(...args),
  mapNetworkError: (...args: Parameters<typeof mockMapNetworkError>) =>
    mockMapNetworkError(...args),
}));

jest.mock("../../config/env", () => ({
  __esModule: true,
  default: { API_URL: "http://test.api/v1" },
}));

describe("apiClient", () => {
  const TOKEN = "test-token-123";

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as { getState: () => { accessToken: string | null } }).getState =
      () => ({ accessToken: TOKEN });
  });

  describe("get", () => {
    it("should send GET request with auth header and correct URL", async () => {
      const mockResponse = { ok: true, json: jest.fn() };
      mockFetch.mockResolvedValue(mockResponse);
      mockHandleResponse.mockResolvedValue([{ id: "1" }]);

      const result = await apiClient.get("/orders");

      expect(mockFetch).toHaveBeenCalledWith("http://test.api/v1/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      expect(mockHandleResponse).toHaveBeenCalledWith(mockResponse, "errors.catalog_failed");
      expect(result).toEqual([{ id: "1" }]);
    });
  });

  describe("post", () => {
    it("should send POST request with body and auth header", async () => {
      const body = { zzz_name: "test" };
      const mockResponse = { ok: true, json: jest.fn() };
      mockFetch.mockResolvedValue(mockResponse);
      mockHandleResponse.mockResolvedValue({ id: "new-1" });

      const result = await apiClient.post("/orders", body);

      expect(mockFetch).toHaveBeenCalledWith("http://test.api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(body),
      });
      expect(mockHandleResponse).toHaveBeenCalledWith(mockResponse, "errors.catalog_failed");
      expect(result).toEqual({ id: "new-1" });
    });
  });

  describe("patch", () => {
    it("should send PATCH request with body and auth header", async () => {
      const body = { zzz_notes: "Updated" };
      const mockResponse = { ok: true, json: jest.fn() };
      mockFetch.mockResolvedValue(mockResponse);
      mockHandleResponse.mockResolvedValue({ id: "1" });

      const result = await apiClient.patch("/orders/1", body);

      expect(mockFetch).toHaveBeenCalledWith("http://test.api/v1/orders/1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(body),
      });
      expect(mockHandleResponse).toHaveBeenCalledWith(mockResponse, "errors.catalog_failed");
      expect(result).toEqual({ id: "1" });
    });
  });

  describe("delete", () => {
    it("should send DELETE request with auth header", async () => {
      const mockResponse = { ok: true, json: jest.fn() };
      mockFetch.mockResolvedValue(mockResponse);
      mockHandleResponse.mockResolvedValue(null);

      const result = await apiClient.delete("/orders/1");

      expect(mockFetch).toHaveBeenCalledWith("http://test.api/v1/orders/1", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      expect(mockHandleResponse).toHaveBeenCalledWith(mockResponse, "errors.catalog_failed");
      expect(result).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should map network errors via mapNetworkError", async () => {
      const networkError = new TypeError("Network request failed");
      mockFetch.mockRejectedValue(networkError);
      mockMapNetworkError.mockReturnValue(new Error("errors.auth.connection_failed"));

      await expect(apiClient.get("/orders")).rejects.toThrow("errors.auth.connection_failed");
      expect(mockMapNetworkError).toHaveBeenCalledWith(networkError);
    });

    it("should map errors for post, patch, and delete as well", async () => {
      const networkError = new Error("fail");
      mockFetch.mockRejectedValue(networkError);
      mockMapNetworkError.mockReturnValue(networkError);

      await expect(apiClient.post("/orders", {})).rejects.toThrow("fail");
      await expect(apiClient.patch("/orders/1", {})).rejects.toThrow("fail");
      await expect(apiClient.delete("/orders/1")).rejects.toThrow("fail");
    });
  });
});
