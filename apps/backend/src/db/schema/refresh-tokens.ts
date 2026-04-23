import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { auditColumns } from "./base";
import { users } from "./users";

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  ...auditColumns,
});

export type RefreshTokenSelect = typeof refreshTokens.$inferSelect;
export type RefreshTokenInsert = typeof refreshTokens.$inferInsert;
