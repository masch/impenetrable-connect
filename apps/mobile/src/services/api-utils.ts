import { logger } from "./logger.service";

/**
 * Maps common fetch/network errors to stable i18n keys.
 * This prevents raw environment error strings from leaking into the UI.
 */
export function mapNetworkError(error: unknown): Error {
  if (error instanceof TypeError) {
    const msg = error.message;
    if (
      msg === "Network request failed" ||
      msg === "NetworkError when attempting to fetch resource." ||
      msg === "Failed to fetch" ||
      msg.includes("Network request failed")
    ) {
      return new Error("errors.auth.connection_failed");
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("An unexpected error occurred");
}

/**
 * Standard fetch response handler
 */
export async function handleResponse<T>(response: Response, defaultErrorKey: string): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    logger.error(`API Error [${response.status}]:`, errorData);

    // If server provides a specific message, use it, otherwise use the default key
    throw new Error(errorData.message || defaultErrorKey);
  }
  return response.json();
}
