# Tasks: Add Ventures API Route

## Review Workload Forecast

| Field                   | Value       |
| ----------------------- | ----------- |
| Estimated changed lines | ~100-120    |
| 400-line budget risk    | Low         |
| Chained PRs recommended | No          |
| Delivery strategy       | ask-on-risk |
| Chain strategy          | pending     |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal                   | Likely PR | Notes               |
| ---- | ---------------------- | --------- | ------------------- |
| 1    | Add ventures API route | Single PR | All tasks in one PR |

## Phase 1: Route Implementation

- [x] 1.1 Create `apps/backend/src/routes/ventures.ts` — GET returns all ventures sorted by `zzz_is_active` DESC, `name` ASC (follow projects.ts pattern)
- [x] 1.2 Create `apps/backend/src/routes/ventures.ts` — POST creates venture with `CreateVentureSchema` validation, returns 201/400/500

## Phase 2: Route Registration

- [x] 2.1 Add `import venturesRouter from "./routes/ventures"` to `apps/backend/src/app.ts` (line ~4)
- [x] 2.2 Add `app.route("/v1/ventures", venturesRouter)` to `apps/backend/src/app.ts` (after line 38)

## Phase 3: Testing

- [x] 3.1 Write RED test: `apps/backend/src/routes/ventures.test.ts` — GET returns 200 with array (fails, no route yet)
- [x] 3.2 Write GREEN test: GET returns 200 with array (implement route to pass)
- [x] 3.3 Write RED test: POST with valid data returns 201 (fails, no POST handler)
- [x] 3.4 Write GREEN test: POST with valid data returns 201 (implement POST to pass)
- [x] 3.5 Write RED test: POST with invalid data returns 400 (fails)
- [x] 3.6 Write GREEN test: POST with invalid data returns 400 (add Zod validation)
- [x] 3.7 Write test: Unauthenticated requests return 401 (test auth middleware)
- [x] 3.8 Write test: DB error returns 500 (test error handling)

## Phase 4: Verification

- [x] 4.1 Run `make test` — verify all tests pass
- [x] 4.2 Verify no regressions in existing tests
