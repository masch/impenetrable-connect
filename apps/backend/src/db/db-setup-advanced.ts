import { sql } from "drizzle-orm";
import { db } from "./index";
import { logger } from "../services/logger.service";

/**
 * Database Setup Script: Applies advanced PostgreSQL patterns that are not 
 * fully covered by the standard Drizzle-Kit push/pull workflow.
 */
async function setupAdvancedPatterns() {
  logger.info("🚀 Applying Advanced Database Patterns...");

  try {
    // 1. Global Trigger Function for updated_at
    logger.info("  - Creating update_updated_at_column function...");
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.zzz_updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // 2. Enable RLS and Triggers for each table
    const tables = ["users", "projects", "ventures", "refresh_tokens"];

    for (const table of tables) {
      logger.info(`  - Setting up ${table}...`);
      
      // Enable RLS
      await db.execute(sql.raw(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`));

      // Create Trigger (Drop first to avoid duplicates)
      await db.execute(sql.raw(`DROP TRIGGER IF EXISTS trg_update_updated_at ON ${table};`));
      await db.execute(sql.raw(`
        CREATE TRIGGER trg_update_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `));
    }

    logger.info("✅ Advanced Database Patterns applied successfully!");
  } catch (error) {
    logger.error("❌ Failed to apply expert patterns:", error);
    process.exit(1);
  }
}

setupAdvancedPatterns();
