import { z } from "zod";
import { OrderStatusSchema, CancelReasonSchema } from "./common";
import { UserSchema } from "./user";
import { VentureSchema } from "./venture";
import { OrderItemSchema } from "./order-item";
import { ReservationSchema } from "./reservation";
import type { OrderItem } from "./order-item";
import type { User } from "./user";
import type { Venture } from "./venture";
import type { Reservation } from "./reservation";

const ORDER_CONSTRAINTS = {
  NOTES_MAX_LENGTH: 1000,
  MIN_ITEMS: 1,
  MAX_ITEMS: 50,
} as const;

/**
 * OrderDbSchema
 * Pure database entity representation (Flat)
 * Mapped to 'orders' table.
 */
export const OrderDbSchema = z.object({
  zzz_id: z.string().uuid(),
  zzz_reservation_id: z.string().uuid(),
  zzz_product_category_id: z.number().int().positive(),
  zzz_confirmed_venture_id: z.number().int().positive().nullable().optional(),
  zzz_notes: z.string().nullable().optional(),
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
  zzz_global_status: OrderStatusSchema.default("SEARCHING"),
  zzz_cancel_reason: CancelReasonSchema.nullable().optional(),
  zzz_cancelled_at: z.date().nullable().optional(),
  zzz_completed_at: z.date().nullable().optional(),
  zzz_confirmed_at: z.date().nullable().optional(),
  zzz_current_offer_venture_id: z.number().int().positive().nullable().optional(),
  zzz_created_at: z.date().optional(),
  zzz_notify_whatsapp: z.boolean().default(false),
});

/**
 * OrderSchema (Domain Aggregate)
 * Business entity that includes relations and nested items.
 */
export const OrderSchema: z.ZodType<Order, z.ZodTypeDef, unknown> = OrderDbSchema.extend({
  zzz_items: z.array(OrderItemSchema).default([]),
  zzz_user: UserSchema.optional(),
  zzz_confirmed_venture: VentureSchema.optional(),
  zzz_current_offer_venture: VentureSchema.optional(),
  zzz_reservation: z.lazy(() => ReservationSchema).optional(),
});

/**
 * CreateOrderInputSchema
 * Input DTO for creating a new order.
 */
const OrderItemInputSchema = z.object({
  zzz_catalog_item_id: z.number().int().positive("Catalog item ID must be a positive integer"),
  zzz_quantity: z.number().int().positive("Quantity must be positive"),
  zzz_notes: z
    .string()
    .max(ORDER_CONSTRAINTS.NOTES_MAX_LENGTH, "Notes must be under 1000 characters")
    .optional(),
});

export const CreateOrderInputSchema = z.object({
  zzz_reservation_id: z.string().uuid("Reservation ID must be a valid UUID"),
  zzz_product_category_id: z.number().int().positive("Product category ID must be positive"),
  zzz_notes: z
    .string()
    .max(ORDER_CONSTRAINTS.NOTES_MAX_LENGTH, "Notes must be under 1000 characters")
    .optional(),
  zzz_notify_whatsapp: z.boolean().optional().default(false),
  zzz_items: z
    .array(OrderItemInputSchema)
    .min(ORDER_CONSTRAINTS.MIN_ITEMS, "At least one item is required")
    .max(ORDER_CONSTRAINTS.MAX_ITEMS, "Maximum 50 items per order"),
});
export interface CreateOrderInput extends z.infer<typeof CreateOrderInputSchema> {}

/**
 * UpdateOrderInputSchema
 * Input DTO for updating order metadata.
 */
export const UpdateOrderInputSchema = z
  .object({
    zzz_notes: z.string().max(ORDER_CONSTRAINTS.NOTES_MAX_LENGTH).optional(),
    zzz_notify_whatsapp: z.boolean().optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
export interface UpdateOrderInput extends z.infer<typeof UpdateOrderInputSchema> {}

/**
 * UpdateOrderStatusInputSchema
 * Input DTO for transitioning order status.
 */
export const UpdateOrderStatusInputSchema = z
  .object({
    zzz_global_status: OrderStatusSchema,
    zzz_cancel_reason: CancelReasonSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.zzz_global_status === "CANCELLED" && !data.zzz_cancel_reason) {
        return false;
      }
      return true;
    },
    {
      message: "zzz_cancel_reason is required when status is CANCELLED",
      path: ["zzz_cancel_reason"],
    },
  )
  .refine(
    (data) => {
      if (data.zzz_global_status !== "CANCELLED" && data.zzz_cancel_reason) {
        return false;
      }
      return true;
    },
    {
      message: "zzz_cancel_reason is only allowed when status is CANCELLED",
      path: ["zzz_cancel_reason"],
    },
  );
export interface UpdateOrderStatusInput extends z.infer<typeof UpdateOrderStatusInputSchema> {}

export interface OrderRow extends z.infer<typeof OrderDbSchema> {}

export interface Order extends OrderRow {
  zzz_items: OrderItem[];
  zzz_user?: User;
  zzz_confirmed_venture?: Venture;
  zzz_current_offer_venture?: Venture;
  zzz_reservation?: Reservation;
  zzz_current_offer_venture_id?: number | null;
}
