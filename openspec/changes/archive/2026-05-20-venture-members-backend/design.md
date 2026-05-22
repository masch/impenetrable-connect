# Design: Venture Members (Backend)

## Architecture

### File Structure

| File                                            | Action | Description                              |
| ----------------------------------------------- | ------ | ---------------------------------------- |
| `apps/backend/src/db/schema/venture-members.ts` | Create | Drizzle schema for venture_members table |
| `apps/backend/src/db/schema/index.ts`           | Modify | Add `export * from "./venture-members"`  |
| `apps/backend/src/routes/ventures.ts`           | Modify | Add `GET /user/:userId` handler          |
| `apps/backend/src/routes/ventures.test.ts`      | Modify | Add tests for new endpoint               |

### Schema Design

```typescript
// apps/backend/src/db/schema/venture-members.ts
import { pgTable, serial, varchar, uuid, integer } from "drizzle-orm/pg-core";
import { auditColumns } from "./base";
import { ventures } from "./ventures";
import { users } from "./users";

export const ventureMembers = pgTable("venture_members", {
  id: serial("id").primaryKey(),
  ventureId: integer("venture_id")
    .notNull()
    .references(() => ventures.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: varchar("role", { length: 50 }).notNull().default("MANAGER"),
  ...auditColumns,
});
```

### Endpoint Design

The new endpoint will be added to the existing `ventures` router:

```typescript
// In apps/backend/src/routes/ventures.ts
import { eq, inArray } from "drizzle-orm";
// ... existing imports

router.get("/user/:userId", async (c) => {
  const db = c.var.db;
  const userId = c.req.param("userId");

  // Find venture IDs the user belongs to
  const memberships = await db
    .select({ ventureId: ventureMembers.ventureId })
    .from(ventureMembers)
    .where(eq(ventureMembers.userId, userId));

  if (memberships.length === 0) {
    return c.json([]);
  }

  const ventureIds = memberships.map((m) => m.ventureId);

  // Fetch ventures by IDs
  const result = await db
    .select()
    .from(ventures)
    .where(inArray(ventures.id, ventureIds))
    .orderBy(desc(ventures.zzz_is_active), asc(ventures.name));

  return c.json(result);
});
```

### Key Decisions

| Decision                | Choice                                   | Rationale                                                                  |
| ----------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| Route location          | Inside `ventures.ts`                     | Closely related to ventures entity, same auth middleware                   |
| Query strategy          | Two-step (memberships → ventures)        | Clearer than JOIN for this use case, follows KISS                          |
| Auth                    | Reuses `authMiddleware` on entire router | Already applied via `router.use("*", authMiddleware)`                      |
| No migration generation | Drizzle auto-generate                    | Use `drizzle-kit generate` after schema creation. Provide SQL as fallback. |

### Testing Strategy

| Test                                             | Mock Setup                                   | Expected                 |
| ------------------------------------------------ | -------------------------------------------- | ------------------------ |
| Returns ventures for user with memberships       | mockDb.select returns memberships + ventures | 200, array with ventures |
| Returns empty array for user without memberships | mockDb.select returns empty memberships      | 200, empty array         |
| Returns 401 without auth                         | No auth header                               | 401                      |
| Handles DB error gracefully                      | mockDb.select rejects                        | 500                      |
