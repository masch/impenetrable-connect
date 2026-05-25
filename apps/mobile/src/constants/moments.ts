import {
  ServiceMomentSchema,
  type ServiceMoment,
  type Timezone,
  type HourMinute,
  createHourMinute,
  getDefaultProject,
} from "@repo/shared";
import { COLORS } from "@repo/shared";
import { useProjectStore } from "../stores/project.store";
import { getDatePartsInTimezone } from "../utils/date";

/**
 * Service moment definitions with icons, colors, and time ranges
 * Used by Booking and Orders screens
 */
export const SERVICE_MOMENTS: {
  zzz_id: ServiceMoment;
  icon: string;
  labelKey: string;
  color: string;
  hex: string;
  bgClass: string;
  textClass: string;
  startTime: HourMinute;
  endTime: HourMinute;
  timezone: Timezone;
}[] = [
  {
    zzz_id: "BREAKFAST",
    icon: "white-balance-sunny",
    labelKey: "catalog.reservation.moments.BREAKFAST",
    color: "moment-breakfast",
    hex: COLORS["moment-breakfast"],
    bgClass: "bg-moment-breakfast",
    textClass: "text-moment-breakfast",
    startTime: createHourMinute("08:00"),
    endTime: createHourMinute("11:00"),
    timezone: "America/Argentina/Buenos_Aires",
  },
  {
    zzz_id: "LUNCH",
    icon: "pot-steam",
    labelKey: "catalog.reservation.moments.LUNCH",
    color: "moment-lunch",
    hex: COLORS["moment-lunch"],
    bgClass: "bg-moment-lunch",
    textClass: "text-moment-lunch",
    startTime: createHourMinute("12:00"),
    endTime: createHourMinute("15:00"),
    timezone: "America/Argentina/Buenos_Aires",
  },
  {
    zzz_id: "SNACK",
    icon: "cookie",
    labelKey: "catalog.reservation.moments.SNACK",
    color: "moment-snack",
    hex: COLORS["moment-snack"],
    bgClass: "bg-moment-snack",
    textClass: "text-moment-snack",
    startTime: createHourMinute("16:00"),
    endTime: createHourMinute("18:00"),
    timezone: "America/Argentina/Buenos_Aires",
  },
  {
    zzz_id: "DINNER",
    icon: "moon-waning-crescent",
    labelKey: "catalog.reservation.moments.DINNER",
    color: "moment-dinner",
    hex: COLORS["moment-dinner"],
    bgClass: "bg-moment-dinner",
    textClass: "text-moment-dinner",
    startTime: createHourMinute("19:00"),
    endTime: createHourMinute("22:00"),
    timezone: "America/Argentina/Buenos_Aires",
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
export function getMomentConfig(moment: ServiceMoment) {
  const found = SERVICE_MOMENTS.find((m) => m.zzz_id === moment);
  return (
    found || {
      zzz_id: "UNKNOWN",
      icon: "clock-outline",
      labelKey: "",
      color: "on-surface-variant",
      hex: COLORS["on-surface-variant"],
      bgClass: "bg-on-surface-variant",
      textClass: "text-on-surface-variant",
      startTime: createHourMinute("00:00"),
      endTime: createHourMinute("23:59"),
      timezone: "America/Argentina/Buenos_Aires",
    }
  );
}

/**
 * Get hex color for a service moment
 */
export function getMomentColor(moment: ServiceMoment): string {
  return getMomentConfig(moment).hex;
}

/**
 * Get default time (Date object) for a moment's start time
 */
export function getDefaultTimeForMoment(moment: ServiceMoment): Date {
  const config = getMomentConfig(moment);
  const [hours, minutes] = config.startTime.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Formats a moment's time range for display.
 *
 * @param moment - The service moment ID (e.g., "BREAKFAST", "LUNCH")
 * @returns Formatted time range string (e.g., "08:00 - 11:00")
 */
export function formatMomentTimeRange(moment: ServiceMoment): string {
  const config = getMomentConfig(moment);
  return `${config.startTime} - ${config.endTime}`;
}

/**
 * Checks if a moment has already expired (end time passed) for today.
 * Only applies when the selected date is today.
 *
 * @param moment - The service moment ID (e.g., "BREAKFAST", "LUNCH")
 * @param selectedDate - The date the user is booking for
 * @returns true if the moment's end time has passed for today
 */
export function isMomentExpired(moment: ServiceMoment, selectedDate: Date | null): boolean {
  const config = getMomentConfig(moment);

  if (!selectedDate) return false;

  const now = new Date();

  // Retrieve active project timezone dynamically, falling back to active project default
  const timezone =
    useProjectStore.getState().selectedProject?.zzz_timezone || getDefaultProject().zzz_timezone;

  const nowParts = getDatePartsInTimezone(now, timezone);
  const selectedParts = getDatePartsInTimezone(selectedDate, timezone);

  const isToday =
    selectedParts.year === nowParts.year &&
    selectedParts.month === nowParts.month &&
    selectedParts.day === nowParts.day;

  if (!isToday) return false;

  const [endHours, endMinutes] = config.endTime.split(":").map(Number);

  if (nowParts.hours > endHours) return true;
  if (nowParts.hours === endHours && nowParts.minutes >= endMinutes) return true;

  return false;
}
