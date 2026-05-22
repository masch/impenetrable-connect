# Proposal: Venture Store

## Intent

Create a Zustand store (`venture.store.ts`) to centralize venture state management, replacing scattered direct service calls. Currently, components use `VentureService` directly; the backend already has full CRUD at `/ventures`. This change brings ventures in line with the established pattern used by `project.store.ts`, `auth.store.ts`, etc.

## Scope

### In Scope

- Create `venture.store.ts` following `project.store.ts` pattern exactly
- Add full CRUD actions: `fetchVentures`, `selectVenture`, `createVenture`, `updateVenture`, `deleteVenture`
- State shape: `ventures[]`, `selectedVenture`, `isLoading`, `isSaving`, `error`
- Update `venture.service.ts` to match backend API surface (PUT, DELETE, GET /ventures)
- Migrate components to use store instead of direct service calls

### Out of Scope

- Adding venture members management to store (separate concern)
- Backend changes (CRUD already exists at `/v1/ventures`)
- Testing beyond unit tests for store and service

## Capabilities

### New Capabilities

- `venture-state`: Zustand store managing venture collection and selection state with async CRUD actions

### Modified Capabilities

- None

## Approach

1. **Service alignment**: Update `venture.service.ts` REST implementation to match backend routes:
   - `GET /ventures` → `getVentures()`
   - `POST /ventures` → `createVenture()`
   - `PUT /ventures/:id` → `updateVenture()` (change from PATCH to PUT)
   - `DELETE /ventures/:id` → `deleteVenture()`
   - Add mock implementations for all CRUD operations

2. **Store creation**: Mirror `project.store.ts` structure:
   - Interface with typed state and actions
   - Use `isLoading` for reads, `isSaving` for mutations
   - Error mapping via `mapNetworkError`
   - Optimistic list updates on mutations

3. **Component migration**: Update consumers to use store selectors

## Affected Areas

| Area                                          | Impact   | Description                             |
| --------------------------------------------- | -------- | --------------------------------------- |
| `apps/mobile/src/stores/venture.store.ts`     | New      | Zustand store for venture state         |
| `apps/mobile/src/services/venture.service.ts` | Modified | Add missing CRUD methods, fix PUT/PATCH |
| `apps/mobile/src/stores/`                     | Modified | New file added to store directory       |

## Risks

| Risk                                                | Likelihood | Mitigation                                               |
| --------------------------------------------------- | ---------- | -------------------------------------------------------- |
| Breaking existing components using service directly | Low        | Migrate incrementally; keep service interface compatible |
| Mock service divergence from REST behavior          | Medium     | Ensure mock mirrors all CRUD operations                  |

## Rollback Plan

1. Revert `venture.store.ts` creation (delete file)
2. Revert `venture.service.ts` to previous state
3. Revert component changes one by one
4. All changes are additive; rollback restores prior behavior

## Dependencies

- Backend `/v1/ventures` CRUD endpoints (already exist)
- `@repo/shared` Venture types (already exist)

## Success Criteria

- [ ] Store has all CRUD actions matching `project.store.ts` pattern
- [ ] Service has GET, POST, PUT, DELETE methods aligned with backend
- [ ] Components use store instead of direct service calls
- [ ] `make test` passes for affected modules
- [ ] No regressions in existing venture functionality
