# Delta Spec: Setup Neon Postgres (DBA Expert)

## Overview
Transition the backend database infrastructure from a local-only PostgreSQL setup to a production-ready Neon PostgreSQL environment. The implementation must maintain local development parity while optimizing for Neon's serverless architecture.

## Requirements

### R1: Dual-Driver Support
- The system MUST support the standard `postgres-js` driver for local development (TCP).
- The system MUST support `@neondatabase/serverless` for production/remote environments (HTTP/Websockets).
- Detection should be automatic based on the `DATABASE_URL` content or an environment flag.

### R2: Connection Pooling Strategy
- Runtime queries SHOULD use the Neon connection pooler (port 5432 or unpooled if preferred, but usually pooled for web apps).
- Administrative tasks (migrations, pushing schema) MUST use the `DIRECT_URL` to avoid PgBouncer limitations with Drizzle Kit.

### R3: Environment Parity
- Local development MUST remain functional using the existing `podman-compose` setup.
- CI/CD pipelines MUST continue to pass using the local service container.

### R4: Branching Strategy Support
- The implementation MUST facilitate the use of Neon Database Branches.
- Each logical environment (Preview, Production) SHOULD have its own `DATABASE_URL`.
- The system SHOULD allow for ephemeral database branches for Pull Requests.

### R5: Row Level Security (RLS)
- The database schema MUST enable RLS for sensitive tables.
- Access policies MUST be defined to ensure data isolation at the storage level.

### R6: Universal Auditing & Triggers
- Every table MUST include `created_at`, `updated_at`, and `deleted_at` columns.
- A PostgreSQL trigger MUST be implemented to automatically update `updated_at` on every row modification.

### R7: Database Observability
- The backend MUST expose a health check endpoint that validates database connectivity and latency.

## Scenarios

### Scenario 1: Local Development
**Given** a local PostgreSQL container is running
**When** the backend starts with a local `DATABASE_URL`
**Then** it should use the `postgres-js` driver and connect successfully.

### Scenario 2: Remote/Neon Connection
**Given** a Neon `DATABASE_URL` is provided (with HTTP support)
**When** the backend starts
**Then** it should use the Neon serverless driver for optimal performance.

### Scenario 3: Schema Migration
**Given** a change in `src/db/schema/`
**When** running `make db-push`
**Then** it should use the `DIRECT_URL` to apply changes to the remote database without pooling issues.

## Technical Constraints
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Runtime**: Bun
- **Driver**: `@neondatabase/serverless` (v0.9+), `postgres` (v3+)
