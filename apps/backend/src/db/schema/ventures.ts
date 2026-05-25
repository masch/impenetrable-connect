import { serial, varchar, uuid, boolean, integer } from "drizzle-orm/pg-core";
import { auditColumns, impenetrableSchema } from "./base";
import { users } from "./users";
import { projects } from "./projects";
import { productCategories } from "./product-categories";

const VENTURE_NAME_MAX_LENGTH = 255;

export const ventures = impenetrableSchema.table("ventures", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: VENTURE_NAME_MAX_LENGTH }).notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  zzz_project_id: integer("zzz_project_id")
    .references(() => projects.zzz_id)
    .notNull(),
  zzz_max_capacity: integer("zzz_max_capacity").notNull().default(0),
  zzz_cascade_order: integer("zzz_cascade_order").notNull().default(0),
  zzz_is_paused: boolean("zzz_is_paused").notNull().default(false),
  zzz_is_active: boolean("zzz_is_active").notNull().default(true),
  zzz_product_category_id: integer("zzz_product_category_id")
    .references(() => productCategories.zzz_id)
    .notNull(),
  ...auditColumns,
});
