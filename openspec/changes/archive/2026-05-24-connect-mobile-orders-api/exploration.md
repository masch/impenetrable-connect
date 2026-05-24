# Exploration Report: connect-mobile-orders-api

## 1. Current State

### What was ALREADY implemented (from `orders-endpoints-booking-flow`)

| Component                   | Status  | Details                                                                                                                                                                         |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shared Zod schemas**      | ✅ Done | `CreateOrderInputSchema`, `UpdateOrderInputSchema`, `UpdateOrderStatusInputSchema`, `CreateReservationInputSchema`, `UpdateReservationInputSchema` with full validation + tests |
| **UUID migration**          | ✅ Done | `OrderDbSchema`, `ReservationDbSchema`, `OrderItemSchema` all use `z.string().uuid()`                                                                                           |
| **HTTP status constants**   | ✅ Done | `HTTP_CONFLICT` (409), `HTTP_FORBIDDEN` (403) in `constants/http-status.ts`                                                                                                     |
| **DB schemas**              | ✅ Done | `reservations.ts`, `orders.ts`, `order-items.ts` with enums (`order_status`, `cancel_reason`, `reservation_status`, `service_moment`)                                           |
| **Schema registration**     | ✅ Done | `db/schema/index.ts` + `db/factory.ts` updated with new table imports                                                                                                           |
| **Reservation route file**  | ✅ Done | `routes/reservations.ts` (POST, GET, GET/:id, PATCH/:id) with auth + role guards                                                                                                |
| **Reservation service**     | ✅ Done | `services/reservation.service.ts` with full CRUD + role-scoped queries                                                                                                          |
| **Reservation route tests** | ✅ Done | `routes/reservations.test.ts` (full coverage)                                                                                                                                   |

### What's MISSING from the backend

| Component                        | Status         | Details                                                                                                                                                                                 |
| -------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Order service**                | ❌ Not started | `services/order.service.ts` — needs: status machine, transactional create with price snapshot, role-scoped getAll, update with terminal guard, updateStatus with timestamp side effects |
| **Order route**                  | ❌ Not started | `routes/orders.ts` — needs: POST (TOURIST), GET (scoped), PATCH/:id (scoped), PATCH/:id/status (ENTREPRENEUR/ADMIN)                                                                     |
| **Order route tests**            | ❌ Not started | `routes/orders.test.ts`                                                                                                                                                                 |
| **Order service tests**          | ❌ Not started | `services/order.service.test.ts`                                                                                                                                                        |
| **Mount reservations in app.ts** | ❌ Not started | `reservationsRouter` exists but is never imported/mounted                                                                                                                               |
| **Mount orders in app.ts**       | ❌ Not started | Orders router doesn't exist yet                                                                                                                                                         |

### Mobile — `order.service.ts` (apps/mobile/src/services/order.service.ts)

- **Interface**: `OrderServiceInterface` with `getOrders(status?)` and `cancelOrder(id)` — NO create method
- **Mock**: in-memory state via `getMockOrders()` — works fine
- **REST** (`USE_MOCKS=false`):
  - `getOrders`: `GET ${env.API_URL}/orders` — correct path, **NO auth header**
  - `cancelOrder`: `DELETE ${env.API_URL}/orders/${id}` — **WRONG method** (should be PATCH with status body)
- **Critical issues**: (1) No `createOrder` method, (2) DELETE instead of PATCH for cancel, (3) No auth headers

### Mobile — `product.service.ts` (apps/mobile/src/services/product.service.ts)

- **Interface**: `ProductServiceInterface` with `placeOrder()`, `updateOrder()`, `updateOrderStatus()`, `getOrders()`
- **Mock**: Creates reservation + order in-memory together — works fine
- **REST** (`USE_MOCKS=false`):
  - `placeOrder`: `POST ${env.API_URL}/orders` — sends **WRONG body** (includes `zzz_reservation_id: 0` hardcoded, plus reservation-level fields like `zzz_guest_count`, `zzz_time_of_day`, `zzz_service_at`)
  - `updateOrder`: `PATCH ${env.API_URL}/orders/${id}` — sends `{ zzz_notes }` — correct
  - `updateOrderStatus`: `PATCH ${env.API_URL}/orders/${id}/status` — sends `{ status }` — **NOTE**: key is `status`, not `zzz_global_status`
  - `getOrders`: `GET ${env.API_URL}/orders?userId=X`
  - **No auth headers on any request**

### Mobile — `reservation.store.ts`

- Zustand store wrapping `orderService.getOrders()` and `orderService.cancelOrder()`
- `fetchOrders()` → calls service, splits into `activeOrders`/`historyOrders` by status filter
- `cancelOrder(id)` → calls service, then refetches
- `moveOrders()` → dynamically imports `ProductService.updateOrder()`
- `addOrder()`/`updateOrder()` — manual list manipulation

### Mobile — Screens

**`booking.tsx`**:

- Uses `useReservationStore` for `fetchOrders`, `addOrder`, `updateOrder`, `cancelOrder`
- Uses `useCatalogStore.placeOrder` to confirm orders
- Flow: cart → `placeOrder(date, moment, items, guestCount, time, notes)` → `addOrderToStore(newOrder)` → `clearCart()` → navigate to orders

**`orders.tsx`**:

