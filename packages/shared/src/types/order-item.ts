import { z } from "zod";

export const OrderItemSchema = z.object({
  id: z.number().int().positive(),
  order_id: z.number().int().positive(),
  catalog_item_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

export interface OrderItem extends z.infer<typeof OrderItemSchema> {}
