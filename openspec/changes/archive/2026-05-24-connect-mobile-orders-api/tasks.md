# Tasks: Connect Mobile Orders API

## Review Workload Forecast

| Field                   | Value                 |
| ----------------------- | --------------------- |
| Estimated changed lines | ~195                  |
| 400-line budget risk    | Low                   |
| Chained PRs recommended | No                    |
| Delivery strategy       | single-pr             |
| Files changed           | 5 (1 new, 4 modified) |

**Decision needed before apply**: No
**Chained PRs recommended**: No
**400-line budget risk**: Low
**Suggested PR strategy**: Single PR — ~195 lines, tightly coupled domain.

---

## Phase 1: API Client + Order Service Fixes

**Dependency**: Backend `orders-endpoints-booking-flow` PR 3 + PR 4 merged

- [x] **T-001** — Create `api-client.ts` with `get`, `post`, `patch`, `delete` methods that inject auth token from `useAuthStore` and use `env.API_URL` as base  
       _Files_: `apps/mobile/src/services/api-client.ts` | _Est_: 40 lines | _Dep_: — | _TDD_: no

- [x] **T-002** — Add `createOrder()` and `updateOrder()` to `OrderServiceInterface`; implement in `RestOrderService` using `apiClient`; fix `cancelOrder` from DELETE to PATCH with cancel body; add `?status=` filter to `getOrders`  
       _Files_: `apps/mobile/src/services/order.service.ts` | _Est_: 55 lines | _Dep_: T-001 | _TDD_: no

---

## Phase 2: Product Service Cleanup + Booking Flow

**Dependency**: T-002

- [x] **T-003** — Remove `RestProductService.placeOrder()`; refactor remaining REST methods to use `apiClient` for auth headers; keep `MockProductService.placeOrder()` unchanged  
       _Files_: `apps/mobile/src/services/product.service.ts` | _Est_: 30 lines | _Dep_: T-001 | _TDD_: no

- [x] **T-004** — Integrate 2-step booking flow in REST mode: `POST /v1/reservations` then `POST /v1/orders` with rollback on failure; mock mode uses existing `ProductService.placeOrder()` unchanged  
       _Files_: `apps/mobile/src/app/tourist/booking.tsx`, `apps/mobile/src/stores/cart.store.ts` | _Est_: 70 lines | _Dep_: T-002 | _TDD_: no

---

## Dependency Graph

```
T-001 → T-002 → T-004
  └→ T-003
```

Parallel: none (all depend on T-001). T-002 blocks T-004. T-003 is independent of T-002.

## Implementation Slices

| Slice | Tasks       | Est Lines | Description                                        |
| ----- | ----------- | --------- | -------------------------------------------------- |
| PR 1  | T-001→T-004 | ~195      | Single PR: API client + order fixes + booking flow |

## Important Notes

- **DO NOT START** until `orders-endpoints-booking-flow` PR 3 and PR 4 are merged into `main`. The `/v1/orders` and `/v1/reservations` endpoints must be deployed.
- If backend is not yet merged, this code can still be written against the spec — REST mode will fail gracefully (401/404) until the endpoints exist.
- Mock mode (`USE_MOCKS=true`, default) is unaffected and continues to work without a backend.
