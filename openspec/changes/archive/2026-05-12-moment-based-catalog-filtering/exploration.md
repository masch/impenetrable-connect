# Exploration: Moment-Based Catalog Filtering (#164)

## Current State

### Catalog Data Model

- **`CatalogItem`** (`packages/shared/src/types/catalog.ts`): Currently has NO moment binding field
- Fields: `zzz_id`, `zzz_catalog_category_id`, `zzz_category`, `zzz_name_i18n`, `zzz_description_i18n`, `zzz_allergens_i18n`, `zzz_ingredients_i18n`, `zzz_price`, `zzz_max_participants`, `zzz_image_url`, `zzz_global_pause`
- **Gap**: No field to indicate which moment(s) a catalog item serves

### Service Moments (Existing)

Defined in `packages/shared/src/types/common.ts`:

```typescript
ServiceMoment = "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";
```

Defined in `apps/mobile/src/constants/moments.ts`:

- BREAKFAST: 08:00 - 11:00
- LUNCH: 12:00 - 15:00
- SNACK: 16:00 - 18:00
- DINNER: 19:00 - 22:00

### Tourist Flow

1. **`/tourist/index.tsx`**: User selects date, guest count, moment, and time → `setContext()` is called → navigates to `/tourist/booking`
2. **`/tourist/booking.tsx`**: Displays catalog grouped by category (gastronomy/excursion) WITHOUT moment filtering

### Current Filtering

- `booking.tsx` line 270-271: Only filters by `zzz_catalog_category_id` (1 = Gastronomy, 2 = Excursion)
- NO filter based on `selectedMoment`

## Affected Areas

| File                                      | Impact                                                  |
| ----------------------------------------- | ------------------------------------------------------- |
| `packages/shared/src/types/catalog.ts`    | Must add `zzz_service_moments` field to schema          |
| `apps/mobile/src/mocks/catalog.ts`        | Must add moment binding to each catalog item            |
| `apps/mobile/src/app/tourist/booking.tsx` | Must filter gastronomy services by selected moment      |
| `apps/mobile/src/app/tourist/index.tsx`   | May need to show filtered catalog preview (optional UX) |

## Key Findings

1. **Catalog items are moment-agnostic by design** — This is the root cause of the bug
2. **Excursions should NOT be filtered** — They typically run any time of day; only gastronomy items need moment filtering
3. **Items like DESAYUNO, MERIENDA** (ids 15-16) logically belong to BREAKFAST/SNACK but have no binding
4. **Main dishes (empanadas, asado, etc.)** could serve multiple moments (e.g., empanadas for LUNCH or DINNER)

## Approaches

### 1. **Single Moment Binding** (Recommended for MVP)

- Add `zzz_service_moments: z.array(ServiceMomentSchema)` to `CatalogItemSchema`
- Each item belongs to ONE primary moment (simplest model)
- Filter: `services.filter(s => s.zzz_service_moments?.includes(selectedMoment))`

| Pros                               | Cons                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| Simple, fast filtering             | Can't serve same item in multiple moments                |
| Clear UX (item shows in one place) | May need duplicates for items served in multiple moments |
| Easy to implement                  |                                                          |

**Effort**: Low-Medium

### 2. **Multi-Moment Binding**

- Same field but items can belong to multiple moments
- Filter: `services.filter(s => s.zzz_service_moments?.includes(selectedMoment))`
- Items like empanadas appear in LUNCH and DINNER if marked both

| Pros                                      | Cons                                                      |
| ----------------------------------------- | --------------------------------------------------------- |
| No duplication needed                     | UX confusion: same item in multiple moment sections       |
| Realistic (empanadas at lunch AND dinner) | May need visual indicator of which moments an item serves |
|                                           | More complex data migration                               |

**Effort**: Medium

### 3. **Tag-Based Moment Assignment**

- Keep `CatalogItem` unchanged
- Maintain external moment mapping (separate config or database table)
- Complex to maintain, adds coupling

| Pros              | Cons                    |
| ----------------- | ----------------------- |
| No schema changes | Additional complexity   |
| Flexible          | Data inconsistency risk |
|                   | Harder to reason about  |

**Effort**: High

## Recommendation

**Approach 1 (Single Moment Binding)** for initial implementation:

- Minimal schema change
- Clear UX behavior
- Easy to extend later

Required changes:

1. Update `CatalogItemSchema` in `@repo/shared`
2. Add `zzz_service_moments` array field
3. Update mock data with moment assignments
4. Filter gastronomy services in `booking.tsx`

## Risks

- **Incomplete moment mapping**: Mock data may miss valid moment assignments for some items
- **Excursion filtering**: Excursions should remain unfiltered (they span multiple moments)
- **Data migration**: If this goes to production, existing items need moment assignment

## Questions/Assumptions

1. **Should excursions be moment-filtered?** Assumption: No, excursions run independent of meal times
2. **Can an item serve multiple moments?** Assumption: For MVP, single-moment binding is sufficient
3. **What moment assignments for existing items?** Need to define mappings (e.g., DESAYUNO → BREAKFAST, ESTOFADO → DINNER)
4. **Should empty moment array show item in all moments?** Assumption: No — items with no moment binding are hidden

## Ready for Proposal

**Yes** — Clear understanding of current state, viable approaches, and minimal implementation path.

Suggested change name: `moment-based-catalog-filtering`
