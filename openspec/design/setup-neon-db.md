# Technical Design: Neon Postgres Integration

## Architecture Overview
The database layer will be abstracted to support multiple connection protocols. This allows the application to run in various environments (Local, GitHub Actions, Neon, Vercel/Cloudflare) without code changes, only configuration.

## Component Design

### 1. Database Connection Factory (`apps/backend/src/db/index.ts`)
Instead of a static export, the connection will be initialized by detecting the environment.

```typescript
// Pseudocode of the logic
const connectionString = process.env.DATABASE_URL;
const isNeon = connectionString.includes('neon.tech');

if (isNeon) {
  // Use @neondatabase/serverless with HTTP/Websockets
  // This is better for Edge and Serverless Cold Starts
} else {
  // Use postgres-js for local TCP connection
}
```

### 2. Migration Configuration (`apps/backend/drizzle.config.ts`)
We will update the config to prioritize `DIRECT_URL` if present. This is a DBA best practice to bypass connection poolers during DDL operations (creating tables, altering columns) which can sometimes cause "prepared statement" errors in PgBouncer.

## Dependency Changes
- Add `@neondatabase/serverless` to `apps/backend/package.json`.

## Data Safety & Performance
- **Connection Pooling**: Use the Neon pooler endpoint for the Hono app to handle high concurrency.
- **SSL**: Force SSL for remote connections (Neon requirement).
- **Local Dev**: Continue using the local Postgres container without SSL.

   - This ensures that migrations are tested against real (but cloned) data before hitting production.

## Expert Patterns Implementation

### 1. Auto-Updated Audit Fields
We will implement a shared `timestampColumns` helper in Drizzle and a global SQL function `update_updated_at_column()`.
- **Trigger**: `BEFORE UPDATE ON <table_name> FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`

### 2. Row Level Security (RLS)
- We will enable RLS using `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`.
- Policies will be established using raw SQL in migrations to bind data access to the `current_user` or specific session variables if using Supabase-like patterns (though for pure Neon, we will focus on owner-based isolation).

### 3. Smart Indexing
- **Naming Convention**: `idx_<table_name>_<column_name>`.
- All Foreign Keys MUST have an index (Postgres doesn't create them by default).
- Unique constraints will be used for natural keys (e.g., `email`).

### 4. Observability Endpoint
- Route: `/api/v1/health/db`.
- Implementation: Runs `SELECT 1` and `SELECT now()` to check connectivity and clock skew/latency.
