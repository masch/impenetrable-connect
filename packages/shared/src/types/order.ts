import { z } from "zod";
import { OrderStatusSchema, CancelReasonSchema } from "./common";
import { UserSchema } from "./user";
import { VentureSchema } from "./venture";
import { OrderItemSchema } from "./order-item";
import { ReservationSchema } from "./reservation";

/**
 * OrderDbSchema
 * Pure database entity representation (Flat)
 * Mapped to 'orders' table.
 */
export const OrderDbSchema = z.object({
  id: z.number().int().positive(),
  reservation_id: z.number().int().positive(),
  catalog_type_id: z.number().int().positive(),
  confirmed_venture_id: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
  /**
   * Order Lifecycle Status
   * - SEARCHING: Engine is looking for a venture.
   * - OFFER_PENDING: Entrepreneur notified, waiting for response (Timeout active).
   * - CONFIRMED: Entrepreneur accepted the order.
   * - COMPLETED: Service delivered.
   * - NO_SHOW: Tourist didn't show up.
   * - CANCELLED: Order cancelled.
   * - EXPIRED: No venture available after cascade.
   */
  global_status: OrderStatusSchema.default("SEARCHING"),
  cancel_reason: CancelReasonSchema.nullable().optional(),
  cancelled_at: z.date().nullable().optional(),
  completed_at: z.date().nullable().optional(),
  confirmed_at: z.date().nullable().optional(),
  current_offer_venture_id: z.number().int().positive().nullable().optional(),
  created_at: z.date(),
  notify_whatsapp: z.boolean().default(false),
});

import { type OrderItem } from "./order-item";
import { type User } from "./user";
import { type Venture } from "./venture";
import { type Reservation } from "./reservation";

/**
 * OrderSchema (Domain Aggregate)
 * Business entity that includes relations and nested items.
 */
export const OrderSchema: z.ZodType<Order, z.ZodTypeDef, unknown> = OrderDbSchema.extend({
  items: z.array(OrderItemSchema).default([]),
  user: UserSchema.optional(),
  confirmed_venture: VentureSchema.optional(),
  reservation: z.lazy(() => ReservationSchema).optional(),
});

export type OrderRow = z.infer<typeof OrderDbSchema>;

export interface Order extends OrderRow {
  items: OrderItem[];
  user?: User;
  confirmed_venture?: Venture;
  reservation?: Reservation;
  current_offer_venture_id?: number | null;
}
