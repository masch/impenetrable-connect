import { z } from "zod";

// Shared Enums from the spec
export const ServiceMomentSchema = z.enum(["BREAKFAST", "LUNCH", "SNACK", "DINNER"]);
export type ServiceMoment = z.infer<typeof ServiceMomentSchema>;

// Supported languages for the platform
export const LanguageSchema = z.enum(["es", "en"]);
export type Language = z.infer<typeof LanguageSchema>;
export const SUPPORTED_LANGUAGES: Language[] = ["es", "en"];

// Helper for i18n JSONB fields
export const I18nStringSchema = z.record(LanguageSchema, z.string());
export type I18nString = z.infer<typeof I18nStringSchema>;

// Shared Enums from the spec
export enum UserRole {
  TOURIST = "TOURIST",
  ADMIN = "ADMIN",
  ENTREPRENEUR = "ENTREPRENEUR",
}

export const UserRoleSchema = z.nativeEnum(UserRole);

// i18n translation keys for role labels — app-agnostic, each consumer resolves with its own i18n system
export const USER_ROLE_KEYS = {
  TOURIST: {
    labelKey: "roles.tourist.label",
    descriptionKey: "roles.tourist.description",
  },
  ENTREPRENEUR: {
    labelKey: "roles.entrepreneur.label",
    descriptionKey: "roles.entrepreneur.description",
  },
  ADMIN: {
    labelKey: "roles.admin.label",
    descriptionKey: "roles.admin.description",
  },
} satisfies Record<UserRole, { labelKey: string; descriptionKey: string }>;

export const OrderStatusSchema = z.enum([
  "SEARCHING",
  "OFFER_PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
  "EXPIRED",
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const ReservationStatusSchema = z.enum(["CREATED", "SEARCHING", "CONFIRMED", "CANCELLED"]);

export type ReservationStatus = z.infer<typeof ReservationStatusSchema>;

export const CancelReasonSchema = z.enum([
  "BY_TOURIST",
  "BY_ENTREPRENEUR",
  "NO_VENTURE_AVAILABLE",
  "SYSTEM_ERROR",
]);
export type CancelReason = z.infer<typeof CancelReasonSchema>;

export const OfferStatusSchema = z.enum([
  "WAITING_FOR_RESPONSE",
  "ACCEPTED",
  "REJECTED",
  "TIMEOUT",
  "AUTO_REJECTED",
]);
export type OfferStatus = z.infer<typeof OfferStatusSchema>;

export const SkipReasonSchema = z.enum([
  "GENERAL_PAUSE",
  "INDIVIDUAL_PAUSE",
  "CAPACITY_EXCEEDED",
  "CLOSED_THAT_DAY",
  "OUTSIDE_OPENING_HOURS",
  "VENTURE_INACTIVE",
  "NOT_OFFERED",
]);
export type SkipReason = z.infer<typeof SkipReasonSchema>;

/**
 * Branded type for time in HH:mm format (e.g., "09:30", "23:45")
 * Ensures type safety for time values across the app
 */
const HourMinuteBrand = Symbol("HourMinute");
export type HourMinute = string & { readonly [HourMinuteBrand]: typeof HourMinuteBrand };

/**
 * Regex pattern for HH:mm validation
 */
const HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Creates a validated HourMinute from a string
 * @throws if the string is not in HH:mm format
 */
export const createHourMinute = (value: string): HourMinute => {
  if (!HHMM_REGEX.test(value)) {
    throw new Error(`Invalid HH:mm format: "${value}". Expected format like "09:30" or "23:45"`);
  }
  return value as HourMinute;
};

/**
 * Validates if a string is in HH:mm format
 */
export const isHourMinute = (value: string): value is HourMinute => {
  return HHMM_REGEX.test(value);
};
