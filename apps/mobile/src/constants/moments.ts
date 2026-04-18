import type { TimeOfDay } from "@repo/shared";
import { COLORS } from "@repo/shared";

/**
 * Moment of day definitions with icons and colors
 * Used by ReservationModal and Orders screens
 */
export const MOMENTS_OF_DAY: {
  id: TimeOfDay;
  icon: string;
  labelKey: string;
  color: string; // Tailwind class name like "moment-breakfast"
  hex: string; // Hex for icons
}[] = [
  {
    id: "BREAKFAST",
    icon: "white-balance-sunny",
    labelKey: "catalog.reservation.moments.breakfast",
    color: "moment-breakfast",
    hex: COLORS["moment-breakfast"],
  },
  {
    id: "LUNCH",
    icon: "pot-steam",
    labelKey: "catalog.reservation.moments.lunch",
    color: "moment-lunch",
    hex: COLORS["moment-lunch"],
  },
  {
    id: "SNACK",
    icon: "cookie",
    labelKey: "catalog.reservation.moments.snack",
    color: "moment-snack",
    hex: COLORS["moment-snack"],
  },
  {
    id: "DINNER",
    icon: "moon-waning-crescent",
    labelKey: "catalog.reservation.moments.dinner",
    color: "moment-dinner",
    hex: COLORS["moment-dinner"],
  },
];

/**
 * Get icon for a time of day
 */
export function getTimeOfDayIcon(timeOfDay: string): string {
  const found = MOMENTS_OF_DAY.find((m) => m.id === timeOfDay);
  return found?.icon || "clock-outline";
}

/**
 * Get hex color for a time of day (for MaterialCommunityIcons and Text)
 */
export function getTimeOfDayColor(timeOfDay: string): string {
  const found = MOMENTS_OF_DAY.find((m) => m.id === timeOfDay);
  return found?.hex || COLORS["on-surface-variant"];
}
