import { uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { auditColumns, impenetrableSchema } from "./base";
import { reservations } from "./reservations";
import { ventures } from "./ventures";

export const orderStatusEnum = impenetrableSchema.enum("order_status", [
  "SEARCHING",
  "OFFER_PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
  "EXPIRED",
]);

export const cancelReasonEnum = impenetrableSchema.enum("cancel_reason", [
  "BY_TOURIST",
  "BY_ENTREPRENEUR",
  "NO_VENTURE_AVAILABLE",
  "SYSTEM_ERROR",
]);

export const orders = impenetrableSchema.table("orders", {
  zzz_id: uuid("zzz_id").defaultRandom().primaryKey(),
  zzz_reservation_id: uuid("zzz_reservation_id")
    .references(() => reservations.zzz_id)
    .notNull(),
  zzz_catalog_type_id: integer("zzz_catalog_type_id").notNull(),
  zzz_confirmed_venture_id: integer("zzz_confirmed_venture_id").references(() => ventures.id),
  zzz_notes: text("zzz_notes"),
  zzz_global_status: orderStatusEnum("zzz_global_status").notNull().default("SEARCHING"),
  zzz_cancel_reason: cancelReasonEnum("zzz_cancel_reason"),
  zzz_cancelled_at: timestamp("zzz_cancelled_at"),
  zzz_completed_at: timestamp("zzz_completed_at"),
  zzz_confirmed_at: timestamp("zzz_confirmed_at"),
  zzz_current_offer_venture_id: integer("zzz_current_offer_venture_id").references(
    () => ventures.id,
  ),
  zzz_notify_whatsapp: boolean("zzz_notify_whatsapp").notNull().default(false),
  ...auditColumns,
});

export type OrderSelect = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;
