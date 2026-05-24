import { timestamp, pgSchema } from "drizzle-orm/pg-core";

export const SCHEMA_NAME = "impenetrable_connect";

/**
 * Custom schema for impenetrable-connect database objects.
 * Uses underscore to avoid mandatory SQL quoting.
 */
export const impenetrableSchema = pgSchema(SCHEMA_NAME);

/**
 * Standard Audit Pattern: Common audit columns for all tables.
 * Follows the project's systemic migration to 'zzz_' prefix.
 */
export const auditColumns = {
  zzzCreatedAt: timestamp("zzz_created_at").defaultNow().notNull(),
  zzzUpdatedAt: timestamp("zzz_updated_at").defaultNow().notNull(),
  zzzDeletedAt: timestamp("zzz_deleted_at"),
};
