# Design: Moment-Based Catalog Filtering

## Technical Approach

Add moment-based filtering to the tourist booking flow by extending the `CatalogItem` schema with an optional `zzz_service_moments` array. The filtering occurs at the component level in `booking.tsx` using the `selectedMoment` already available from `useCartStore()`. Excursions (category_id = 2) are explicitly excluded from filtering to remain moment-agnostic.

## Architecture Decisions

### Decision: Moment Field Location

**Choice**: Add `zzz_service_moments: ServiceMoment[]` to `CatalogItemSchema` in `packages/shared/src/types/catalog.ts`
**Alternatives considered**: Store moments only in mobile mock data; use separate lookup table
**Rationale**: Single source of truth in shared types ensures consistency across all clients. Schema validation ensures type safety.

### Decision: Filtering Location

**Choice**: Filter at component level in `booking.tsx` using `useMemo` on `gastronomyServices`
**Alternatives considered**: Filter in catalog store; create custom hook `useMomentFilteredServices`
**Rationale**: Minimal code change — `selectedMoment` already available from `useCartStore()`. Real-time filtering happens automatically when `selectedMoment` changes. The existing pattern in booking.tsx already filters by category, so adding moment filter follows the same approach.

### Decision: Handling Items Without Moments

**Choice**: If `zzz_service_moments` is undefined or empty, treat as available for all moments (show always)
**Alternatives considered**: Require all gastronomy items to have moments defined; hide items without moments
**Rationale**: Backward compatible with existing catalog items. The spec indicates moments field is optional.

### Decision: Excursion Handling

**Choice**: Filter gastronomy only; always show excursions regardless of moment
**Alternatives considered**: Add moments to excursions with all values; check category_id before applying filter
**Rationale**: Spec explicitly states excursions are moment-agnostic. Using category check is explicit and matches spec language (`category_id = 2`).

## Data Flow

```
tourist/index.tsx                    tourist/booking.tsx
     │                                      │
     └── setContext(date, moment, time) ───►│
                                                │
                                                ▼
                                    useCartStore
                                         │
                        selectedMoment: ServiceMoment
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │ filter by category  │
                              │ (existing: line 270)│
                              └─────────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │ filter by moment    │ ← NEW
                              │ if category === 1   │
                              └─────────────────────┘
                                         │
                          ┌──────────────┴──────────────┐
                          ▼                             ▼
                   gastronomyServices              excursionServices
                   (moment-filtered)            (always visible)
```

## File Changes

| File                                      | Action | Description                                                     |
| ----------------------------------------- | ------ | --------------------------------------------------------------- |
| `packages/shared/src/types/catalog.ts`    | Modify | Add `zzz_service_moments` optional field to `CatalogItemSchema` |
| `apps/mobile/src/mocks/catalog.ts`        | Modify | Add `zzz_service_moments` arrays to mock catalog items          |
| `apps/mobile/src/app/tourist/booking.tsx` | Modify | Add moment-based filter on gastronomy services                  |

## Interfaces / Contracts

```typescript
// In packages/shared/src/types/catalog.ts
import { ServiceMomentSchema } from "./common";

export const CatalogItemSchema = z.object({
  // ... existing fields
  zzz_service_moments: z.array(ServiceMomentSchema).optional(),
});

// In booking.tsx — filter logic
const gastronomyServices = useMemo(() => {
  return services
    .filter((s) => s.zzz_catalog_category_id === SERVICE_CATEGORY_IDS.GASTRONOMY)
    .filter((s) => {
      // If no moments defined, show for all
      if (!s.zzz_service_moments?.length) return true;
      // Otherwise check if selectedMoment is in the array
      return s.zzz_service_moments.includes(selectedMoment as ServiceMoment);
    });
}, [services, selectedMoment]);

const excursionServices = services.filter(
  (s) => s.zzz_catalog_category_id === SERVICE_CATEGORY_IDS.EXCURSION,
);
```

## Testing Strategy

| Layer       | What to Test                         | Approach                                                                 |
| ----------- | ------------------------------------ | ------------------------------------------------------------------------ |
| Unit        | Moment filter function               | Test with mock services, various moment combinations                     |
| Integration | Booking screen renders correct items | Test that gastronomy items appear/disappear based on selectedMoment      |
| E2E         | Full tourist flow                    | Select moment → verify items shown → change moment → verify items update |

## Migration / Rollout

No migration required. The `zzz_service_moments` field is optional — existing catalog items without this field will continue to display for all moments. New items can be populated with appropriate moment arrays in the mock data.

## Open Questions

- [ ] Should moments be validated at schema level to ensure valid ServiceMoment values only? (Current design uses z.array(ServiceMomentSchema) which enforces this)
- [ ] Should gastronomy items without moments show a UI indicator that they're available for all moments? (Not in current scope)
