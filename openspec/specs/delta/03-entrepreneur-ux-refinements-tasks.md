# Tasks: Entrepreneur UX Refinements & Notification Strategy

## Phase 1: Data Model & Backend Fixes

### 1.1 Fix Capacity Logic

- [x] Change mobile store occupation calculation to use `zzz_guest_count`.
- [ ] Change backend occupation calculation to use `SUM(total_guests)` instead of `SUM(quantity)`.
- [x] Verify with tests that capacity is correctly calculated (PASSing).

### 1.2 Add Suggested Time Field

- [ ] Add `suggested_time` (varchar) field to Order schema in `@repo/shared`.
- [ ] Update Order creation validation (Zod) to include optional `suggested_time`.

---

## Phase 2: Mobile UI Refinements

### 2.1 Update Vocabulary (Labels)

- [x] Rename `orders.status.cancelled` to "Cancelado" / "Rejected" in i18n files.
- [x] Rename translation keys from `cancel` to `reject` throughout the codebase.
- [x] Ensure "Rechazado" is used consistently for entrepreneur actions.

### 2.2 Guest Count Selector (Tourist)

- [x] Add `guestCount` state to `cart.store.ts`.
- [x] Implement stepper UI in `OrderSetupScreen` (`tourist/index.tsx`).
- [x] Pass `guestCount` through CatalogService to the final order placement.

### 2.3 Implement "Solicitudes" Screen

- [ ] Replace placeholder in `entrepreneur/request.tsx` with `OFFER_PENDING` list.
- [ ] Add polling logic (every 20s) or refresh control.

### 2.4 Implement Tab Indicators

- [ ] Add badge component to the "Solicitudes" tab icon in `entrepreneur/_layout.tsx`.

### 2.5 Update Agenda Stats

- [x] Update `getOccupationStats` in `agenda.store.ts` to use `zzz_guest_count`.
- [x] Add party size badge to `ReservationCard.tsx`.

### 2.6 Expand Profile Screen

- [ ] Add "Venture Management" section to `profile.tsx` with Pause/Resume toggles.

---

## Phase 3: Notification Foundation

### 3.1 Expo Push Integration (Scaffolding)

- [ ] Configure `expo-notifications` handler in `apps/mobile/src/app/_layout.tsx`.
- [ ] Create service to register push tokens with the backend.

### 3.2 WhatsApp Fallback UI

- [ ] Add "Notify me via WhatsApp" checkbox to `booking.tsx`.
- [ ] Implement phone number input for tourist notifications.
