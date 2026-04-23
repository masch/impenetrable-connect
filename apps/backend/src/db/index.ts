import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

// DBA Expert Rule: Detect Neon to use the optimal HTTP driver
const isNeon = databaseUrl.includes("neon.tech");

export const db = isNeon
  ? drizzleNeon(neon(databaseUrl), { schema })
  : drizzlePostgres(postgres(databaseUrl), { schema });

export type Db = typeof db;
