import { pgTable, uuid, varchar, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "ENTREPRENEUR", "TOURIST"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique(), // Nullable for tourists
  alias: varchar("alias", { length: 50 }), // For tourists
  passwordHash: varchar("password_hash", { length: 255 }), // Nullable for tourists
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  role: userRoleEnum("role").notNull().default("ENTREPRENEUR"),
  zzz_failed_login_attempts: integer("zzz_failed_login_attempts").notNull().default(0),
  zzz_last_login_at: timestamp("zzz_last_login_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
