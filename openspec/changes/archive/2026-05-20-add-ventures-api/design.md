# Design: Add `/v1/ventures` API Route

## Technical Approach

Implement the `/v1/ventures` REST API following the exact `projects.ts` pattern: Hono router with auth middleware, GET returns all ventures (sorted), POST creates new venture with Zod validation. The ventures feature already has full stack (DB schema, TypeScript types, frontend service) but missing the backend route.

## Architecture Decisions

### Decision: Route Structure

**Choice**: Create dedicated `ventures.ts` router with auth middleware on all routes
**Alternatives considered**: Add ventures as nested routes within projects, or use single file with conditional auth
**Rationale**: Follows established pattern (`projects.ts`) for consistency; separate router enables future expansion (update/delete endpoints) without modifying existing code

### Decision: Sorting Strategy

**Choice**: Order by `zzz_is_active` DESC, then `zzz_name` ASC (same as projects)
**Alternatives considered**: Order by `createdAt` DESC, order by `zzz_cascade_order`
**Rationale**: Active ventures first, then alphabetical within each group matches user expectations and project pattern

### Decision: Zod Validation

**Choice**: Use `CreateVentureSchema` from `@repo/shared` for validation
**Alternatives considered**: Inline validation, custom schema in backend
**Rationale**: Single source of truth for validation; schema already exists in shared package; enables frontend to use same validation logic

## Data Flow

```
Client Request
    │
    ▼
authMiddleware (JWT verify)
    │
    ▼
ventures Router
    │
    ├─ GET /    → db.select().from(ventures).orderBy(...)
    │
    └─ POST /   → CreateVentureSchema.parse(body) → db.insert(ventures).returning()
                    │
                    ▼
               Response (201/400/500)
```

## File Changes

| File                                       | Action | Description                                                                                          |
| ------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------- |
| `apps/backend/src/routes/ventures.ts`      | Create | Route handler (~45 lines), follows projects.ts pattern                                               |
| `apps/backend/src/routes/ventures.test.ts` | Create | Unit tests with mock DB (4 test cases)                                                               |
| `apps/backend/src/app.ts`                  | Modify | Add `import venturesRouter from "./routes/ventures"` and `app.route("/v1/ventures", venturesRouter)` |

## Interfaces / Contracts

```typescript
// New file: apps/backend/src/routes/ventures.ts
import { Hono } from "hono";
import { ventures } from "../db/schema/ventures";
import { desc, asc } from "drizzle-orm";
import { CreateVentureSchema } from "@repo/shared";
import { logger } from "../services/logger.service";
import { type AppEnv } from "../config/env";
import { authMiddleware } from "../middleware/auth";

const router = new Hono<AppEnv>();

router.use("*", authMiddleware);

router.get("/", async (c) => {
  const db = c.var.db;
  const result = await db
    .select()
    .from(ventures)
    .orderBy(desc(ventures.zzz_is_active), asc(ventures.name));
  return c.json(result);
});

router.post("/", async (c) => {
  try {
    const db = c.var.db;
    const body = await c.req.json();
    const validated = CreateVentureSchema.parse(body);
    const [newVenture] = await db.insert(ventures).values(validated).returning();
    return c.json(newVenture, 201);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      logger.warn("Venture validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error }, 400);
    }
    logger.error("Error creating venture", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default router;
```

**API Contract**:

- `GET /v1/ventures` → `200 OK`, returns `Venture[]`
- `POST /v1/ventures` with valid body → `201 Created`, returns `Venture`
- `POST /v1/ventures` with invalid body → `400 Bad Request`, returns `{ error: "Validation failed", details: ZodError }`
- Unauthenticated → `401 Unauthorized`

## Testing Strategy

| Layer       | What to Test                                                                     | Approach                                                                                         |
| ----------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Unit        | GET returns ventures array, POST creates venture, validation failures, DB errors | Reuse `projects.test.ts` mock pattern: spy on `dbFactory.createDb` to return fake drizzle client |
| Integration | Full request/response cycle with auth                                            | Test via `app.request()` with test JWT                                                           |
| E2E         | Not required                                                                     | Covered by existing frontend integration                                                         |

**Test Cases** (4 total):

1. `GET /v1/ventures` returns 200 with array
2. `POST /v1/ventures` with valid data returns 201
3. `POST /v1/ventures` with invalid data returns 400
4. `POST /v1/ventures` with DB failure returns 500

## Migration / Rollout

No migration required. This is a net-new feature (adding missing backend route). The ventures table already exists in the database with data.

## Open Questions

- [ ] None - all technical decisions resolved

---

**Dependencies verified**:

- `@repo/shared` exports `CreateVentureSchema`, `VentureSchema` ✓
- `ventures` table exists in `apps/backend/src/db/schema/ventures.ts` ✓
- `authMiddleware` exists in `apps/backend/src/middleware/auth.ts` ✓
