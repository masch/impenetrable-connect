# Proposal: venture-members-backend

## Intent

Add `venture_members` database table and API endpoint to support multiple ventures per user via membership. Currently, VentureMember only exists in mock data — the backend has no table or route for it.

## Scope

### In Scope

- Drizzle schema for `venture-members` table
- Drizzle migration (create table)
- `GET /v1/ventures/user/:userId` endpoint returning ventures by membership
- Update `@repo/shared` types/exports if needed
- Unit tests for new route

### Out of Scope

- Frontend store migration (next SDD)
- Venture selector component (next SDD)
- `POST`/`PUT`/`DELETE` for venture_members (future)
- `VentureMember` role-based authorization (future)

## Capabilities

### New Capabilities

- `venture-members`: Backend support for user-venture membership table and lookup endpoint

### Modified Capabilities

- `ventures-api`: Add `GET /v1/ventures/user/:userId` to existing ventures route

## Approach

Follow existing patterns:

- **Schema**: Mirror `ventures.ts` pattern — `pgTable` with `serial` PK, foreign keys, `auditColumns`
- **Route**: Add to existing `ventures.ts` router — `ventures.get("/user/:userId", ...)` with auth middleware
- **Migration**: Generate via `drizzle-kit generate`, execute via `make db-migrate`
- **Tests**: Mock DB layer, test 200 + 404 scenarios

## Affected Areas

| Area                                            | Impact   | Description              |
| ----------------------------------------------- | -------- | ------------------------ |
| `apps/backend/src/db/schema/venture-members.ts` | New      | Drizzle schema table     |
| `apps/backend/src/db/migrations/`               | New      | Auto-generated migration |
| `apps/backend/src/db/schema/index.ts`           | Modified | Add export               |
| `apps/backend/src/routes/ventures.ts`           | Modified | Add GET /user/:userId    |
| `apps/backend/src/routes/ventures.test.ts`      | Modified | Add test cases           |

## Risks

| Risk                                   | Likelihood | Mitigation                                   |
| -------------------------------------- | ---------- | -------------------------------------------- |
| Migration conflicts with existing data | Low        | New table only, no existing data affected    |
| Missing foreign key constraint         | Low        | Follow existing pattern with `.references()` |

## Rollback Plan

- Revert migration: `drizzle-kit drop` or manual `DROP TABLE venture_members`
- Revert route changes: `git checkout HEAD -- apps/backend/src/routes/ventures.ts`

## Dependencies

- `drizzle-kit` for migration generation

## Success Criteria

- [ ] `make test` passes with new tests
- [ ] `GET /v1/ventures/user/:userId` returns correct ventures for a user
- [ ] Migration generates and applies cleanly
