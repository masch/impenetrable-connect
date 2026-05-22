# Design: Add Ventures CRUD Endpoints

## Technical Approach

Add `PUT /v1/ventures/:id` and `DELETE /v1/ventures/:id` handlers following existing GET/POST patterns in `ventures.ts`. Use `db.update()` for PUT and soft-delete (`zzz_is_active = false`) for DELETE. Both return 404 if venture not found.

## Architecture Decisions

### Decision: Soft Delete vs Hard Delete

**Choice**: Soft delete via `zzz_is_active = false` and `zzzDeletedAt` timestamp
**Alternatives considered**: Hard delete (permanent removal)
**Rationale**: `zzz_is_active` and `zzzDeletedAt` already exist in schema. Soft delete preserves audit trail and allows recovery. Hard delete requires cascade consideration for foreign keys (venture_members, tasks, etc.).

### Decision: Mutable Fields for PUT

**Choice**: Only allow `name`, `zzz_max_capacity`, `zzz_cascade_order`, `zzz_is_paused` to be updated
**Alternatives considered**: Allow all non-audit fields, allow changing owner
**Rationale**: `ownerId` change requires ownership transfer logic. `zzz_project_id` change may violate business rules. Audit columns (`zzzCreatedAt`) should never change.

### Decision: DELETE Response Code

**Choice**: 204 No Content on success
**Alternatives considered**: 200 with deleted entity
**Rationale**: DELETE with no body is REST convention. Client can fetch if they need confirmation.

## Data Flow

```
Client ──→ PUT /v1/ventures/:id ──→ authMiddleware ──→ ventures router
                                                    │
                                                    ▼
                                              Parse + Validate
                                                    │
                                                    ▼
                                              db.update(ventures)
                                              .set({...})
                                              .where(eq(id))
                                                    │
                                                    ▼
                                              Return 200 with updated entity
```

```
Client ──→ DELETE /v1/ventures/:id ──→ authMiddleware ──→ ventures router
                                                     │
                                                     ▼
                                               Check exists
                                                     │
                                                     ▼
                                               db.update(ventures)
                                               .set({ zzz_is_active: false,
                                                      zzzDeletedAt: now() })
                                               .where(eq(id))
                                                     │
                                                     ▼
                                               Return 204
```

## File Changes

| File                                       | Action | Description                                       |
| ------------------------------------------ | ------ | ------------------------------------------------- |
| `apps/backend/src/routes/ventures.ts`      | Modify | Add `router.put()` and `router.delete()` handlers |
| `packages/shared/src/types/venture.ts`     | Modify | Add `UpdateVentureSchema` with optional fields    |
| `apps/backend/src/routes/ventures.test.ts` | Modify | Add test cases for PUT + DELETE                   |

## Interfaces / Contracts

```typescript
// UpdateVentureSchema - all fields optional except validation
export const UpdateVentureSchema = VentureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  zzz_project_id: true, // immutable after creation
  ownerId: true, // ownership transfer out of scope
}).partial();
```

### PUT Response

- **200**: `{ id, name, ownerId, zzz_max_capacity, ... }`
- **400**: `{ error: "Validation failed", details: [...] }`
- **404**: `{ error: "Not Found" }`

### DELETE Response

- **204**: No body
- **404**: `{ error: "Not Found" }`

## Testing Strategy

| Layer       | What to Test                            | Approach                      |
| ----------- | --------------------------------------- | ----------------------------- |
| Unit        | PUT updates each field correctly        | Mock db, assert update values |
| Unit        | DELETE sets is_active=false + deletedAt | Mock db, assert set values    |
| Unit        | PUT returns 404 when not found          | Mock empty result             |
| Unit        | DELETE returns 404 when not found       | Mock empty result             |
| Integration | Full round-trip with real DB            | Hono test client              |

## Migration / Rollout

**No migration required.** Schema already has:

- `zzz_is_active: boolean` — for soft delete flag
- `zzzUpdatedAt: timestamp` — updated via Drizzle defaultNow()
- `zzzDeletedAt: timestamp` — set manually in delete handler

## Open Questions

None — all decisions made in proposal phase.
