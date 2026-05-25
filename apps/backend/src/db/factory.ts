import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import {
  projects,
  users,
  ventures,
  refreshTokens,
  reservations,
  orders,
  orderItems,
} from "./schema";

const schema = {
  projects,
  users,
  ventures,
  refreshTokens,
  reservations,
  orders,
  orderItems,
};

/**
 * DBA Expert Rule: postgres-js connection options.
 *
 * IMPORTANT: postgres-js by default has NO connect_timeout, NO idle_timeout,
 * and NO max_lifetime. If the TCP connection drops or the DB becomes
 * unreachable, queries hang forever — the route handler never returns,
 * no timeout error is thrown, and the server appears to freeze.
 *
 * These options prevent that:
 * - connect_timeout: fail fast if the DB host is unreachable
 * - idle_timeout: recycle unused connections instead of holding them open
 * - max_lifetime: force periodic reconnection to avoid stale TCP sockets
 * - max: cap concurrent connections to the pool (postgres-js default is 10)
 */
const POSTGRES_OPTIONS = {
  connect_timeout: 10,
  idle_timeout: 60,
  max_lifetime: 1800,
  max: 10,
} as const;

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

  return drizzlePostgres(postgres(databaseUrl, POSTGRES_OPTIONS), { schema });
}

export type Db = ReturnType<typeof createDb>;
