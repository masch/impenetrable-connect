# Design: Fix Reservation Visibility Bug

## Approach
We need to ensure that the mock state maintains referential integrity between Orders and Reservations.

### Changes

#### 1. `apps/mobile/src/mocks/orders.ts`
- Add `addMockReservation(reservation: Omit<Reservation, "id">)` function.
- This function will:
  - Generate a new ID.
  - Push the reservation to `ordersState.reservations`.
  - Return the new reservation.

#### 2. `apps/mobile/src/services/catalog.service.ts`
- Update `placeOrder` to:
  - Call `addMockReservation` with the `date`, `moment`, and `user_id`.
  - Use the returned reservation's ID for the new order's `reservation_id`.
  - Call `addMockOrder` as before.

## Architecture Decisions
- **ADR-001: Mock State Integrity**: Mock services should simulate database behavior by maintaining linked entities in their internal state. This ensures that filtering logic (like `getMockOrders`) works correctly during development.

## Implementation Plan
1. Create a failing test in `apps/mobile/src/services/__tests__/catalog.service.test.ts`.
2. Update `apps/mobile/src/mocks/orders.ts` to include `addMockReservation`.
3. Update `apps/mobile/src/services/catalog.service.ts` to use `addMockReservation`.
4. Verify the test passes.
