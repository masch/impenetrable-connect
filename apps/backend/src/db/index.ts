import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { projects, users, ventures, refreshTokens, userRoleEnum } from "./schema";

const schema = { projects, users, ventures, refreshTokens, userRoleEnum };

const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });
export type Db = typeof db;
