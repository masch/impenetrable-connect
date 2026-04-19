import { z } from "zod";
import { ReservationStatusSchema, ServiceMomentSchema } from "./common";
import { OrderSchema } from "./order";

/**
 * ReservationDbSchema
 * Pure database entity representation (Flat)
 * Mapped to 'reservations' table.
 */
export const ReservationDbSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.string().uuid(),
  service_date: z.date(),
  time_of_day: ServiceMomentSchema,
  /**
   * Reservation Macro-status
   * - CREATED: Initial state. Slot exists in DB.
   * - SEARCHING: At least one order inside is in cascade process.
   * - CONFIRMED: All required orders are confirmed. Slot is secured.
   * - CANCELLED: Slot is no longer active.
   */
  status: ReservationStatusSchema.default("CREATED"),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

import { type Order } from "./order";
import { type User } from "./user";

/**
 * ReservationSchema (Domain Aggregate)
 * Business entity that includes nested orders.
 */
export const ReservationSchema: z.ZodType<Reservation, z.ZodTypeDef, unknown> =
  ReservationDbSchema.extend({
    orders: z.array(z.lazy(() => OrderSchema)).optional(),
  });

export type ReservationRow = z.infer<typeof ReservationDbSchema>;

export interface Reservation extends ReservationRow {
  orders?: Order[];
  user?: User;
}
