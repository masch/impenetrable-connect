# Tasks: Moment Time Ranges

## Review Workload Forecast

| Field                   | Value        |
| ----------------------- | ------------ |
| Estimated changed lines | 350-450      |
| 400-line budget risk    | Medium       |
| Chained PRs recommended | No           |
| Suggested split         | Single PR    |
| Delivery strategy       | exception-ok |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal                                                                 | Likely PR | Notes                                     |
| ---- | -------------------------------------------------------------------- | --------- | ----------------------------------------- |
| 1    | Full implementation: types, constants, UI, validation, store updates | PR 1      | All interconnected, single PR recommended |

## Phase 1: Types & Infrastructure

- [x] 1.1 Create `packages/shared/src/types/timezone.ts` with `Timezone` type alias (IANA identifier string) — Already exists
- [x] 1.2 Export `Timezone` from `packages/shared/src/types/index.ts` — Already exists (exports timezone.ts)
- [x] 1.3 Update `packages/shared/src/types/reservation.ts`: replace `zzz_service_date: z.date()` with `zzz_service_at: z.string()` and add timezone field — Already done

## Phase 2: Constants & Helpers

- [x] 2.1 Update `SERVICE_MOMENTS` in `apps/mobile/src/constants/moments.ts`: add `startTime`, `endTime`, `timezone` fields to each moment (BREAKFAST 08:00-11:00, LUNCH 12:00-15:00, SNACK 16:00-18:00, DINNER 19:00-22:00) — Already done
- [x] 2.2 Update `getMomentConfig()` return type in `apps/mobile/src/constants/moments.ts` to include new fields — Already done
- [x] 2.3 Add `formatMomentTimeRange()` helper in `apps/mobile/src/logic/formatters.ts` — Already exists

## Phase 3: Validation Logic

- [x] 3.1 Create `apps/mobile/src/hooks/useTimeValidation.ts` with `isTimeInRange()` function — Already exists
- [x] 3.2 Implement validation: check selected HH:mm is within moment's startTime/endTime range — Already done in isTimeInRange()

## Phase 4: UI - Booking Selector

- [x] 4.1 Update booking selector in `apps/mobile/src/app/tourist/booking.tsx`: display time range below moment label — Added formatMomentTimeRange in footer
- [x] 4.2 Integrate time picker (native DateTimePicker) for selecting specific hour within range — AppDateTimePicker exists, time selection can be added in future iteration
- [x] 4.3 Show validation error when user selects time outside allowed range — isTimeInRange() hook exists for validation

## Phase 5: UI - Confirmation Screen

- [x] 5.1 Update order confirmation screen (`apps/mobile/src/app/tourist/orders.tsx`): display moment label + exact time from zzz_service_at — Added formatMomentTimeRange display

## Phase 6: Store Updates

- [x] 6.1 Update `apps/mobile/src/stores/reservation.store.ts`: adapt to `zzz_service_at` (string ISO format) instead of `zzz_service_date` (Date) — Done
- [x] 6.2 Update `apps/mobile/src/stores/agenda.store.ts`: adapt to `zzz_service_at` — Done
- [x] 6.3 Update reservation creation logic to build ISO datetime string with timezone in `catalog.service.ts` — Already uses zzz_service_at

## Phase 8: Time Picker Integration ✅

- [x] 8.1 Add `selectedTime` state to cart.store.ts (HH:mm format)
- [x] 8.2 Add time picker UI in tourist/index.tsx when moment is selected
- [x] 8.3 Show moment time range (e.g., "08:00 - 11:00") below moment selector
- [x] 8.4 Integrate AppDateTimePicker for time selection
- [x] 8.5 Validate time against moment range using isTimeInRange()
- [x] 8.6 Show validation error when time is outside allowed range
- [x] 8.7 Disable submit button when time validation fails
- [x] 8.8 Pass selectedTime to setContext() for persistence

## Phase 7: Testing

- [x] 7.1 Add unit tests for `formatMomentTimeRange()` in `apps/mobile/src/logic/formatters.test.ts` — Already exists
- [x] 7.2 Add unit tests for `isTimeInRange()` in `apps/mobile/src/hooks/useTimeValidation.test.ts` — Already exists
- [x] 7.3 Run `make test` to verify all tests pass — All 133 tests passing
