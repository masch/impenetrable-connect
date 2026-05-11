# Proposal: Moment Time Ranges with Timezone

## Intent

Add configurable `startTime`, `endTime`, and `timezone` fields to `SERVICE_MOMENTS` in `apps/mobile/src/constants/moments.ts`. This enables the mobile app to display time ranges with explicit timezone support for each moment (BREAKFAST, LUNCH, SNACK, DINNER), addressing GitHub Issues #165 and #167.

## Scope

### In Scope (Issues #165 + #167)

- **#165**: Add `startTime` and `endTime` fields (string HH:mm) to each moment object in `SERVICE_MOMENTS`
- **#165**: Add `timezone` field to each moment with default `America/Argentina/Buenos_Aires` (global per project, configurable in future)
- **#165**: Create `Timezone` type in `packages/shared/src/types/timezone.ts` for reusability future
- **#165**: Add helper `formatMomentTimeRange()` for display
- **#165**: Update `getMomentConfig()` return type to include new fields
- **#165**: UI: Display time ranges in booking selector (below moment label)
- **#165**: UI: Time picker for user to select specific hour within the moment's range (using native DateTimePicker - see issue #172 for custom component)
- **#165**: Validation: Ensure selected hour is within the moment's allowed range
- **#165**: Store: Save exact time + moment (not just moment)
- **#167**: UI: Display moment + exact time in order confirmation screen
- Mock mode: No backend/DB - config in moments.ts works in-memory

### Out of Scope

- Backend CRUD & persistence for moments (future - issue #TBD)
- Backend validation of reservation times against these ranges
- i18n time format (device locale handles)
- Migration of other date fields (issues #170, #171)

## Capabilities

### New Capabilities

- `moment-time-config`: Defines start/end times and timezone for each service moment with accessor functions

### Modified Capabilities

- None — existing reservation specs unaffected

## Approach

Add `startTime`, `endTime`, and `timezone` as string properties to each moment in `SERVICE_MOMENTS` array. Define sensible defaults (BREAKFAST 08:00-11:00, LUNCH 12:00-15:00, SNACK 16:00-18:00, DINNER 19:00-22:00, all America/Argentina/Buenos_Aires). Extend `getMomentConfig()` return type and add `formatMomentTimeRange()` helper for display. Create reusable `Timezone` type in shared package.

**Time Selection Flow**:

1. User selects moment → time range displayed
2. Time picker appears (filtered to moment's range)
3. User selects specific hour within range
4. Validation ensures hour is valid before submission
5. Reservation stores: `zzz_service_at` with ISO datetime + timezone (e.g., "2024-01-15T09:30:00-03:00")
6. Confirmation displays: "Breakfast - 09:30"

**Entity Change (Option A - Replace)**:

- Modify `ReservationDbSchema` to **replace** `zzz_service_date: z.date()` with `zzz_service_at: z.string()` (ISO datetime with timezone)
- Keep `zzz_time_of_day` for fast filtering by moment
- **Order entity unchanged** - has `zzz_reservation_id` FK, gets the new field through the relation

| Risk                                           | Likelihood | Mitigation                                   |
| ---------------------------------------------- | ---------- | -------------------------------------------- |
| Timezone edge cases at DST transitions         | Low        | Use IANA timezone IDs; document DST behavior |
| Validation gap (user picks time outside range) | Low        | Not in scope — future enhancement            |

## Affected Areas

| Area                                          | Impact   | Description                                                                |
| --------------------------------------------- | -------- | -------------------------------------------------------------------------- |
| `packages/shared/src/types/reservation.ts`    | Modified | Replace `zzz_service_date` with `zzz_service_at` (ISO datetime + timezone) |
| `apps/mobile/src/constants/moments.ts`        | Modified | Add time fields to SERVICE_MOMENTS and update helpers                      |
| `packages/shared/src/types/timezone.ts`       | New      | Create reusable Timezone type                                              |
| `packages/shared/src/index.ts`                | Modified | Export Timezone type                                                       |
| `apps/mobile/src/app/tourist/index.tsx`       | Modified | Time picker UI + range validation (#165)                                   |
| `apps/mobile/src/app/tourist/booking.tsx`     | Modified | Display moment + exact time in confirmation (#167)                         |
| `apps/mobile/src/stores/reservation.store.ts` | Modified | Store ISO datetime with timezone                                           |
| `packages/shared/src/types/common.ts`         | None     | ServiceMomentSchema unchanged                                              |

## Rollback Plan

Revert changes to `moments.ts` and delete `timezone.ts` — time fields are purely additive and non-breaking. No migrations needed.

## Dependencies

- None — standalone config enhancement

## Success Criteria

- [ ] `SERVICE_MOMENTS` includes `startTime`/`endTime`/`timezone` for all 4 moments
- [ ] `getMomentConfig()` returns time fields
- [ ] New helper `formatMomentTimeRange()` exists and formats correctly
- [ ] `Timezone` type created in shared package and exported
- [ ] `ReservationDbSchema` uses `zzz_service_at` (ISO datetime + timezone) instead of `zzz_service_date`
- [ ] UI displays time ranges in booking selector (#165)
- [ ] UI allows user to select specific hour within moment's allowed range (#165)
- [ ] Validation ensures selected hour is within moment's range (#165)
- [ ] Reservation stores ISO datetime with timezone (e.g., "2024-01-15T09:30:00-03:00")
- [ ] UI displays moment + exact time in order confirmation (#167)
- [ ] `make test` passes
- [ ] `make typecheck` passes
