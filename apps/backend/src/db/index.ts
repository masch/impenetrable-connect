import { createDb, type Db } from "./factory";

/**
 * Re-exporting from factory for convenience.
 * Core database logic resides in factory.ts to prevent circular dependencies.
 */
export { createDb, type Db };

/**
 * ARCHITECT WARNING:
 * Do NOT export a static 'db' instance here that calls getAppConfig() at the module level.
 * This will trigger a circular dependency loop (env -> factory -> env).
 *
 * For CLI scripts or tools, always use:
 * const config = getAppConfig();
 * const db = createDb(config.databaseUrl);
 */
