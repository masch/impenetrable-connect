/**
 * Design System size tokens
 *
 * Icon sizes for consistent sizing across the mobile app.
 * Font sizes for when Tailwind's default scale doesn't cover the design spec.
 */
export const ICON_SIZES = {
  XSMALL: 14,
  SMALL: 16,
  MEDIUM: 18,
  LARGE: 20,
  XLARGE: 22,
  XXLARGE: 24,
  XXXLARGE: 40,
  HUGE: 42,
  MASSIVE: 64,
} as const;

export const FONT_SIZES = {
  DATE_LABEL: "text-[9px]",
  DAY_NUM: "text-[10px]",
} as const;
