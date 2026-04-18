import { z } from "zod";
import { OrderStatusSchema, CancelReasonSchema, ServiceMomentSchema } from "./common";
import { UserSchema } from "./user";
import { VentureSchema } from "./venture";
import { OrderItemSchema } from "./order-item";

/**
 * OrderDbSchema
 * Pure database entity representation (Flat)
 * Mapped to 'orders' table.
 */
export const OrderDbSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.string().uuid(),
  reservation_id: z.number().int().positive(),
  catalog_type_id: z.number().int().positive(),
  confirmed_venture_id: z.number().int().positive().nullable().optional(),
  service_date: z.date(),
  time_of_day: ServiceMomentSchema,
  notes: z.string().nullable().optional(),
  global_status: OrderStatusSchema.default("SEARCHING"),
  cancel_reason: CancelReasonSchema.nullable().optional(),
  cancelled_at: z.date().nullable().optional(),
  completed_at: z.date().nullable().optional(),
  confirmed_at: z.date().nullable().optional(),
  created_at: z.date(),
  notify_whatsapp: z.boolean().default(false),
});

/**
 * OrderSchema (Domain Aggregate)
 * Business entity that includes relations and nested items.
 *
 * DOMAIN RULE: All 'items' must belong to the same 'catalog_type_id' defined in the parent Order.
 * Validation must be performed at the Service layer during order creation/update.
 */
export const OrderSchema = OrderDbSchema.extend({
  items: z.array(OrderItemSchema).default([]),
  user: UserSchema.optional(),
  confirmed_venture: VentureSchema.optional(),
});

export type OrderRow = z.infer<typeof OrderDbSchema>;
export interface Order extends z.infer<typeof OrderSchema> {}
