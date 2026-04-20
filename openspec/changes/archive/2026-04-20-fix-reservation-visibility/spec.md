# Spec: Fix Reservation Visibility Bug

## Problem
When a tourist places an order in mock mode, the order is created with a random `reservation_id` that does not exist in the mock `reservations` collection.
Because `getMockOrders()` filters orders by looking up their associated reservation's `user_id`, these new orders are filtered out and do not appear in the order list.

## Requirements
- When an order is placed in mock mode, a corresponding `Reservation` must be created.
- The `Reservation` must have the correct `user_id` of the logged-in user.
- The `Order` must link to this new `Reservation`.
- `getMockOrders()` must return the newly created order.

## Scenarios
### Scenario 1: New order visibility
**Given** a logged-in tourist
**When** the tourist places an order for "Today" and "Breakfast"
**Then** a new `Reservation` should be added to the mock state
**And** a new `Order` should be added to the mock state linked to that reservation
**And** `getMockOrders()` should include the new order
