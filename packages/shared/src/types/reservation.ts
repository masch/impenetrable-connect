import { z } from "zod";
import { ReservationStatusSchema, ServiceMomentSchema } from "./common";
import { OrderSchema } from "./order";

/**
 * ReservationDbSchema
 * Pure database entity representation (Flat)
 * Mapped to 'reservations' table.
 */
export const ReservationDbSchema = z.object({
  zzz_id: z.string().uuid(),
  zzz_user_id: z.string().uuid(),
  /**
   * Service datetime with timezone in ISO 8601 format
   * Example: "2024-01-15T09:30:00-03:00" or "2024-01-15T09:30:00Z"
   * Replaces the previous zzz_service_date field
   */
  zzz_service_at: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/,
      "ISO 8601 with timezone required",
    ),
  zzz_time_of_day: ServiceMomentSchema,
  /**
   * Reservation Macro-status
   * - CREATED: Initial state. Slot exists in DB.
   * - SEARCHING: At least one order inside is in cascade process.
   * - CONFIRMED: All required orders are confirmed. Slot is secured.
   * - CANCELLED: Slot is no longer active.
   */
  zzz_status: ReservationStatusSchema.default("CREATED"),
  zzz_guest_count: z.number().int().positive().default(1),
  zzz_created_at: z.date().optional(),
  zzz_updated_at: z.date().optional(),
});

import { type Order } from "./order";
import { type User } from "./user";

/**
 * ReservationSchema (Domain Aggregate)
 * Business entity that includes nested orders.
 */
export const ReservationSchema: z.ZodType<Reservation, z.ZodTypeDef, unknown> =
  ReservationDbSchema.extend({
    zzz_orders: z.array(z.lazy(() => OrderSchema)).optional(),
  });

/**
 * CreateReservationInputSchema
 * Input DTO for creating a new reservation.
 */
export const CreateReservationInputSchema = z.object({
  zzz_service_at: z.string().datetime({ message: "ISO 8601 datetime with timezone required" }),
  zzz_time_of_day: ServiceMomentSchema,
  zzz_guest_count: z.number().int().positive("Guest count must be positive").default(1),
});
export type CreateReservationInput = z.infer<typeof CreateReservationInputSchema>;

/**
 * UpdateReservationInputSchema
 * Input DTO for updating reservation metadata.
 */
export const UpdateReservationInputSchema = z
  .object({
    zzz_service_at: z.string().datetime().optional(),
    zzz_time_of_day: ServiceMomentSchema.optional(),
    zzz_guest_count: z.number().int().positive().optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdateReservationInput = z.infer<typeof UpdateReservationInputSchema>;

export type ReservationRow = z.infer<typeof ReservationDbSchema>;

export interface Reservation extends ReservationRow {
  zzz_orders?: Order[];
  zzz_user?: User;
}
