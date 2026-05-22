# Tasks: Add Ventures CRUD Endpoints

## Review Workload Forecast

| Field                   | Value       |
| ----------------------- | ----------- |
| Estimated changed lines | ~150-180    |
| 400-line budget risk    | Low         |
| Chained PRs recommended | No          |
| Suggested split         | Single PR   |
| Delivery strategy       | ask-on-risk |
| Chain strategy          | pending     |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal                     | Likely PR | Notes                                     |
| ---- | ------------------------ | --------- | ----------------------------------------- |
| 1    | Full CRUD implementation | PR 1      | Schema + route handlers + tests in one PR |

## Phase 1: Schema & Types

- [x] 1.1 Add `UpdateVentureSchema` to `packages/shared/src/types/venture.ts` — omit id, createdAt, updatedAt, zzz_project_id, ownerId; make all mutable fields (name, zzz_max_capacity, zzz_cascade_order, zzz_is_paused) optional via `.partial()`

## Phase 2: Route Handlers

- [x] 2.1 Add `router.put("/:id", ...)` handler in `apps/backend/src/routes/ventures.ts` — parse id from params, validate body with UpdateVentureSchema, use `db.update(ventures).set(...).where(eq(id))`, return 200 with updated entity or 404 if not found
- [x] 2.2 Add `router.delete("/:id", ...)` handler in `apps/backend/src/routes/ventures.ts` — set `zzz_is_active: false` and `zzzDeletedAt: new Date()` via `db.update()`, return 204 on success or 404 if not found
- [x] 2.3 Import `eq` from drizzle-orm and `UpdateVentureSchema` from `@repo/shared`

## Phase 3: Tests (TDD)

- [x] 3.1 Add mock for `update()` in `beforeAll` — return updated venture with `zzz_is_active: true`
- [x] 3.2 Write test: PUT returns 200 with updated venture
- [x] 3.3 Write test: PUT returns 404 when venture not found
- [x] 3.4 Write test: PUT returns 400 on invalid payload (missing required fields)
- [x] 3.5 Write test: DELETE returns 204 on success
- [x] 3.6 Write test: DELETE returns 404 when venture not found
- [x] 3.7 Run `make test` and verify all tests pass
