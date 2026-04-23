import { pgTable, serial, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { auditColumns } from "./base";

export const projects = pgTable("projects", {
  zzz_id: serial("zzz_id").primaryKey(),
  zzz_name: varchar("zzz_name", { length: 100 }).notNull(),
  zzz_default_language: varchar("zzz_default_language", { length: 10 }).notNull().default("es"),
  zzz_supported_languages: jsonb("zzz_supported_languages")
    .$type<string[]>()
    .notNull()
    .default(["es"]),
  zzz_cascade_timeout_minutes: integer("zzz_cascade_timeout_minutes").notNull().default(30),
  zzz_max_cascade_attempts: integer("zzz_max_cascade_attempts").notNull().default(10),
  zzz_is_active: boolean("zzz_is_active").notNull().default(true),
  ...auditColumns,
});

export type ProjectSelect = typeof projects.$inferSelect;
export type ProjectInsert = typeof projects.$inferInsert;
