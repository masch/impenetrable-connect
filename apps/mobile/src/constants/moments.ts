import type { ServiceMoment } from "@repo/shared";
import { COLORS } from "@repo/shared";

/**
 * Service moment definitions with icons and colors
 * Used by Booking and Orders screens
 */
export const SERVICE_MOMENTS: {
  id: ServiceMoment;
  icon: string;
  labelKey: string;
  color: string;
  hex: string;
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
 * Get icon for a service moment
 */
export function getMomentIcon(moment: string): string {
  const found = SERVICE_MOMENTS.find((m) => m.id === moment);
  return found?.icon || "clock-outline";
}

/**
 * Get hex color for a service moment
 */
export function getMomentColor(moment: string): string {
  const found = SERVICE_MOMENTS.find((m) => m.id === moment);
  return found?.hex || COLORS["on-surface-variant"];
}
