# Proposal: Add Ventures CRUD Endpoints

## Intent

Complete CRUD operations for ventures by adding PUT (update) and DELETE (remove) endpoints. Completes the API surface started with GET/POST in the previous change.

## Scope

### In Scope

- `PUT /v1/ventures/:id` — update existing venture
- `DELETE /v1/ventures/:id` — soft-delete or remove venture
- Zod validation for update payload
- Unit tests for both endpoints
- Delta spec for `ventures-api` capability

### Out of Scope

- Batch delete operations
- Hard delete with cascade (future work)

## Capabilities

### New Capabilities

- `venture-update`: Update existing venture by ID with validation
- `venture-delete`: Delete venture by ID

### Modified Capabilities

- None (extending existing `ventures-api` with new operations, no spec-level behavior changes)

## Approach

Follow the established `ventures.ts` pattern:

1. Add `router.put("/:id", ...)` and `router.delete("/:id", ...)` handlers
2. Use `c.req.param('id')` for path parameter extraction
3. Add `UpdateVentureSchema` to `@repo/shared` (all fields optional, omit id/timestamps)
4. Return 200 with updated entity (PUT) or 204 (DELETE)
5. Handle 404 when venture not found
6. Add test cases mirroring ventures.test.ts structure

## Affected Areas

| Area                                       | Impact   | Description                   |
| ------------------------------------------ | -------- | ----------------------------- |
| `apps/backend/src/routes/ventures.ts`      | Modified | Add PUT + DELETE handlers     |
| `packages/shared/src/types/venture.ts`     | Modified | Add `UpdateVentureSchema`     |
| `apps/backend/src/routes/ventures.test.ts` | Modified | Add test cases for PUT/DELETE |
| `openspec/specs/ventures-api/spec.md`      | Modified | Delta spec for new operations |

## Risks

| Risk                             | Likelihood | Mitigation                                                       |
| -------------------------------- | ---------- | ---------------------------------------------------------------- |
| Concurrent update race condition | Low        | Use DB-level row locking if needed later                         |
| Missing UpdateVentureSchema      | Low        | Create from `VentureSchema.partial()` with id/timestamps omitted |

## Rollback Plan

Revert `ventures.ts` to previous state, remove `UpdateVentureSchema` from venture.ts, remove test additions. All changes are additive — no data migration needed.

## Dependencies

- `@repo/shared` must export `UpdateVentureSchema`

## Success Criteria

- [ ] PUT /v1/ventures/:id returns 200 with updated venture
- [ ] PUT returns 404 when venture not found
- [ ] PUT returns 400 on invalid payload
- [ ] DELETE /v1/ventures/:id returns 204 on success
- [ ] DELETE returns 404 when venture not found
- [ ] All tests pass via `make test`
