# Proposal: Moment-Based Catalog Filtering (#164)

## Intent

Fix the booking flow bug where gastronomy services display regardless of the selected moment. Users selecting "cena" currently see breakfast items. Solution: each catalog item will support a list of allowed moments, filtering the catalog to show only items available at the selected moment.

## Scope

### In Scope

- Add `moments: Moment[]` (array) field to `CatalogItem` schema
- Update booking flow (`booking.tsx`) to filter gastronomy services by selected moment against item's allowed moments
- Display current moment selection in booking flow UI
- Update mock catalog data with moment assignments
- Excursions remain moment-agnostic (never filtered)

### Out of Scope

- Backend persistence layer (mock data only for now)
- Multi-language moment labels (future)
- Dynamic moment configuration UI

## Capabilities

### New Capabilities

- `moment-catalog-filtering`: Filter gastronomy catalog items by selected service moment

### Modified Capabilities

- `reservation` (existing): The moment selection flow already exists; this adds the filtering behavior to the catalog display

## Approach

**Multi-Moment Binding** — Each catalog item has `zzz_service_moments: ServiceMoment[]` (array). Filter logic: show item if `selectedMoment` is IN `item.zzz_service_moments`.

| Pros                                      | Cons                                  |
| ----------------------------------------- | ------------------------------------- |
| No item duplication needed                | Same item appears in multiple moments |
| Realistic (empanadas at lunch AND dinner) | May need visual indicator             |
| Matches user requirement explicitly       | Slightly more complex UX              |

**Filter Logic**:

```typescript
const gastronomyServices = allServices.filter(
  (s) =>
    s.zzz_catalog_category_id === 1 && // Gastronomy
    s.zzz_service_moments?.includes(selectedMoment), // Moment match
);
```

## Affected Areas

| Area                                      | Impact    | Description                                             |
| ----------------------------------------- | --------- | ------------------------------------------------------- |
| `packages/shared/src/types/catalog.ts`    | Modified  | Add `zzz_service_moments: z.array(ServiceMomentSchema)` |
| `apps/mobile/src/mocks/catalog.ts`        | Modified  | Add moment array to each gastronomy item                |
| `apps/mobile/src/app/tourist/booking.tsx` | Modified  | Filter by selectedMoment, show moment indicator         |
| `apps/mobile/src/constants/moments.ts`    | Reference | Existing moment definitions                             |

## Risks

| Risk                                       | Likelihood | Mitigation                                             |
| ------------------------------------------ | ---------- | ------------------------------------------------------ |
| Incomplete moment assignments in mock data | Medium     | Audit all gastronomy items; default to common moments  |
| UX: same item in multiple moments          | Low        | Accept as feature, not bug per user request            |
| Excursion filtering accidentally applied   | Low        | Explicit filter: `category_id === 1` (Gastronomy) only |

## Rollback Plan

1. Remove `zzz_service_moments` field from `CatalogItemSchema`
2. Revert `booking.tsx` filter to original category-only logic
3. Roll back mock data (remove moments field)
4. All changes are in frontend mock data — no DB migration needed

## Dependencies

- `ServiceMoment` type already defined in `packages/shared/src/types/common.ts`
- `selectedMoment` already passed via reservation context

## Success Criteria

- [ ] User selecting "DINNER" sees only DINNER-appropriate items (no breakfast)
- [ ] User selecting "BREAKFAST" sees only BREAKFAST-appropriate items
- [ ] Excursions (category_id=2) always display regardless of moment
- [ ] Mock data includes moment assignments for all gastronomy items
- [ ] Tests pass: `make test`
