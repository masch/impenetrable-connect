/**
 * Official Project Design Tokens - Single Source of Truth
 */
export const COLORS = {
  // Brand & Core
  primary: "#8c3d2b",
  secondary: "#47664b",
  surface: "#fcf9f2",
  "tab-inactive": "#666666",

  // Surface Containers
  "surface-container-low": "#f6f3ec",
  "surface-container-highest": "#e5e2db",
  "surface-container-lowest": "#ffffff",

  // Primary Variants
  "primary-base": "#2b868c",
  "primary-container": "#8c3d2b",
  "primary-fixed": "#ffdad2",

  // Secondary Variants
  "secondary-container": "#c8ecc9",
  "on-secondary-fixed": "#03210c",

  // Tertiary & Status Colors
  "tertiary-container": "#764d00",
  "on-tertiary-fixed": "#291800",

  // Text on colors
  "on-surface": "#1c1c18",
  "on-surface-variant": "#49473f",
  "on-primary": "#ffffff",
  "on-primary-fixed": "#3d0600",

  // Error Colors
  "error-container": "#ffdad6",
  error: "#ba1a1a",
  "on-error-container": "#93000a",

  // Outline
  "outline-variant": "#dbc1bb",

  // Moment of Day Colors
  "moment-breakfast": "#F59E0B",
  "moment-lunch": "#10B981",
  "moment-snack": "#F97316",
  "moment-dinner": "#8B5CF6",

  // Opacity variants for Moments (deprecated in favor of native slashes, but kept for compatibility)
  "moment-breakfast/20": "rgba(245, 158, 11, 0.125)",
  "moment-breakfast/40": "rgba(245, 158, 11, 0.25)",
  "moment-lunch/20": "rgba(16, 185, 129, 0.125)",
  "moment-lunch/40": "rgba(16, 185, 129, 0.25)",
  "moment-snack/20": "rgba(249, 115, 22, 0.125)",
  "moment-snack/40": "rgba(249, 115, 22, 0.25)",
  "moment-dinner/20": "rgba(139, 92, 246, 0.125)",
  "moment-dinner/40": "rgba(139, 92, 246, 0.25)",
} as const;
