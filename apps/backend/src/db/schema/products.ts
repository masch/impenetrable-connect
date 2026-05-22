import { pgTable, serial, integer, boolean, jsonb, varchar, numeric } from "drizzle-orm/pg-core";
import { auditColumns } from "./base";
import { productCategories } from "./product-categories";

export const products = pgTable("products", {
  zzz_id: serial("zzz_id").primaryKey(),
  zzz_product_category_id: integer("zzz_product_category_id")
    .references(() => productCategories.zzz_id)
    .notNull(),
  zzz_name_i18n: jsonb("zzz_name_i18n").$type<Record<string, string>>().notNull(),
  zzz_description_i18n: jsonb("zzz_description_i18n").$type<Record<string, string>>(),
  zzz_price: numeric("zzz_price", { precision: 10, scale: 2 }).$type<number>().notNull(),
  zzz_max_participants: integer("zzz_max_participants").notNull(),
  zzz_image_url: varchar("zzz_image_url", { length: 500 }),
  zzz_global_pause: boolean("zzz_global_pause").notNull().default(false),
  zzz_service_moments: jsonb("zzz_service_moments").$type<string[]>(),
  ...auditColumns,
});

export type ProductSelect = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;
