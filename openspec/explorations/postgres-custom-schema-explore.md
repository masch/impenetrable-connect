# Exploration: Postgres Custom Schema

## Current State

Currently, all database tables and custom types (enums) are defined in the default `public` schema. When Drizzle generates migrations:

- Enums are explicitly generated with `"public"."user_role"`.
- Tables are generated as `"users"`, `"projects"`, etc., defaulting to whatever is the active search path (usually `public`).

To isolate the application's tables and custom types from potential system tables or other applications sharing the same database (especially on cloud environments like Neon), we want to group everything under a dedicated, explicit PostgreSQL schema called `impenetrable`.

## Affected Areas

| File                                               | Impact                                                        |
| -------------------------------------------------- | ------------------------------------------------------------- |
| `apps/backend/src/db/schema/projects.ts`           | Define table under `impenetrableSchema`                       |
| `apps/backend/src/db/schema/users.ts`              | Define enum and table under `impenetrableSchema`              |
| `apps/backend/src/db/schema/ventures.ts`           | Define table under `impenetrableSchema`                       |
| `apps/backend/src/db/schema/refresh-tokens.ts`     | Define table under `impenetrableSchema`                       |
| `apps/backend/src/db/schema/venture-members.ts`    | Define table under `impenetrableSchema`                       |
| `apps/backend/src/db/schema/product-categories.ts` | Define table under `impenetrableSchema`                       |
| `apps/backend/src/db/schema/products.ts`           | Define table under `impenetrableSchema`                       |
| `apps/backend/src/db/db-setup-advanced.ts`         | Update RLS and triggers to target tables in the custom schema |

## Approaches

### 1. Schema Name: `impenetrable`

- **Pros**: Direct, simple, matches the domain.
- **Cons**: None.
- **Implementation**: Create a schema object `impenetrableSchema = pgSchema("impenetrable")` and define all objects on it.

### 2. Schema Name: `impenetrable_connect`

- **Pros**: Matches the full monorepo name.
- **Cons**: Slightly longer, doesn't add much value over `impenetrable`.

## Recommendation

Use **Approach 1 (schema name `impenetrable`)**. It keeps names short and clean while fully satisfying database isolation requirements.

## Risks & Gotchas

1. **Triggers and Functions**:
   In `db-setup-advanced.ts`, trigger setup must qualify the target tables with the new schema (e.g. `ALTER TABLE impenetrable.users ENABLE ROW LEVEL SECURITY`). The function `update_updated_at_column` should also be created inside the `impenetrable` schema or the search path must be correctly configured.
2. **Migrations**:
   Changing schemas is a destructive schema modification in the eyes of Drizzle-Kit because it looks like dropping tables in `public` and creating them in `impenetrable`.
   Since we are in a development phase and the Neon DB is a development sandbox, a clean migration reset (`make db-reset` or resetting the Neon branch and generating a clean `0000` migration) is the safest approach to avoid complex SQL state mismatches.

## Ready for Proposal

**Yes** — We can proceed to `sdd-propose` directly.
