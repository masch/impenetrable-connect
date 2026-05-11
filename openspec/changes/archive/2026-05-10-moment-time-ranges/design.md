# Design: Moment Time Ranges

## Technical Approach

Extend `ServiceMoment` config with `startTime`, `endTime`, and `timezone` fields. Replace `zzz_service_date: Date` with `zzz_service_at: string` (ISO datetime with timezone). Add validation and display helpers. This enables precise time selection within moment windows while preserving fast filtering via `zzz_time_of_day`.

## Architecture Decisions

### Decision: Store `zzz_service_at` as ISO string, not Date

**Choice**: `zzz_service_at: string` with format `2024-01-15T09:30:00-03:00`
**Alternatives considered**: Store as `Date` with separate `timezone` column, use epoch milliseconds
**Rationale**: ISO strings with offset carry timezone context at rest — no conversion ambiguity. Parsing is deterministic regardless of server config. Avoids the "stored as UTC but displayed in local" anti-pattern.

### Decision: Keep `zzz_time_of_day` for filtering

**Choice**: Retain `zzz_time_of_day: ServiceMoment` alongside `zzz_service_at`
**Alternatives considered**: Derive moment from `zzz_service_at` on every query using date-fns-tz
**Rationale**: `zzz_time_of_day` enables fast index scans without parsing. Deriving would require functions on every WHERE clause. Storage is negligible (single enum column).

### Decision: Extend mobile `SERVICE_MOMENTS` constant, not backend entity

**Choice**: `SERVICE_MOMENTS` in `apps/mobile/src/constants/moments.ts` gains `startTime`, `endTime`, `timezone`
**Alternatives considered**: Fetch from backend API, store in DB
**Rationale**: Time ranges are business constants, not runtime-configured. Hardcoding in the client avoids network round-trips for static data. Consistent with existing pattern where `SERVICE_MOMENTS` is the SSoT for moment config.

### Decision: Timezone type as `string` literal union

**Choice**: Define `Timezone` as `z.string()` with documented IANA identifiers
**Alternatives considered**: Import full tz database as enum
**Rationale**: IANA list is ~600 entries — enum bloat. Runtime string validation against a known set is sufficient. Document that valid values must be IANA identifiers.

## Data Flow

```
User selects moment → time picker (range constrained)
  → Validate: is selected time within moment's startTime/endTime?
    → Valid: construct ISO string with timezone
    → Invalid: show error "Time outside allowed range for {MOMENT}"

Save reservation → zzz_service_at (string) + zzz_time_of_day (enum) stored in DB
  → Confirmation: display moment label + exact time from zzz_service_at
```

## File Changes

| File                                          | Action | Description                                                             |
| --------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| `packages/shared/src/types/common.ts`         | Modify | Add `Timezone` type alias                                               |
| `apps/mobile/src/constants/moments.ts`        | Modify | Add `startTime`, `endTime`, `timezone` to `SERVICE_MOMENTS`             |
| `apps/mobile/src/logic/formatters.ts`         | Modify | Add `formatMomentTimeRange()` helper                                    |
| `apps/mobile/src/logic/formatters.test.ts`    | Modify | Add unit tests for `formatMomentTimeRange()`                            |
| `packages/shared/src/types/reservation.ts`    | Modify | Replace `zzz_service_date: z.date()` with `zzz_service_at: z.string()`  |
| `apps/mobile/src/stores/reservation.store.ts` | Modify | Adapt to `zzz_service_at` (string) instead of `zzz_service_date` (Date) |
| `apps/mobile/src/hooks/`                      | Create | New `useTimeValidation.ts` hook for validation logic                    |

## Interfaces / Contracts

```typescript
// packages/shared/src/types/common.ts
export type Timezone = string; // IANA identifier, e.g. "America/Argentina/Buenos_Aires"

// apps/mobile/src/constants/moments.ts
export const SERVICE_MOMENTS: {
  zzz_id: ServiceMoment;
  icon: string;
  labelKey: string;
  color: string;
  hex: string;
  bgClass: string;
  textClass: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  timezone: Timezone;
}[] = [
  {
    zzz_id: "BREAKFAST",
    icon: "white-balance-sunny",
    startTime: "08:00",
    endTime: "11:00",
    timezone: "America/Argentina/Buenos_Aires",
    // ...
  },
  // LUNCH, SNACK, DINNER similarly
];

// apps/mobile/src/logic/formatters.ts
export const formatMomentTimeRange = (momentConfig: SERVICE_MOMENTS[number]): string =>
  `${momentConfig.startTime} - ${momentConfig.endTime}`;
```

### Validation Hook

```typescript
// apps/mobile/src/hooks/useTimeValidation.ts
export const isTimeInRange = (
  selectedTime: string, // "HH:mm"
  moment: ServiceMoment,
): { valid: boolean; error?: string } => {
  const config = getMomentConfig(moment);
  const inRange = selectedTime >= config.startTime && selectedTime <= config.endTime;
  return inRange
    ? { valid: true }
    : { valid: false, error: `Time outside allowed range for ${moment}` };
};
```

## Testing Strategy

| Layer       | What to Test                               | Approach                                               |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| Unit        | `formatMomentTimeRange()`                  | Test all 4 moments, edge cases (midnight crossing)     |
| Unit        | `isTimeInRange()`                          | Valid time, before range, after range, boundary values |
| Unit        | `SERVICE_MOMENTS` config                   | Validate all 4 have valid HH:mm format                 |
| Integration | Reservation creation with `zzz_service_at` | Mock DB, verify ISO string stored correctly            |
| E2E         | Booking flow                               | Select moment → time picker → confirm → verify display |

## Migration / Rollout

No migration required. Existing `zzz_service_date` is replaced by `zzz_service_at`. The backend does not yet persist real reservations (early-stage), so no historical data exists to migrate. If the change ships before backend is ready, `SERVICE_MOMENTS` can be deployed independently as static UI config.

## Open Questions

- [ ] Should `timezone` be configurable per-venture instead of globally defaulting to Buenos Aires?
- [ ] Do we need a time picker component, or use native `DateTimePicker` with min/max set from moment range?
