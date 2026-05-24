import type { OrderStatus } from "@repo/shared";

/**
 * UUID v4 format regex.
 * Shared across route handlers that validate path parameter IDs.
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Maps route-level order status query strings to valid OrderStatus values.
 * Shared between GET /v1/orders and GET /v1/reservations filter parsing.
 */
export const ORDER_STATUS_VALUES: readonly OrderStatus[] = [
  "SEARCHING",
  "OFFER_PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
  "EXPIRED",
] as const;
