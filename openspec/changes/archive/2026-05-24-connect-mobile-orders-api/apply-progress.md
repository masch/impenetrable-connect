# Apply Progress — connect-mobile-orders-api

## Summary

All 4 tasks implemented and verified with strict TDD. 48/48 tests passing across all test suites.

## Files Changed

| File                                          | Action      | What Was Done                                                                                                                                                                  |
| --------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/mobile/src/services/api-client.ts`      | **Created** | Shared HTTP client with `get`, `post`, `patch`, `delete` methods that inject auth token and base URL                                                                           |
| `apps/mobile/src/services/order.service.ts`   | Modified    | Added `createOrder`/`updateOrder` to interface; refactored REST methods to use `apiClient`; fixed `cancelOrder` from DELETE to PATCH with cancel body; added `?status=` filter |
| `apps/mobile/src/services/product.service.ts` | Modified    | Removed `RestProductService.placeOrder()` (now throws); refactored all REST methods to use `apiClient` instead of raw `fetch`                                                  |
| `apps/mobile/src/app/tourist/booking.tsx`     | Modified    | Added 2-step booking flow in REST mode: POST reservation → POST order with rollback on failure; mock mode uses existing `ProductService.placeOrder()` unchanged                |

## Test Files Created

| File                                                         | What It Tests                                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `apps/mobile/src/services/__tests__/api-client.test.ts`      | `apiClient` GET/POST/PATCH/DELETE with auth, URL, error mapping                         |
| `apps/mobile/src/services/__tests__/order.service.test.ts`   | `RestOrderService` calls to `apiClient`, status filter, cancel via PATCH, create/update |
| `apps/mobile/src/services/__tests__/product.service.test.ts` | All `RestProductService` methods use `apiClient`; `placeOrder` throws in REST mode      |
| `apps/mobile/src/__tests__/booking-flow-rest.test.tsx`       | REST mode 2-step flow: reservation → order; rollback on order failure                   |

## Deviations from Design

- `cart.store.ts` was not modified. The task listed it but all required logic lives in `booking.tsx`'s confirm handler, which already has access to all cart state through selectors. No changes were needed.
- `RestProductService.placeOrder()` was replaced with a throwing function (not removed from the interface) to keep TypeScript interface compliance while preventing accidental use.

## TDD Cycle Evidence

| Task  | Test File                    | Layer       | Safety Net | RED            | GREEN       | TRIANGULATE          | REFACTOR |
| ----- | ---------------------------- | ----------- | ---------- | -------------- | ----------- | -------------------- | -------- |
| T-001 | `api-client.test.ts`         | Unit        | N/A (new)  | ✅ Import fail | ✅ 6/6 pass | ✅ 6 cases           | ✅ Clean |
| T-002 | `order.service.test.ts`      | Unit        | ✅ 27/27   | ✅ 5/5 fail    | ✅ 5/5 pass | ➖ Single per method | ✅ Clean |
| T-003 | `product.service.test.ts`    | Unit        | ✅ 27/27   | ✅ 8/8 fail    | ✅ 8/8 pass | ➖ Single per method | ✅ Clean |
| T-004 | `booking-flow-rest.test.tsx` | Integration | ✅ 27/27   | ✅ 2/2 fail    | ✅ 2/2 pass | ➖ 2 cases           | ✅ Clean |

## Test Summary

- **Total tests written**: 21
- **Total tests passing**: 48 (21 new + 27 pre-existing)
- **Layers used**: Unit (19), Integration (2)
- **Pure functions created**: 1 (`request` in api-client.ts)

## Issues Found

None. All implementation matches the spec.
