/**
 * API Client — shared fetch wrapper that centralizes auth injection,
 * base URL prefixing, and error handling for all REST services.
 */

import { useAuthStore } from "../stores/auth.store";
import env from "../config/env";
import { handleResponse, mapNetworkError } from "./api-utils";

const DEFAULT_ERROR_KEY = "errors.catalog_failed";

interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
}

async function request<T>(options: RequestOptions): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${env.API_URL}${options.path}`;

  try {
    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    return handleResponse<T>(response, DEFAULT_ERROR_KEY);
  } catch (error) {
    throw mapNetworkError(error);
  }
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>({ method: "GET", path });
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>({ method: "POST", path, body });
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>({ method: "PATCH", path, body });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>({ method: "DELETE", path });
  },
};
