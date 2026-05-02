import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { projects, users, ventures, refreshTokens } from "./schema";

const schema = {
  projects,
  users,
  ventures,
  refreshTokens,
};

/**
 * ARCHITECTURE WARNING:
 * DBA Expert Rule: Factory to create the optimal DB client based on the environment.
 * Use neon-http for Cloudflare Workers/Neon and postgres-js for local development.
 */
export function createDb(databaseUrl: string) {
  const isNeon = databaseUrl.includes("neon.tech");

  if (isNeon) {
    return drizzleNeon(neon(databaseUrl), { schema });
  }

  return drizzlePostgres(postgres(databaseUrl), { schema });
}

export type Db = ReturnType<typeof createDb>;
