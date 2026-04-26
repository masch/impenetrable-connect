import { z } from "zod";
import { ReservationStatusSchema, ServiceMomentSchema } from "./common";
import { OrderSchema } from "./order";

/**
 * ReservationDbSchema
 * Pure database entity representation (Flat)
 * Mapped to 'reservations' table.
 */
export const ReservationDbSchema = z.object({
  zzz_id: z.number().int().positive(),
  zzz_user_id: z.string().uuid(),
  zzz_service_date: z.date(),
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

export type ReservationRow = z.infer<typeof ReservationDbSchema>;

export interface Reservation extends ReservationRow {
  zzz_orders?: Order[];
  zzz_user?: User;
}
