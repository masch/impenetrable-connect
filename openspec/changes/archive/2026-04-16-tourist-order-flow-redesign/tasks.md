# Tasks: Tourist Order Flow Redesign

## Phase 1: Foundation & State

- [x] 1.1 Create `apps/mobile/src/stores/order-context.store.ts` with state for `selectedDate`, `selectedMoment`, `guestCount` and `isValid()` getter.
- [x] 1.2 Add i18n keys to `apps/mobile/src/i18n/locales/es.json` for setup title, date options, moments, and context headers.
- [x] 1.3 Add i18n keys to `apps/mobile/src/i18n/locales/en.json` (English equivalents).

## Phase 2: Screen Implementation

- [x] 2.1 Refactor `apps/mobile/src/app/tourist/index.tsx` to implement `OrderSetupScreen` using `DatePicker` and Moment grid selection.
- [x] 2.2 Update `apps/mobile/src/app/tourist/catalog.tsx` to include `useOrderContextStore` check and redirect to `/tourist` if invalid.
- [x] 2.3 Implement Context Header in `apps/mobile/src/app/tourist/catalog.tsx` to display currently active selection.
- [x] 2.4 Update `apps/mobile/src/app/index.tsx` to redirect Tourist login to `/tourist` instead of `/tourist/catalog`.

## Phase 3: Component Refactoring

- [x] 3.1 Modify `apps/mobile/src/components/ReservationModal.tsx` to consume Date and Moment from `useOrderContextStore`.
- [x] 3.2 Remove internal state and selection UI for Date and Moment from `apps/mobile/src/components/ReservationModal.tsx`.
- [x] 3.3 Ensure the "Confirm" action in `ReservationModal` correctly spreads context data into the reservation payload.

## Phase 4: UI/UX Refinement & Standards

- [x] 4.1 Redesign `catalog.tsx` footer into a unified single-row layout with interactive total panel.
- [x] 4.2 Upgrade `ServiceCard.tsx` with premium aesthetics (rounded-3xl, translucent badges).
- [x] 4.3 Replace all hardcoded hex colors with `COLORS` tokens across all affected files (GGA compliance).
- [x] 4.4 Enhance `Button.tsx` to support flexible layouts (optional title, children, icon-only).

## Phase 5: Testing & Verification

- [x] 5.1 Run `make gga` to verify architectural compliance (PASSED).
- [x] 5.2 Validate responsive behavior of the condensed footer across small/large viewports.
- [x] 5.3 Verify pluralization logic for "X items" in the footer summary.
