# Tasks: React-Doctor 41 Issues - Destructure Method & Size Axes Fix

## Review Workload Forecast

| Field                        | Value     |
| ---------------------------- | --------- |
| Estimated changed lines      | ~100-150  |
| 400-line budget risk         | Low       |
| Chained PRs recommended      | No        |
| Delivery strategy            | single-pr |
| Decision needed before apply | No        |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

## Phase 1: Low-Risk Destructure Fixes (auth + admin)

- [x] 1.1 Fix destructure method in `apps/mobile/src/app/auth/login.tsx` (4 instances: replace ×2, back ×2)
- [x] 1.2 Fix destructure method in `apps/mobile/src/app/admin/project/[id].tsx` (2 instances: replace, back)

## Phase 2: Low/Medium Risk (small tourist + components)

- [x] 2.1 Fix destructure method in `apps/mobile/src/app/tourist/login.tsx` (1 instance: replace)
- [x] 2.2 Fix destructure method in `apps/mobile/src/app/admin/project/index.tsx` (1 instance: push)
- [x] 2.3 Fix redundant size axes in `apps/mobile/src/components/catalog/ReservationModal.tsx` (3 instances)
- [x] 2.4 Fix redundant size axes in `apps/mobile/src/components/VentureStatusSection.tsx` (1 instance)

## Phase 3: Medium Risk (medium files)

- [x] 3.1 Fix destructure method in `apps/mobile/src/app/tourist/orders.tsx` (1 instance: replace)
- [x] 3.2 Fix destructure method + redundant size axes in `apps/mobile/src/app/tourist/index.tsx` (2 destructure + 3 size)
- [x] 3.3 Fix redundant size axes in `apps/mobile/src/app/entrepreneur/request.tsx` (2 instances)

## Phase 4: Higher Risk (largest file)

- [x] 4.1 Fix destructure method + redundant size axes in `apps/mobile/src/app/tourist/booking.tsx` (6 destructure + 2 size)

## Phase 5: Remaining Size-Axis Component Fixes

- [x] 5.1 Fix redundant size axes in `apps/mobile/src/components/VentureCapacitySection.tsx` (3 instances)
- [x] 5.2 Fix redundant size axes in `apps/mobile/src/components/DatePicker.tsx` (2 instances)
- [x] 5.3 Fix redundant size axes in `apps/mobile/src/components/Profile/ProfileView.tsx` (1 instance)
- [x] 5.4 Fix redundant size axes in `apps/mobile/src/components/AppAlert.tsx` (1 instance)
- [x] 5.5 Fix redundant size axes in `apps/mobile/src/app/index.tsx` + `apps/mobile/src/app/system-status.tsx` (3 instances total)

## Phase 6: Verification

- [ ] 6.1 Run `npx react-doctor` to verify 0 destructure + 0 size issues remain
- [ ] 6.2 Run `make test` to verify all tests pass
- [ ] 6.3 Verify build succeeds (optional: `npx expo export`)
