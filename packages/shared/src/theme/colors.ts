import { COLORS as COLORS_DATA } from "./colors.data.js";

/**
 * Design System color tokens structure
 */
export interface Colors {
  primary: string;
  secondary: string;
  surface: string;
  "tab-inactive": string;
  "surface-container-low": string;
  "surface-container-highest": string;
  "surface-container-lowest": string;
  "primary-base": string;
  "primary-container": string;
  "primary-fixed": string;
  "secondary-container": string;
  "on-secondary": string;
  "on-secondary-fixed": string;
  "tertiary-container": string;
  "on-tertiary-fixed": string;
  "on-surface": string;
  "on-surface-variant": string;
  "on-primary": string;
  "on-primary-fixed": string;
  "error-container": string;
  error: string;
  "on-error-container": string;
  success: string;
  warning: string;
  info: string;
  "outline-variant": string;
  "moment-breakfast": string;
  "moment-lunch": string;
  "moment-snack": string;
  "moment-dinner": string;
  "surface-solid": string;
  "surface-container-solid": string;
  "status-searching": string;
  "status-pending": string;
}

/**
 * Official Project Design Tokens - Single Source of Truth
 * Typed according to the Colors interface for monorepo consistency
 */
export const COLORS: Colors = COLORS_DATA;
