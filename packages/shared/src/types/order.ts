import { z } from "zod";
import { OrderStatusSchema, CancelReasonSchema, TimeOfDaySchema } from "./common";
import { UserSchema } from "./user";
import { CatalogItemSchema } from "./catalog";
import { VentureSchema } from "./venture";

export const OrderSchema = z.object({
  id: z.number().int().positive(),
  // DB level: Links to the unified User table
  user_id: z.string().uuid(),
  // Drizzle eager-loading projection: typed as User (tourist data)
  user: UserSchema.optional(),
  catalog_item_id: z.number().int().positive(),
  catalog_item: CatalogItemSchema.optional(),
  quantity: z.number().int().positive().default(1),
  price_at_purchase: z.number().nonnegative(),
  confirmed_venture_id: z.number().int().positive().nullable().optional(),
  confirmed_venture: VentureSchema.optional(),
  service_date: z.date(),
  time_of_day: TimeOfDaySchema,
  guest_count: z.number().int().positive(),
  notes: z.string().nullable().optional(),
  global_status: OrderStatusSchema.default("SEARCHING"),
  cancel_reason: CancelReasonSchema.nullable().optional(),
  cancelled_at: z.date().nullable().optional(),
  completed_at: z.date().nullable().optional(),
  confirmed_at: z.date().nullable().optional(),
  created_at: z.date(),
  notify_whatsapp: z.boolean().default(false),
});

export interface Order extends z.infer<typeof OrderSchema> {}