- Uses `useReservationStore` for `activeOrders`, `historyOrders`, `fetchOrders`, `cancelOrder`
- Groups orders by date → moment → time for display

### Mobile — Auth

- `auth.store.ts` stores `accessToken` in state
- Available via `useAuthStore.getState().accessToken`
- **NEITHER** order.service.ts NOR product.service.ts reads this token
- Backend routes use `authMiddleware` requiring `Authorization: Bearer <token>`

### Mobile — env.ts

```ts
USE_MOCKS: process.env.EXPO_PUBLIC_USE_MOCKS !== "false"; // defaults true
API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/v1";
```

### Shared Types (packages/shared/)

- `CreateOrderInputSchema`: requires `zzz_reservation_id` (UUID), `zzz_catalog_type_id`, `zzz_items[]`, `zzz_notes?`, `zzz_notify_whatsapp?`
- `UpdateOrderInputSchema`: optional `zzz_notes`, `zzz_notify_whatsapp`
- `UpdateOrderStatusInputSchema`: requires `zzz_global_status`, optional `zzz_cancel_reason` (required when CANCELLED)
- `CreateReservationInputSchema`: `zzz_service_at`, `zzz_time_of_day`, `zzz_guest_count`
- `Order` type already has `zzz_reservation?: Reservation` — full aggregate

---

## 2. Key Gap: Booking flow needs 2 steps in production

The **current mock** combines reservation + order creation in one step:

```
mock → createReservation() + createOrder() in same function
```

The **backend contract** expects two separate steps:

1. `POST /v1/reservations` → get reservation UUID
2. `POST /v1/orders` with that reservation UUID

This means the mobile's `booking.tsx` confirm flow needs restructuring when `USE_MOCKS=false`.

---

## 3. What Needs to Change

### Backend (finish `orders-endpoints-booking-flow`)

| File                             | Action                                                          | Est. Lines |
| -------------------------------- | --------------------------------------------------------------- | ---------- |
| `services/order.service.ts`      | NEW — status machine, transactional create, role-scoped queries | ~250       |
| `services/order.service.test.ts` | NEW — unit tests for all methods                                | ~200       |
| `routes/orders.ts`               | NEW — 4 endpoints with auth + error handling                    | ~150       |
| `routes/orders.test.ts`          | NEW — route tests for all endpoints                             | ~200       |
| `app.ts`                         | Mount reservationsRouter + ordersRouter                         | ~6         |

### Mobile (this change: `connect-mobile-orders-api`)

| File                          | Change                                                                                                                                                                                | Est. Lines |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `services/order.service.ts`   | Add `createOrder` to interface. Fix cancel: DELETE→PATCH with cancel body. Add auth headers.                                                                                          | ~60        |
| `services/product.service.ts` | Fix `placeOrder` REST body to match `CreateOrderInputSchema` (remove reservation fields). Add auth headers. Change `updateOrderStatus` body key from `status` to `zzz_global_status`. | ~40        |
| `stores/reservation.store.ts` | Possibly add reservation creation step before order creation in production mode                                                                                                       | ~30        |
| `app/tourist/booking.tsx`     | Possibly adjust confirm flow for 2-step (reservation→order) in production                                                                                                             | ~30        |

---

## 4. Auth Token Plumbing

Both `order.service.ts` and `product.service.ts` need a shared auth helper. Options:

| Approach                                | Pros                       | Cons                            |
| --------------------------------------- | -------------------------- | ------------------------------- |
| A. Read from auth store in each service | Simple, no new abstraction | Tight coupling to Zustand store |
| B. Create an `api-client.ts` wrapper    | Centralized, consistent    | More code, new file             |
| C. Pass token as parameter              | Explicit dependency        | Changes all method signatures   |

**Recommendation**: Option A for speed — both services already import from stores (e.g., `auth-state.ts` in mock). Add a `getAuthHeaders()` helper function.

---

## 5. Dependency Order

```
Backend Finish (orders-endpoints-booking-flow):
  order.service.ts → order routes → mount in app.ts

Mobile Connect (this change):
  api-auth-helper → order.service.ts → product.service.ts → screens
```

The mobile change is technically independent of the backend (mocks work, REST won't until backend merges).

---

## 6. Files Affected (Complete List)

### Backend (NEW work)

- `apps/backend/src/services/order.service.ts` — NEW
- `apps/backend/src/services/order.service.test.ts` — NEW
- `apps/backend/src/routes/orders.ts` — NEW
- `apps/backend/src/routes/orders.test.ts` — NEW
- `apps/backend/src/app.ts` — MODIFY (add 2 route mounts + imports)

### Mobile (this change)

- `apps/mobile/src/services/order.service.ts` — MODIFY
- `apps/mobile/src/services/product.service.ts` — MODIFY
- `apps/mobile/src/stores/reservation.store.ts` — MODIFY (possibly)
- `apps/mobile/src/app/tourist/booking.tsx` — MODIFY (possibly)
- `apps/mobile/src/services/api-utils.ts` — MODIFY (add auth header helper)

### Not affected

- `packages/shared/` — already done
- `apps/mobile/src/mocks/` — no change needed (mock already works)
- `apps/mobile/src/config/env.ts` — no change needed
- `apps/mobile/src/stores/cart.store.ts` — no change needed
- `apps/mobile/src/stores/product.store.ts` — no change needed
