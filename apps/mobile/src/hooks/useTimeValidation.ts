import type { ServiceMoment } from "@repo/shared";
import { getMomentConfig } from "../constants/moments";

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
