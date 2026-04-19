import { ServiceMomentSchema, type ServiceMoment } from "@repo/shared";
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
  bgClass: string;
  textClass: string;
}[] = [
  {
    id: "BREAKFAST",
    icon: "white-balance-sunny",
    labelKey: "catalog.reservation.moments.BREAKFAST",
    color: "moment-breakfast",
    hex: COLORS["moment-breakfast"],
    bgClass: "bg-moment-breakfast",
    textClass: "text-moment-breakfast",
  },
  {
    id: "LUNCH",
    icon: "pot-steam",
    labelKey: "catalog.reservation.moments.LUNCH",
    color: "moment-lunch",
    hex: COLORS["moment-lunch"],
    bgClass: "bg-moment-lunch",
    textClass: "text-moment-lunch",
  },
  {
    id: "SNACK",
    icon: "cookie",
    labelKey: "catalog.reservation.moments.SNACK",
    color: "moment-snack",
    hex: COLORS["moment-snack"],
    bgClass: "bg-moment-snack",
    textClass: "text-moment-snack",
  },
  {
    id: "DINNER",
    icon: "moon-waning-crescent",
    labelKey: "catalog.reservation.moments.DINNER",
    color: "moment-dinner",
    hex: COLORS["moment-dinner"],
    bgClass: "bg-moment-dinner",
    textClass: "text-moment-dinner",
  },
];

/**
 * List of moment IDs for iteration and validation
 * Derived directly from the shared domain schema (SSoT)
 */
export const MOMENTS = ServiceMomentSchema.options;

/**
 * Get full config for a service moment
 */
export function getMomentConfig(moment: string) {
  const found = SERVICE_MOMENTS.find((m) => m.id === moment);
  return (
    found || {
      id: "UNKNOWN",
      icon: "clock-outline",
      labelKey: "",
      color: "on-surface-variant",
      hex: COLORS["on-surface-variant"],
      bgClass: "bg-on-surface-variant",
      textClass: "text-on-surface-variant",
    }
  );
}

/**
 * Get icon for a service moment
 */
export function getMomentIcon(moment: string): string {
  return getMomentConfig(moment).icon;
}

/**
 * Get hex color for a service moment
 */
export function getMomentColor(moment: string): string {
  return getMomentConfig(moment).hex;
}
