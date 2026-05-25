import { type ServiceMoment, getDefaultProject } from "@repo/shared";
import { getMomentConfig } from "../constants/moments";
import { useProjectStore } from "../stores/project.store";
import { getDatePartsInTimezone } from "../utils/date";

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

  // Retrieve active project timezone dynamically, falling back to active project default
  const timezone =
    useProjectStore.getState().selectedProject?.zzz_timezone || getDefaultProject().zzz_timezone;

  const nowParts = getDatePartsInTimezone(now, timezone);
  const selectedParts = getDatePartsInTimezone(selectedDate, timezone);
  const timeParts = getDatePartsInTimezone(selectedTime, timezone);

  const isToday =
    selectedParts.year === nowParts.year &&
    selectedParts.month === nowParts.month &&
    selectedParts.day === nowParts.day;

  if (!isToday) return false;

  // Compare total minutes since midnight, ignoring the date part of selectedTime
  const selectedMins = timeParts.hours * MINUTES_PER_HOUR + timeParts.minutes;
  const currentMins = nowParts.hours * MINUTES_PER_HOUR + nowParts.minutes;

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
