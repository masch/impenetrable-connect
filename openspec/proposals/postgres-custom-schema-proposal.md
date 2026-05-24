# Proposal: Migrate to Custom Postgres Schema ("impenetrable-connect")

## 1. Change Summary

**What**: Migrate all database objects (tables and the custom `user_role` enum type) from the default `public` schema to a dedicated PostgreSQL schema called `"impenetrable-connect"`.

**Why**: To isolate the application's tables and types from potential system tables or other apps sharing the same database. Using the exact project name `"impenetrable-connect"` provides a clear domain boundary.

---

## 2. Scope

### Files to Modify

| File                                               | Impact                                                                                    |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `apps/backend/src/db/schema/projects.ts`           | Change `pgTable` to `impenetrableSchema.table`                                            |
| `apps/backend/src/db/schema/users.ts`              | Change `pgEnum` to `impenetrableSchema.enum` and `pgTable` to `impenetrableSchema.table`  |
| `apps/backend/src/db/schema/ventures.ts`           | Change `pgTable` to `impenetrableSchema.table`                                            |
| `apps/backend/src/db/schema/refresh-tokens.ts`     | Change `pgTable` to `impenetrableSchema.table`                                            |
| `apps/backend/src/db/schema/venture-members.ts`    | Change `pgTable` to `impenetrableSchema.table`                                            |
| `apps/backend/src/db/schema/product-categories.ts` | Change `pgTable` to `impenetrableSchema.table`                                            |
| `apps/backend/src/db/schema/products.ts`           | Change `pgTable` to `impenetrableSchema.table`                                            |
| `apps/backend/src/db/db-setup-advanced.ts`         | Qualify target tables in RLS and triggers with the `"impenetrable-connect"` schema prefix |

### Migration Strategy

We will recreate the initial migration (`0000_initial_schema.sql`) to cleanly target the `"impenetrable-connect"` schema:

1. Delete local migration files (`0000_initial_schema.sql` and `meta/*`).
2. Generate a clean initial migration using `make db-generate ENV_FILE=.env.neon NAME=initial-schema`.
3. Clear/reset the target database (Neon and local).
4. Run migrations and seed.

---

## 3. Implementation Plan

### 3.1 Schema Definition Updates

In `apps/backend/src/db/schema/base.ts`, we will define the schema:

```typescript
import { pgSchema } from "drizzle-orm/pg-core";
export const impenetrableSchema = pgSchema("impenetrable-connect");
```

And replace:

- `pgTable("name", ...)` with `impenetrableSchema.table("name", ...)`
- `pgEnum("name", ...)` with `impenetrableSchema.enum("name", ...)`

### 3.2 Advanced DB Setup (`db-setup-advanced.ts`)

Update RLS and Triggers setup to qualify the tables (note the double quotes for the hyphenated schema name):

```typescript
const tables = ["users", "projects", "ventures", "refresh_tokens"];
for (const table of tables) {
  // Alter table under the 'impenetrable-connect' schema (quoted)
  await db.execute(
    sql.raw(`ALTER TABLE "impenetrable-connect".${table} ENABLE ROW LEVEL SECURITY;`),
  );
  await db.execute(
    sql.raw(`DROP TRIGGER IF EXISTS trg_update_updated_at ON "impenetrable-connect".${table};`),
  );
  await db.execute(
    sql.raw(`
    CREATE TRIGGER trg_update_updated_at
    BEFORE UPDATE ON "impenetrable-connect".${table}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `),
  );
}
```

---

## 4. Risks & Mitigation

| Risk                                   | Severity | Mitigation                                                                                                                                                                                               |
| -------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hyphen SQL Syntax Error                | High     | The hyphen `-` is a subtraction operator in SQL. We must ensure the schema name is always properly quoted as `"impenetrable-connect"` in raw queries. Drizzle handles this automatically in compilation. |
| Destructive migration conflict on Neon | High     | Reset the database or drop existing tables in `public` before applying the new migrations.                                                                                                               |
| Broken application queries             | Low      | Drizzle automatically handles the schema prefixing (compiles queries to `"impenetrable-connect"."table_name"`), so no changes are needed in query logic.                                                 |
| Test failures                          | Low      | Tests using the mock DB factory or local Postgres will run migrations cleanly in their test runner.                                                                                                      |

---

## 5. Next Steps

1. **Obtain user approval** on this proposal.
2. **Interactive SDD steps**:
   - Create OpenSpec/Design (`openspec/specs/` and `openspec/designs/`).
   - Create task checklist (`openspec/tasks/`).
   - Run implementation (Apply phase).
   - Run verification and tests (Verify phase).
   - Archive changes.
