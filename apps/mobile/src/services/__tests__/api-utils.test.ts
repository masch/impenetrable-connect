import { mapNetworkError, handleResponse } from "../api-utils";
import { logger } from "../logger.service";

jest.mock("../logger.service");

describe("API Utils", () => {
  describe("mapNetworkError", () => {
    it("should map fetch network error to connection_failed i18n key", () => {
      const error = new TypeError("Failed to fetch");
      const result = mapNetworkError(error);
      expect(result.message).toBe("errors.auth.connection_failed");
    });

    it("should return the same error if it is already an Error but not a network one", () => {
      const error = new Error("something went wrong");
      const result = mapNetworkError(error);
      expect(result).toBe(error);
    });

    it("should return generic error for unknown types", () => {
      const result = mapNetworkError("string error");
      expect(result.message).toBe("An unexpected error occurred");
    });
  });

  describe("handleResponse", () => {
    it("should return parsed JSON if response is ok", async () => {
      const mockData = { success: true };
      const response = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      } as unknown as Response;

      const result = await handleResponse(response, "default_error");
      expect(result).toEqual(mockData);
    });

    it("should throw the server message if available when response is not ok", async () => {
      const response = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: "Server says no" }),
      } as unknown as Response;

      await expect(handleResponse(response, "default_error")).rejects.toThrow("Server says no");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw the default error key if no server message is available", async () => {
      const response = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Response;

      await expect(handleResponse(response, "errors.default")).rejects.toThrow("errors.default");
    });
  });
});
