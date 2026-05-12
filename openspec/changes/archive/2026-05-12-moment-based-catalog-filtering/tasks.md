# Tasks: moment-based-catalog-filtering

## Review Workload Forecast

| Field                   | Value       |
| ----------------------- | ----------- |
| Estimated changed lines | ~120–180    |
| 400-line budget risk    | Low         |
| Chained PRs recommended | No          |
| Suggested split         | Single PR   |
| Delivery strategy       | ask-on-risk |
| Chain strategy          | pending     |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Type Definition

- [ ] 1.1 Add `ServiceMoment` to `packages/shared/src/types/common.ts` if not already exported
- [ ] 1.2 Add `zzz_service_moments` optional field to `CatalogItemSchema` in `packages/shared/src/types/catalog.ts`
- [ ] 1.3 Run `make test` to verify types compile correctly

## Phase 2: Mock Data

- [ ] 2.1 Add `zzz_service_moments` to gastronomy items in `apps/mobile/src/mocks/catalog.ts` (e.g., BREAKFAST/LUNCH for breakfast items, DINNER for dinner items)
- [ ] 2.2 Leave excursion items (category_id = 2) without `zzz_service_moments` (moment-agnostic)
- [ ] 2.3 Run `make test` to verify mock data is valid

## Phase 3: Filter Logic & TDD

- [ ] 3.1 RED: Write unit test for `filterGastronomyByMoment` in `apps/mobile/src/app/tourist/__tests__/booking.test.tsx` — test that items without moments show always; items with matching moment show; items without matching moment are hidden
- [ ] 3.2 GREEN: Implement moment filter in `booking.tsx` using `useMemo` on gastronomy services
- [ ] 3.3 REFACTOR: Extract filter logic to named constant for readability
- [ ] 3.4 Verify `make test` passes for all cases

## Phase 4: Integration

- [ ] 4.1 Verify `selectedMoment` is available from `useCartStore()` in `booking.tsx` — no navigation changes needed
- [ ] 4.2 Run `make test` to confirm full booking flow works with moment filtering
- [ ] 4.3 Manual smoke test: load booking screen in Expo, change moments, verify gastronomy items filter correctly and excursions stay visible

## Acceptance Criteria

1. `CatalogItemSchema` includes optional `zzz_service_moments: ServiceMoment[]` field
2. Mock gastronomy items have moment arrays; excursion items have none
3. `gastronomyServices` in `booking.tsx` filters by `selectedMoment` when `zzz_service_moments` is defined
4. Excursion items always display regardless of `selectedMoment`
5. All tests pass (`make test`)
