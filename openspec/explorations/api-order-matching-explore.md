# Exploration: API Order Matching Logic

## Current State

Currently, in **MOCK mode** (`USE_MOCKS = true`), when a tourist creates an order, the client-side `MockProductService.placeOrder` immediately:

1. Sets the order status to `OFFER_PENDING`.
2. Pre-assigns the `zzz_current_offer_venture_id` to a mock venture (`MOCK_VENTURE_WITH_ORDERS.id`).

Because the entrepreneur's screen fetches pending orders via `fetchPendingOrders`, which filters orders with `zzz_global_status = 'OFFER_PENDING'` and a matching venture ID, the mock order shows up immediately in their inbox.

However, in **API mode** (`USE_MOCKS = false`), placing an order calls POST `/orders` on the backend, which executes `OrderService.create`. In the database, the order is created with:

1. Status `SEARCHING`.
2. Both `zzz_confirmed_venture_id` and `zzz_current_offer_venture_id` set to `null`.

Because there is no autonomous matching or routing engine currently running or executing in the backend:

- The order remains in the `SEARCHING` state.
- The order is not offered to any venture (both venture ID columns are `null`).
- As a result, the entrepreneur sees an empty pending requests screen in API mode.
- The tourist _can_ see the order in their active orders tab (since their tab filters include `SEARCHING`), but the order can never be accepted or declined.

## Affected Areas

| File                                           | Impact / Responsibility                                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `apps/backend/src/services/order.service.ts`   | Needs to coordinate venture filtering and cascade matching when creating an order or updating status. |
| `apps/backend/src/services/venture.service.ts` | Needs helper methods to query and filter active/open ventures for a catalog type.                     |
| `apps/backend/src/routes/orders.ts`            | May need to trigger matching, or handle errors related to capacity/availability.                      |

## Approaches

### Approach 1: Fully Implement the Complete Cascading Routing Algorithm

Implement the full background job queue / interval timeout processor and complex state logging specified in the master spec.

- **Pros**: 100% compliant with long-term specs; handles rejections, timeouts, and multi-venture cascading.
- **Cons**: Extremely high complexity, requires new database schema tables (`cascade_assignments`), and exceeds the 400-line budget limit. Overkill for the current MVP stage where the frontend does not support complex cascade states yet.

### Approach 2: Lightweight Synchronous Order Routing on Create (Recommended)

Implement a lightweight, synchronous matching logic inside `OrderService.create`. When an order is created:

1. Find all ventures matching the order's `zzz_catalog_type_id`, sorted by `zzz_cascade_order` (ascending).
2. For each venture, apply the capacity and status check:
   - Check if `venture.is_active` is `true`.
   - Check if `venture.is_paused` is `false`.
   - Calculate current occupation of the venture for the reservation's `zzz_service_at` time:
     `current_occupation = SUM(guest_count) of CONFIRMED orders`.
   - Verify `(current_occupation + guest_count) <= venture.zzz_max_capacity`.
3. If a venture is found:
   - Set the order's `zzz_global_status = 'OFFER_PENDING'`.
   - Set `zzz_current_offer_venture_id = venture.id`.
4. If no venture matches (e.g. all paused or full):
   - Set the order's `zzz_global_status = 'EXPIRED'`.
   - Set `zzz_cancel_reason = 'NO_VENTURE_AVAILABLE'`.
5. If the entrepreneur declines, transition the order status to `CANCELLED` (matching the current client-side decline logic).

- **Pros**:
  - Simple, robust, and completely synchronous.
  - Aligns the API mode behavior perfectly with the MOCK mode.
  - Fits within a single, reviewable PR (well under 400 lines).
- **Cons**:
  - No background retries or offline timeouts, but this is acceptable given the current MVP scope.

## Recommendation

Use **Approach 2 (Lightweight Synchronous Order Routing on Create)**. It resolves the gap between API and MOCK modes with minimal complexity, while reusing all existing database columns and ensuring type safety.

## Risks & Gotchas

1. **Opening Hours / Moment checks**: The database seed data must have opening hours and venture configurations aligned with the reservation time, otherwise the order will immediately fail/expire on creation.
2. **Decline Transitions**: Currently, when an entrepreneur declines, the mobile app sends status `CANCELLED`. In the future, this should transition back to `SEARCHING` to trigger a new cascade, but for the MVP, marking as `CANCELLED` is the established pattern.

## Ready for Proposal

**Yes** — We can proceed to create the implementation proposal.
