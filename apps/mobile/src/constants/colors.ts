/**
 * Design System Colors
 * Centralized color constants that map to Tailwind tokens
 * Usage: Use tokens in Tailwind classes, use this file for inline React Native styles
 */

// Moment of Day Colors - mapped to tailwind.config.js
export const MOMENT_COLORS = {
  BREAKFAST: "#F59E0B", // amber
  LUNCH: "#10B981", // emerald
  SNACK: "#F97316", // orange
  DINNER: "#8B5CF6", // violet
} as const;

// Helper to get moment color by time of day
export function getMomentColor(timeOfDay: string): string {
  const colorMap: Record<string, string> = {
    BREAKFAST: MOMENT_COLORS.BREAKFAST,
    LUNCH: MOMENT_COLORS.LUNCH,
    SNACK: MOMENT_COLORS.SNACK,
    DINNER: MOMENT_COLORS.DINNER,
  };
  return colorMap[timeOfDay] || "#6B7280"; // gray fallback
}
