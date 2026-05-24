import type { ServiceMoment } from "@repo/shared";
import { getMomentConfig } from "../constants/moments";

const MINUTES_PER_HOUR = 60;

/**
 * Result of time validation
 */
export interface TimeValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates if a selected time falls within a moment's allowed time range.
 *
 * @param selectedTime - Time in HH:mm format (e.g., "09:30")
 * @param moment - The service moment (e.g., "BREAKFAST", "LUNCH")
 * @returns Validation result with valid flag and optional error message
 */
/**
 * Checks if the selected time is already in the past (only for today).
 * Avoids sending times that have already passed to the backend.
 *
 * @param selectedDate - The calendar date the user selected
 * @param selectedTime - The time as a Date object (from the time picker)
 * @returns true if the date is today and the time has passed
 */
export const isTimeInPast = (selectedDate: Date | null, selectedTime: Date | null): boolean => {
  if (!selectedDate || !selectedTime) return false;

  const now = new Date();

  // Only validate for today
  const isToday =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();

  if (!isToday) return false;

  // Compare total minutes since midnight, ignoring the date part of selectedTime
  const selectedMins = selectedTime.getHours() * MINUTES_PER_HOUR + selectedTime.getMinutes();
  const currentMins = now.getHours() * MINUTES_PER_HOUR + now.getMinutes();

  return selectedMins <= currentMins;
};

export const isTimeInRange = (
  selectedTime: string,
  moment: ServiceMoment,
): TimeValidationResult => {
  const config = getMomentConfig(moment);
  const inRange = selectedTime >= config.startTime && selectedTime <= config.endTime;

  if (inRange) {
    return { valid: true };
  }

  return {
    valid: false,
    error: `Time outside allowed range for ${moment}`,
  };
};
