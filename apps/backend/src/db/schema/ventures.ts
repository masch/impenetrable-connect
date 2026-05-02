import { pgTable, serial, varchar, uuid, boolean, integer } from "drizzle-orm/pg-core";
import { auditColumns } from "./base";
import { users } from "./users";
import { projects } from "./projects";

export const ventures = pgTable("ventures", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
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
  ...auditColumns,
});
