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
  status: ReservationStatusSchema.default("PENDING"),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

/**
 * ReservationSchema (Domain Aggregate)
 * Business entity that includes nested orders.
 */
export const ReservationSchema = ReservationDbSchema.extend({
  orders: z.array(OrderSchema).optional(),
});

export type ReservationRow = z.infer<typeof ReservationDbSchema>;
export interface Reservation extends z.infer<typeof ReservationSchema> {}
