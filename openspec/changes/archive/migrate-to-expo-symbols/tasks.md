# Tasks: Migrate from @expo/vector-icons to expo-symbols

## Review Workload Forecast

| Field                   | Value           |
| ----------------------- | --------------- |
| Estimated changed lines | ~600-800        |
| 400-line budget risk    | Medium          |
| Chained PRs recommended | Yes             |
| Suggested split         | 3 chained PRs   |
| Delivery strategy       | ask-on-risk     |
| Chain strategy          | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal                                | Likely PR | Notes                                    |
| ---- | ----------------------------------- | --------- | ---------------------------------------- |
| 1    | Icon component + Button update      | PR 1      | Foundation; all screens depend on Button |
| 2    | Core components + cards             | PR 2      | 10 files, independent from PR1           |
| 3    | Screens + layouts + tests + cleanup | PR 3      | Final migration + verification           |

## Phase 1: Infrastructure (PR 1)

- [x] 1.1 Create `apps/mobile/src/components/Icon.tsx` — centralized Symbol wrapper with mapping table
- [x] 1.2 Write unit tests for Icon component (iOS Symbol rendering, Android fallback, mapping table)
- [x] 1.3 Update `apps/mobile/src/components/Button.tsx` — replace MaterialCommunityIcons with Icon component

**Verification**: `make test` passes for Icon and Button components ✅

## Phase 2: Core Components (PR 2)

- [ ] 2.1 Update `apps/mobile/src/components/AppAlert.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 2.2 Update `apps/mobile/src/components/DatePicker.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 2.3 Update `apps/mobile/src/components/FormSwitch.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 2.4 Update `apps/mobile/src/components/VentureStatusSection.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 2.5 Update `apps/mobile/src/components/VentureCapacitySection.tsx` — replace MaterialCommunityIcons with Icon

**Verification**: `make test` passes; component snapshots valid

- [ ] 2.6 Update `apps/mobile/src/components/catalog/ServiceCard.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 2.7 Update `apps/mobile/src/components/catalog/ReservationModal.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 2.8 Update `apps/mobile/src/components/entrepreneur/ReservationCard.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 2.9 Update `apps/mobile/src/components/Profile/ProfileView.tsx` — replace MaterialCommunityIcons with Icon

**Verification**: `make test` passes for catalog and profile components

## Phase 3: Screens & Layouts (PR 3)

- [ ] 3.1 Update `apps/mobile/src/app/tourist/_layout.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 3.2 Update `apps/mobile/src/app/entrepreneur/_layout.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 3.3 Update `apps/mobile/src/app/admin/_layout.tsx` — replace MaterialCommunityIcons with Icon

- [ ] 3.4 Update `apps/mobile/src/app/tourist/index.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 3.5 Update `apps/mobile/src/app/tourist/orders.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 3.6 Update `apps/mobile/src/app/tourist/booking.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 3.7 Update `apps/mobile/src/app/entrepreneur/agenda.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 3.8 Update `apps/mobile/src/app/entrepreneur/request.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 3.9 Update `apps/mobile/src/app/index.tsx` — replace MaterialCommunityIcons with Icon
- [ ] 3.10 Update `apps/mobile/src/app/system-status.tsx` — replace MaterialCommunityIcons with Icon

**Verification**: All screens render correctly; no console errors

## Phase 4: Test Mocks & Cleanup

- [ ] 4.1 Update `apps/mobile/jest.setup.ts` — mock expo-symbols instead of @expo/vector-icons
- [ ] 4.2 Update `apps/mobile/src/app/tourist/__tests__/booking.test.tsx` — update mock
- [ ] 4.3 Update `apps/mobile/src/app/admin/project/__tests__/id.test.tsx` — update mock

- [ ] 4.4 Remove `@expo/vector-icons` from `apps/mobile/package.json` dependencies
- [ ] 4.5 Run `make test` — confirm all tests pass
- [ ] 4.6 Verify `grep -r "@expo/vector-icons" apps/mobile/src/` returns zero matches

**Verification**: `make test` passes with no deprecation warnings

## Implementation Order

1. **PR 1 (Foundation)**: Create Icon component → update Button → tests pass
2. **PR 2 (Components)**: Update 9 component files → verify snapshots
3. **PR 3 (Final)**: Update 10 screen files + test mocks + package.json → full verification

Each PR is independently verifiable and builds on the previous.
