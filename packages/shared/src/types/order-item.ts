import { z } from "zod";
import { CatalogItemSchema, type CatalogItem } from "./product";

export const OrderItemSchema = z.object({
  zzz_id: z.string().uuid(),
  zzz_order_id: z.string().uuid(),
  zzz_catalog_item_id: z.number().int().positive(),
  zzz_quantity: z.number().int().positive(),
  zzz_price: z.number().nonnegative(),
  zzz_notes: z.string().optional(),
  zzz_catalog_item: CatalogItemSchema.optional(),
});

export interface OrderItem extends z.infer<typeof OrderItemSchema> {
  zzz_catalog_item?: CatalogItem;
}
