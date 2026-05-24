# Proposal: Connect Mobile Orders API

**Change Key**: `connect-mobile-orders-api`

## Intent

Wire mobile app to `/v1/orders` + `/v1/reservations` with correct contracts, auth headers, and 2-step flow. Without this, `USE_MOCKS=false` gives 401s, wrong methods, and bad bodies.

## Scope

### In Scope

| #   | Deliverable                                                                         | Lines |
| --- | ----------------------------------------------------------------------------------- | ----- |
| 1   | `order.service.ts`: add `createOrder()`, cancel `DELETE`→`PATCH`, auth headers      | ~70   |
| 2   | `product.service.ts`: fix `placeOrder` body, key `status`→`zzz_global_status`, auth | ~40   |
| 3   | `api-utils.ts`: `getAuthHeaders()` helper (from `project.service.ts`)               | ~15   |
| 4   | `reservation.store.ts` + `booking.tsx`: 2-step flow in REST mode                    | ~70   |

### Out of Scope

- Backend order service/routes (`orders-endpoints-booking-flow`)
- Auth for other services (catalog, venture, status)
- Order item modification (immutable per backend)
- E2E tests (backend not deployed)

## Capabilities

### New Capabilities

None — tourist behavior already spec'd in `tourist-experience`.

### Modified Capabilities

None — no spec-level behavior changes.

## Approach

1. `getAuthHeaders()` in `api-utils.ts` — reads `accessToken`, returns `{ Authorization: "Bearer …" }`. Pattern from `project.service.ts`.
2. `order.service.ts`: `createOrder()` → `POST /v1/orders`. `cancelOrder` → `PATCH …/status` with cancel body. Auth on all requests.
3. `product.service.ts`: `placeOrder` sends `{ zzz_reservation_id, zzz_catalog_type_id, zzz_items, zzz_notes }`. No reservation fields.
4. REST mode: `POST /reservations` → get UUID → `POST /orders`. If order fails, cancel reservation. Mock mode untouched.

## Dependencies

Backend PR 3 + PR 4 required for REST mode. Mobile merges before — mocks work independently.

## Affected Areas

| File                                          | Lines |
| --------------------------------------------- | ----- |
| `apps/mobile/src/services/order.service.ts`   | ~70   |
| `apps/mobile/src/services/product.service.ts` | ~40   |
| `apps/mobile/src/services/api-utils.ts`       | ~15   |
| `apps/mobile/src/stores/reservation.store.ts` | ~30   |
| `apps/mobile/src/app/tourist/booking.tsx`     | ~40   |

**Total**: ~195 lines — under 400-line budget.

## Risks

| Risk                                     | Like.   | Mitigation                                       |
| ---------------------------------------- | ------- | ------------------------------------------------ |
| Auth gap in other services               | Certain | Fix only orders here. File tracking issue.       |
| 2-step race: reservation OK, order fails | Med     | Rollback: cancel reservation on failure          |
| Body key mismatch (`zzz_` prefix)        | Low     | Use `CreateOrderInputSchema` from `@repo/shared` |
| Backend not merged yet                   | High    | Merge with mocks; REST fails gracefully          |

## Chain Strategy

**Single PR** — ~195 lines, under 400-line budget, tightly coupled domain.

## Rollback Plan

Revert all 5 files. Mock mode (`USE_MOCKS=true`, default) unaffected. Auth helper is additive and harmless.

## Success Criteria

- [ ] All mobile tests pass
- [ ] `cancelOrder` uses `PATCH …/status` with cancel body, not `DELETE`
- [ ] `placeOrder` body matches `CreateOrderInputSchema`
- [ ] Both services inject `Authorization: Bearer` on every request
- [ ] 2-step flow: reservation created before order in REST mode
- [ ] Failed order cancels the reservation
- [ ] Mock mode unchanged
