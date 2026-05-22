# Tasks: Venture Store

## Review Workload Forecast

| Field                   | Value       |
| ----------------------- | ----------- |
| Estimated changed lines | ~400–500    |
| 400-line budget risk    | Medium      |
| Chained PRs recommended | No          |
| Suggested split         | Single PR   |
| Delivery strategy       | ask-on-risk |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal                                      | Likely PR | Notes                         |
| ---- | ----------------------------------------- | --------- | ----------------------------- |
| 1    | Venture store + service alignment + tests | PR 1      | All changes in one focused PR |

## Phase 1: Service Alignment

- [x] 1.1 Add `getVentures()`, `createVenture()`, `deleteVenture()` methods to `VentureServiceInterface` in `apps/mobile/src/services/venture.service.ts`
- [x] 1.2 Implement `getVentures()` in `MockVentureService` (return `mockVentures`)
- [x] 1.3 Implement `createVenture()` in `MockVentureService` (push to `mockVentures`, return created)
- [x] 1.4 Implement `deleteVenture()` in `MockVentureService` (splice from `mockVentures`, return true)
- [x] 1.5 Implement `getVentures()` in `RestVentureService` (GET `/ventures`)
- [x] 1.6 Implement `createVenture()` in `RestVentureService` (POST `/ventures`)
- [x] 1.7 Implement `deleteVenture()` in `RestVentureService` (DELETE `/ventures/:id`)
- [x] 1.8 Change `RestVentureService.updateVenture` method from PATCH to PUT

## Phase 2: Store Creation

- [x] 2.1 Create `apps/mobile/src/stores/venture.store.ts` mirroring `project.store.ts` pattern with state: `ventures[]`, `selectedVenture`, `isLoading`, `isSaving`, `error`
- [x] 2.2 Add `fetchVentures` action calling `VentureService.getVentures()`
- [x] 2.3 Add `selectVenture` action calling `VentureService.getVentureById(id)`
- [x] 2.4 Add `createVenture` action with optimistic list update
- [x] 2.5 Add `updateVenture` action updating both list and selection
- [x] 2.6 Add `deleteVenture` action removing from list and clearing selection
- [x] 2.7 Add `setSelectedVenture` for direct object assignment

## Phase 3: Testing

- [x] 3.1 Create `apps/mobile/src/stores/__tests__/venture.store.test.ts` with tests for all store actions
- [x] 3.2 Add tests for `getVentures`, `createVenture`, `deleteVenture` in `venture.service.test.ts`
- [x] 3.3 Update `updateVenture` test in `venture.service.test.ts` to expect PUT method
- [x] 3.4 Run `make test` and verify all tests pass

## Implementation Order

1. **Service first** — store depends on service interface
2. **Store second** — implements the full state machine
3. **Tests last** — verify both layers pass before consider done
