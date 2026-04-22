// Environment configuration
// Change these values depending on the environment:
// - Mock: for frontend development without API
// - API: for connecting to the Backend API

export const env = {
  // Set to 'false' to use the Backend API (defaults to 'true' if not set)
  USE_MOCKS: process.env.EXPO_PUBLIC_USE_MOCKS !== "false",

  // Backend URL (only used when USE_MOCKS = false)
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/v1",
} as const;

// Default export for cleaner imports
export default env;

// Development mode check
export const isDev = process.env.NODE_ENV !== "production";
