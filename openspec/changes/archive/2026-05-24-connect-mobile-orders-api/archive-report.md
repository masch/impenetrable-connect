# Archive Report: connect-mobile-orders-api

**Archived**: 2026-05-24
**Change Key**: `connect-mobile-orders-api`
**PR**: <!-- TBD: orchestrator will link PR -->

---

## Implementation Summary

Wired the mobile app to the backend `/v1/orders` and `/v1/reservations` endpoints with correct HTTP methods, request/response contracts, auth headers, and a 2-step booking flow in REST mode.

### Tasks Completed

| Task      | Description                                                                                                                                                                                                                   | Status |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| **T-001** | Created `api-client.ts` — shared HTTP client with `get`, `post`, `patch`, `delete` methods that inject `Authorization: Bearer` token from `useAuthStore` and use `env.API_URL` as base                                        | ✅     |
| **T-002** | Added `createOrder()` and `updateOrder()` to `OrderServiceInterface`; implemented in `RestOrderService` using `apiClient`; fixed `cancelOrder` from DELETE to PATCH with cancel body; added `?status=` filter to `getOrders`  | ✅     |
| **T-003** | Removed `RestProductService.placeOrder()` (replaced with throwing function to keep TS interface); refactored all remaining REST methods to use `apiClient` for auth headers; kept `MockProductService.placeOrder()` unchanged | ✅     |
| **T-004** | Integrated 2-step booking flow in REST mode: `POST /v1/reservations` → `POST /v1/orders` with rollback on order failure (cancels reservation); mock mode uses existing `ProductService.placeOrder()` unchanged                | ✅     |

### Additional Work in Same Session

- Added `isMomentExpired` in `constants/moments.ts`
- Added `isTimeInPast` in `useTimeValidation.ts`
- Fixed pre-existing typecheck, lint, and gga violations across the codebase

---

## Files Changed

| File                                          | Action      | Details                                                                                                     |
| --------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| `apps/mobile/src/services/api-client.ts`      | **Created** | Shared HTTP client with auth injection, base URL prefixing, and error handling                              |
| `apps/mobile/src/services/order.service.ts`   | Modified    | Added `createOrder`/`updateOrder`; refactored to `apiClient`; `cancelOrder` DELETE→PATCH; `?status=` filter |
| `apps/mobile/src/services/product.service.ts` | Modified    | Removed `RestProductService.placeOrder`; refactored all REST methods to `apiClient`                         |
| `apps/mobile/src/app/tourist/booking.tsx`     | Modified    | 2-step booking flow (reservation→order) with rollback in REST mode                                          |

### Test Files Created

| File                                                         | What It Tests                                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `apps/mobile/src/services/__tests__/api-client.test.ts`      | `apiClient` GET/POST/PATCH/DELETE with auth, URL, error mapping                         |
| `apps/mobile/src/services/__tests__/order.service.test.ts`   | `RestOrderService` calls to `apiClient`, status filter, cancel via PATCH, create/update |
| `apps/mobile/src/services/__tests__/product.service.test.ts` | All `RestProductService` methods use `apiClient`; `placeOrder` throws in REST mode      |
| `apps/mobile/src/__tests__/booking-flow-rest.test.tsx`       | REST mode 2-step flow: reservation→order; rollback on order failure                     |

---

## Test Results

| Metric                                      | Value                       |
| ------------------------------------------- | --------------------------- |
| Total tests passing                         | 531                         |
| New tests written                           | 21 (19 unit, 2 integration) |
| Pre-existing tests preserved                | 27                          |
| `make check` (format, typecheck, lint, gga) | ✅ Passes                   |

---

## Deviations from Design

- `cart.store.ts` was NOT modified (listed in task scope but not needed — all required logic lives in `booking.tsx`'s confirm handler via selectors)
- `RestProductService.placeOrder()` was replaced with a throwing function rather than removed from the interface, to maintain TypeScript interface compliance while preventing accidental use

---

## Archive Contents

| #   | Artifact            | Description                                               |
| --- | ------------------- | --------------------------------------------------------- |
| 1   | `proposal.md`       | Original change proposal with intent, scope, and approach |
| 2   | `spec.md`           | Standalone spec (no `specs/` subdirectory with deltas)    |
| 3   | `exploration.md`    | Exploration artifact analyzing current state and gaps     |
| 4   | `tasks.md`          | Task breakdown — all 4 tasks marked complete              |
| 5   | `apply-progress.md` | Implementation record with TDD cycle evidence             |
| 6   | `archive-report.md` | This file — archive summary                               |

---

## Verification

- [x] All 4 tasks verified complete
- [x] 531 tests passing
- [x] `make check` passes (format, typecheck, lint, gga)
- [x] Change folder moved to archive
- [x] Active changes path removed
