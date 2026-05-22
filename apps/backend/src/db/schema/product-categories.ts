import { pgTable, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { auditColumns } from "./base";
import { projects } from "./projects";

export const productCategories = pgTable("product_categories", {
  zzz_id: serial("zzz_id").primaryKey(),
  zzz_project_id: integer("zzz_project_id")
    .references(() => projects.zzz_id)
    .notNull(),
  zzz_name_i18n: jsonb("zzz_name_i18n").$type<Record<string, string>>().notNull(),
  zzz_description_i18n: jsonb("zzz_description_i18n").$type<Record<string, string>>(),
  zzz_is_active: boolean("zzz_is_active").notNull().default(true),
  ...auditColumns,
});

export type ProductCategorySelect = typeof productCategories.$inferSelect;
export type ProductCategoryInsert = typeof productCategories.$inferInsert;
