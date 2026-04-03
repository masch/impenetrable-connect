// Environment configuration
// Change these values depending on the environment:
// - Mock: for frontend development without real backend
// - Prod: for connecting to the real backend

export const ENV = {
  // Set to 'false' to use the real backend
  USE_MOCKS: true,

  // Backend URL (only used when USE_MOCKS = false)
  API_URL: "http://localhost:3000",
} as const;

// Development mode check
export const isDev = process.env.NODE_ENV !== "production";
