# Proposal: Add `/v1/ventures` API Route

## Intent

Add a backend API route for ventures to match the existing frontend service calls. Currently, the mobile app calls `/ventures/user/:userId` and `/ventures/:id` but these endpoints don't exist, causing 404 errors. This change completes the ventures feature by providing the missing backend layer.

## Scope

### In Scope

- Create `/v1/ventures` route file (`apps/backend/src/routes/ventures.ts`)
- Register route in `app.ts`
- Add unit tests following projects.ts pattern
- GET endpoint: return all ventures (sorted by is_active, name)
- POST endpoint: create new venture with Zod validation

### Out of Scope

- User-specific venture filtering (future feature)
- Venture update/delete endpoints (future feature)
- Venture member management (separate feature)

## Capabilities

### New Capabilities

- `ventures-api`: Full CRUD access to ventures entity via REST API

### Modified Capabilities

- None

## Approach

Follow the established `projects.ts` pattern:

1. Create `ventures.ts` router using `Hono<AppEnv>()`
2. Apply `authMiddleware` to all routes
3. Implement GET `/` returning all ventures (ordered by `zzz_is_active`, `name`)
4. Implement POST `/` with Zod validation using `CreateVentureSchema` from `@repo/shared`
5. Register in `app.ts` via `app.route("/v1/ventures", venturesRouter)`
6. Add test file with same coverage as `projects.test.ts`

## Affected Areas

| Area                                       | Impact   | Description               |
| ------------------------------------------ | -------- | ------------------------- |
| `apps/backend/src/routes/ventures.ts`      | New      | Route handler (~40 lines) |
| `apps/backend/src/app.ts`                  | Modified | Register ventures route   |
| `apps/backend/src/routes/ventures.test.ts` | New      | Unit tests                |

## Risks

| Risk                            | Likelihood | Mitigation                                                                 |
| ------------------------------- | ---------- | -------------------------------------------------------------------------- |
| Schema mismatch with DB columns | Low        | Use `CreateVentureSchema` from shared, cross-check with ventures.ts schema |
| Test setup complexity           | Low        | Reuse mock patterns from projects.test.ts                                  |

## Rollback Plan

1. Remove route registration from `app.ts`
2. Delete `ventures.ts` route file
3. Delete `ventures.test.ts` test file
4. Run `make test` to verify no regressions

## Dependencies

- `@repo/shared`: `CreateVentureSchema`, `VentureSchema`
- `apps/backend/src/db/schema/ventures`: ventures table definition
- `apps/backend/src/middleware/auth`: authMiddleware

## Success Criteria

- [ ] GET `/v1/ventures` returns 200 with ventures array
- [ ] POST `/v1/ventures` creates venture and returns 201
- [ ] Invalid POST returns 400 with validation errors
- [ ] Unauthenticated requests return 401
- [ ] All tests pass via `make test`
