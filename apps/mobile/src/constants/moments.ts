import type { TimeOfDay } from "@repo/shared";
import { getMomentColor } from "./colors";

/**
 * Moment of day definitions with icons and colors
 * Used by ReservationModal and Orders screens
 */
export const MOMENTS_OF_DAY: {
  id: TimeOfDay;
  icon: string;
  labelKey: string;
  color: string;
}[] = [
  {
    id: "BREAKFAST",
    icon: "white-balance-sunny",
    labelKey: "catalog.reservation.moments.breakfast",
    color: "moment-breakfast",
  },
  {
    id: "LUNCH",
    icon: "white-balance-sunny",
    labelKey: "catalog.reservation.moments.lunch",
    color: "moment-lunch",
  },
  {
    id: "SNACK",
    icon: "cookie",
    labelKey: "catalog.reservation.moments.snack",
    color: "moment-snack",
  },
  {
    id: "DINNER",
    icon: "moon-waning-crescent",
    labelKey: "catalog.reservation.moments.dinner",
    color: "moment-dinner",
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
 * Get color for a time of day (hex value for MaterialCommunityIcons)
 */
export function getTimeOfDayColor(timeOfDay: string): string {
  return getMomentColor(timeOfDay);
}
