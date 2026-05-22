# Exploration: Moment Time Ranges

## Current State

### moments.ts Structure

The file `apps/mobile/src/constants/moments.ts` defines moment configurations with:

- `zzz_id`: ServiceMoment enum (BREAKFAST, LUNCH, SNACK, DINNER)
- `icon`: MaterialCommunityIcons name
- `labelKey`: i18n translation key
- `color`: color token name
- `hex`: hex color code
- `bgClass` / `textClass`: NativeWind utility classes

**Missing**: No time range definition exists.

### Where Moments Are Used

1. **Booking flow** (`apps/mobile/src/app/tourist/index.tsx`): Moment selector with icons and labels
2. **Orders screen** (`apps/mobile/src/app/tourist/orders.tsx`): Displays moment via `getMomentConfig()`
3. **Entrepreneur agenda** (`apps/mobile/src/app/entrepreneur/agenda.tsx`): Shows moment badges
4. **Entrepreneur request** (`apps/mobile/src/app/entrepreneur/request.tsx`): Uses moment config

### Related Types

- `@repo/shared` defines `ServiceMomentSchema` as enum in `packages/shared/src/types/common.ts`
- Reservation type uses `zzz_time_of_day: ServiceMomentSchema`

## Approaches

### 1. Add timeRange to SERVICE_MOMENTS (Recommended)

Add a `timeRange` object to each moment config with `start` and `end` strings:

```typescript
{
  zzz_id: "BREAKFAST",
  timeRange: { start: "07:00", end: "11:00" },
  // ...existing fields
}
```

- **Pros**: Minimal changes, preserves existing patterns, easy to extend
- **Cons**: None significant
- **Effort**: Low

### 2. Create separate time range utility

Keep moments.ts unchanged and create a separate `timeRanges.ts` that maps moment → time range.

- **Pros**: Decoupled from UI config
- **Cons**: Additional file, introduces mapping logic, potential sync issues
- **Effort**: Medium

### 3. Store in @repo/shared schema

Add time ranges to the shared schema so they're available across all packages.

- **Pros**: Single source of truth across web/mobile/backend
- **Cons**: Schema change requires coordination, might be overkill for UI-only data
- **Effort**: Medium-High

## Recommendation

**Approach 1**: Add `timeRange` to `SERVICE_MOMENTS` config in `moments.ts`.

Implementation path:

1. Add `startTime` and `endTime` fields to each moment entry
2. Add helper functions (`getMomentTimeRange()`, `formatTimeRange()`)
3. Update booking UI to display time ranges below moment labels
4. Update other moment displays (orders, agenda) as needed

## Risks

- **Display crowding**: Adding time range text may crowd the moment buttons in the booking flow (line 187-237 in index.tsx) — consider using smaller text or hiding until selection
- **i18n consideration**: Time format may need localization (12h vs 24h) — add translation key for format
- **Validation**: No current validation enforces booking happens within time range — consider if this is needed

## Ready for Proposal

**Yes**. This is a straightforward change. Next phase should produce:

- Delta spec with exact field additions
- Task breakdown focusing on moments.ts updates first, then UI display
- Mockup or description of how time ranges appear in the booking selector
