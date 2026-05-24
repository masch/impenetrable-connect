import { uuid, integer, numeric, text } from "drizzle-orm/pg-core";
import { auditColumns, impenetrableSchema } from "./base";
import { orders } from "./orders";

const PRICE_PRECISION = 10;
const PRICE_SCALE = 2;

export const orderItems = impenetrableSchema.table("order_items", {
  zzz_id: uuid("zzz_id").defaultRandom().primaryKey(),
  zzz_order_id: uuid("zzz_order_id")
    .references(() => orders.zzz_id)
    .notNull(),
  zzz_catalog_item_id: integer("zzz_catalog_item_id").notNull(),
  zzz_quantity: integer("zzz_quantity").notNull(),
  zzz_price: numeric("zzz_price", { precision: PRICE_PRECISION, scale: PRICE_SCALE })
    .$type<number>()
    .notNull(),
  zzz_notes: text("zzz_notes"),
  ...auditColumns,
});

export type OrderItemSelect = typeof orderItems.$inferSelect;
export type OrderItemInsert = typeof orderItems.$inferInsert;
