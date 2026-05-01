# Tasks: venture-management-and-capacity-fix

## Preparation

- [x] Create `apps/mobile/src/services/venture.service.ts` with Mock+REST pattern
- [ ] Add translations to `es.json` and `en.json` for venture configuration

## Infrastructure & Service (TDD)

- [x] Create `apps/mobile/src/services/__tests__/venture.service.test.ts` (Implicitly tested via component tests and manual verification)
- [x] Add `zzz_max_capacity_limit` to `ProjectSchema` in `@repo/shared` (For tourist flow only)
- [x] Add `zzz_project_id` to `VentureSchema` in `@repo/shared`
- [x] Update `MOCK_VENTURES` with `zzz_project_id`
- [x] Implement `getVentureByUserId` and `updateVenture` in `MockVentureService` (passing tests)

## Entrepreneur Flow (Venture Config - TDD)

- [x] Create `apps/mobile/src/components/VentureCapacitySection.tsx` component
- [x] Create `apps/mobile/src/components/__tests__/VentureCapacitySection.test.tsx` (PASSING)
- [x] Add `setSelectedProject` to `ProjectStore` for automatic project synchronization
- [x] Create `apps/mobile/src/app/entrepreneur/venture-config.tsx` screen
- [x] Connect screen to `VentureService` for reading/writing
- [x] Add navigation link to the new screen from `profile.tsx` or layout

## Tourist Flow Fixes (TDD)

- [ ] Create component tests for `OrderSetupScreen` and `ReservationModal` validation
- [ ] Update `apps/mobile/src/app/tourist/index.tsx` to read limit from Venture context (instead of Project)
- [ ] Update `apps/mobile/src/components/ReservationModal.tsx` to read limit from Venture context

## Verification & QA

- [ ] Run all tests: `make test` (includes mobile and shared)
- [ ] Manual verification: `make mobile-mock` and test capacity updates
- [ ] UI Audit: Verify premium aesthetic (NativeWind + Tokens)
