import { useLocaleStore } from "../stores/locale.store";
import type { HourMinute } from "@repo/shared";

/**
 * Formats a numeric value as currency (ARS).
 *
 * @param amount - The numeric value to format
 * @returns Formatted currency string (e.g., "$ 1.200,00")
 */
export const formatCurrency = (amount: number): string => {
  const locale = useLocaleStore.getState().locale;
  return amount.toLocaleString(getNativeLocale(locale), {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Formats a date object or string into a standardized display format.
 *
 * @param date - Date object or ISO string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
): string => {
  if (!date) return "";
  const locale = useLocaleStore.getState().locale;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(getNativeLocale(locale), options);
};

/**
 * Formats a date object or string into a standardized time format.
 *
 * @param date - Date object or ISO string
 * @returns Formatted time string (e.g., "14:53")
 */
export const formatTime = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  const locale = useLocaleStore.getState().locale;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleTimeString(getNativeLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Checks if two dates are the same day.
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Returns a relative date label (Today, Tomorrow, or formatted date).
 * Uses translations for "Today" and "Tomorrow".
 *
 * @param date - The date to check
 * @param t - The translation function
 * @returns Relative label or formatted date
 */
export const getRelativeDateLabel = (date: Date | null, t: (key: string) => string): string => {
  if (!date) return "";

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(date, today)) return t("orders.today");
  if (isSameDay(date, tomorrow)) return t("orders.tomorrow");

  return formatDate(date, { day: "numeric", month: "short" });
};

/**
 * Formats a service moment ID into its translated label.
 *
 * @param moment - The moment ID (e.g., "BREAKFAST")
 * @param t - The translation function
 * @returns Translated label (e.g., "Breakfast")
 */
export const formatMoment = (moment: string, t: (key: string) => string): string => {
  return t(`catalog.reservation.moments.${moment}`);
};

/**
 * Returns a normalized ISO date string (YYYY-MM-DD).
 * Used for grouping and comparison keys.
 * Handles both Date objects and ISO string inputs.
 */
export const toISODate = (date: Date | string): string => {
  // Handle string input (ISO format like "2024-01-15T09:30:00-03:00")
  let dateObj: Date;
  if (typeof date === "string") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parses a normalized ISO date string (YYYY-MM-DD) into a local Date object.
 * Prevents UTC offset issues common with new Date(string).
 */
export const parseISODate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Returns a locale string compatible with native components (like DateTimePicker).
 *
 * @param locale - The base locale from i18n (e.g., "es", "en")
 * @returns A full locale string (e.g., "es-AR", "en-US")
 */
/**
 * Formats a user's display name, extracting the handle from an email if necessary.
 *
 * @param name - The raw identifier or email
 * @returns Formatted display name
 */
export const formatUserDisplayName = (name: string | null | undefined): string => {
  if (!name) return "";
  if (name.includes("@")) {
    return name.split("@")[0];
  }
  return name;
};

export const getNativeLocale = (locale: string): string => {
  const map: Record<string, string> = {
    es: "es-AR",
    en: "en-US",
  };
  return map[locale] || "en-US";
};

/**
 * Extracts time from ISO datetime string.
 *
 * @param isoString - ISO datetime string (e.g., "2024-01-15T09:30:00-03:00")
 * @returns Formatted time string (e.g., "09:30") or empty string if invalid
 */
export const extractTimeFromISO = (isoString: string | null | undefined): string => {
  if (!isoString) return "";
  try {
    // ISO format: "2024-01-15T09:30:00-03:00" - extract time portion
    const match = isoString.match(/T(\d{2}:\d{2})/);
    return match ? match[1] : "";
  } catch {
    return "";
  }
};

/**
 * Parses a "HH:mm" time string into a Date object (using today as the date).
 *
 * @param timeStr - Time string in "HH:mm" format (e.g., "09:30")
 * @returns Date object with the time set
 */
export const parseTimeToDate = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
};

/**
 * Formats a Date object to a "HH:mm" time string.
 *
 * @param date - Date object to extract time from
 * @returns Formatted time string (e.g., "09:30")
 */
export const formatDateToTime = (date: Date): string => {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

/**
 * Combines a date with an hour/minute time to create an ISO string with timezone.
 * Uses the project's default timezone (America/Argentina/Buenos_Aires).
 *
 * @param date - The base date
 * @param time - Time in HH:mm format (e.g., "08:30")
 * @returns ISO string with timezone (e.g., "2024-01-15T08:30:00-03:00")
 */
export const combineDateAndTime = (date: Date, time: HourMinute): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  // Format with timezone offset manually to avoid UTC conversion
  const year = result.getFullYear();
  const month = (result.getMonth() + 1).toString().padStart(2, "0");
  const day = result.getDate().toString().padStart(2, "0");
  const h = result.getHours().toString().padStart(2, "0");
  const m = result.getMinutes().toString().padStart(2, "0");
  const s = result.getSeconds().toString().padStart(2, "0");
  // Get timezone offset
  const tzOffset = -result.getTimezoneOffset();
  const tzHours = Math.floor(Math.abs(tzOffset) / 60)
    .toString()
    .padStart(2, "0");
  const tzMins = (Math.abs(tzOffset) % 60).toString().padStart(2, "0");
  const tzSign = tzOffset >= 0 ? "+" : "-";
  return `${year}-${month}-${day}T${h}:${m}:${s}${tzSign}${tzHours}:${tzMins}`;
};
