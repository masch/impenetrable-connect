import { uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { auditColumns, impenetrableSchema } from "./base";
import { users } from "./users";

export const reservationStatusEnum = impenetrableSchema.enum("reservation_status", [
  "CREATED",
  "SEARCHING",
  "CONFIRMED",
  "CANCELLED",
]);

export const serviceMomentEnum = impenetrableSchema.enum("service_moment", [
  "BREAKFAST",
  "LUNCH",
  "SNACK",
  "DINNER",
]);

export const reservations = impenetrableSchema.table("reservations", {
  zzz_id: uuid("zzz_id").defaultRandom().primaryKey(),
  zzz_user_id: uuid("zzz_user_id")
    .references(() => users.id)
    .notNull(),
  zzz_service_at: timestamp("zzz_service_at", { withTimezone: true }).notNull(),
  zzz_time_of_day: serviceMomentEnum("zzz_time_of_day").notNull(),
  zzz_status: reservationStatusEnum("zzz_status").notNull().default("CREATED"),
  zzz_guest_count: integer("zzz_guest_count").notNull().default(1),
  ...auditColumns,
});

export type ReservationSelect = typeof reservations.$inferSelect;
export type ReservationInsert = typeof reservations.$inferInsert;
