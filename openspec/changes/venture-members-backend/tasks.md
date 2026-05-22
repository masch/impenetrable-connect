# Tasks: venture-members-backend

## Phase 1: Database Schema

- [ ] 1.1 Create `apps/backend/src/db/schema/venture-members.ts` with Drizzle pgTable
- [ ] 1.2 Add export to `apps/backend/src/db/schema/index.ts`

## Phase 2: Migration

- [ ] 2.1 Generate Drizzle migration with `drizzle-kit generate`

## Phase 3: API Endpoint

- [ ] 3.1 Add `GET /v1/ventures/user/:userId` to `apps/backend/src/routes/ventures.ts`

## Phase 4: Tests

- [ ] 4.1 Add test for 200 with memberships
- [ ] 4.2 Add test for 200 empty array (user has no memberships)
- [ ] 4.3 Add test for 500 DB error
- [ ] 4.4 Run `make test` and verify all pass

## Total: 8 tasks

## Estimated lines: ~120-150
