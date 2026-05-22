import { pgTable, serial, varchar, uuid, integer } from "drizzle-orm/pg-core";
import { auditColumns } from "./base";
import { ventures } from "./ventures";
import { users } from "./users";

export const ventureMembers = pgTable("venture_members", {
  id: serial("id").primaryKey(),
  ventureId: integer("venture_id")
    .notNull()
    .references(() => ventures.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: varchar("role", { length: 50 }).notNull().default("MANAGER"),
  ...auditColumns,
});
