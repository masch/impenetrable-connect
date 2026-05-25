/**
 * Timezone-aware date parts extraction.
 * Shared utility to avoid duplicating Intl.DateTimeFormat logic.
 */

export const HOURS_PER_DAY = 24;

interface DateParts {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
}

/**
 * Extract date components (year, month, day, hours, minutes) in a given IANA timezone.
 * Hours are clamped to [0, 24) range.
 */
export function getDatePartsInTimezone(date: Date, timezone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: getPart("year"),
    month: getPart("month") - 1, // 0-indexed (allowed: identity/index operation)
    day: getPart("day"),
    hours: getPart("hour") % HOURS_PER_DAY,
    minutes: getPart("minute"),
  };
}
