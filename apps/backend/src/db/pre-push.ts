import postgres from "postgres";
import { getAppConfig } from "../config/env";
import { SCHEMA_NAME } from "./schema/base";
import { logger } from "../services/logger.service";

/**
 * Pre-push script to ensure the custom database schema exists
 * before drizzle-kit push attempts to introspect it.
 */
async function prePush() {
  const config = getAppConfig();
  const url = config.directUrl || config.databaseUrl;

  if (!url) {
    throw new Error("Neither DATABASE_URL nor DIRECT_URL is defined in AppConfig");
  }

  const client = postgres(url, { max: 1 });
  try {
    logger.info(`Checking if database schema "${SCHEMA_NAME}" exists...`);
    await client.unsafe(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA_NAME};`);
  } catch (error) {
    logger.error(`Failed to create schema "${SCHEMA_NAME}":`, error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

prePush();
