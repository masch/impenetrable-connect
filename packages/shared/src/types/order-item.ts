import { z } from "zod";
import { CatalogItemSchema, type CatalogItem } from "./catalog";

export const OrderItemSchema = z.object({
  id: z.number().int().positive(),
  order_id: z.number().int().positive(),
  catalog_item_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  catalog_item: CatalogItemSchema.optional(),
});

export interface OrderItem extends z.infer<typeof OrderItemSchema> {
  catalog_item?: CatalogItem;
}
