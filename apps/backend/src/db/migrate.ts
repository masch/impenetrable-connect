import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "path";
import { logger } from "../services/logger.service";
import { getAppConfig } from "../config/env";

/**
 * Database Migration Script
 * Uses a single-connection client to run migrations safely.
 * This can be run in CI/CD without user interaction.
 */
async function runMigration() {
  const config = getAppConfig();

  if (!config.directUrl) {
    throw new Error("DATABASE_URL or DIRECT_URL is not defined in AppConfig");
  }

  logger.info("⏳ Starting database migrations...");

  const migrationClient = postgres(config.directUrl, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "migrations"),
    });
    logger.info("✅ Migrations applied successfully!");
  } catch (error) {
    logger.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigration();
