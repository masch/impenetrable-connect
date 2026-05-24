# Spec: Connect Mobile Orders API

**Change Key**: `connect-mobile-orders-api`

## Purpose

Wire the mobile app to the backend `/v1/orders` and `/v1/reservations` endpoints with correct HTTP methods, request/response contracts, auth headers, and a 2-step booking flow in REST mode.

## Auth Requirement (applies to all REST endpoints)

Every REST request MUST include an `Authorization: Bearer <token>` header. The token is read from `useAuthStore.getState().accessToken`. Missing or invalid tokens result in 401 responses handled by `handleResponse()`.

---

## Deliverable A: API Client Helper

**File**: `apps/mobile/src/services/api-client.ts` (new)

Creates a shared fetch wrapper that centralizes auth injection, base URL prefixing, and error handling.

### Requirement: apiClient

The system SHALL provide an `apiClient` object with `get<T>()`, `post<T>()`, `patch<T>()`, `delete<T>()` methods that:

1. Prepend `env.API_URL` to the path
2. Inject `Authorization: Bearer <token>` from `useAuthStore.getState().accessToken`
3. Set `Content-Type: application/json`
4. Delegate response handling to `handleResponse<T>()` and error mapping to `mapNetworkError()` (both from `api-utils.ts`)

#### Scenario: Successful GET request

- GIVEN a valid access token in the auth store
- WHEN `apiClient.get("/orders")` is called
- THEN a GET request is sent to `{API_URL}/orders` with `Authorization: Bearer <token>`
- AND the response is parsed via `handleResponse<Order[]>`

#### Scenario: Failed request with network error

- GIVEN a network failure
- WHEN any `apiClient` method is called
- THEN the error is mapped via `mapNetworkError()` and thrown

---

## Deliverable B: Order Service REST Fixes

**File**: `apps/mobile/src/services/order.service.ts`

### Requirement: RestOrderService — getOrders with status filter

The system SHALL fetch orders via `GET /v1/orders` with optional `?status=` query parameter. The request MUST include auth headers.

#### Scenario: Fetch all orders

- GIVEN a valid auth token
- WHEN `orderService.getOrders()` is called
- THEN a GET request is sent to `/v1/orders` with `Authorization: Bearer <token>`
- AND the response is an `Order[]`

#### Scenario: Fetch orders filtered by status

- GIVEN a valid auth token
- WHEN `orderService.getOrders("CANCELLED")` is called
- THEN a GET request is sent to `/v1/orders?status=CANCELLED`

### Requirement: RestOrderService — cancelOrder via PATCH

The system SHALL cancel an order via `PATCH /v1/orders/:id` with body `{ status: "CANCELLED", cancel_reason: "BY_TOURIST" }`. The request MUST include auth headers. This replaces the current DELETE method.

#### Scenario: Cancel order successfully

- GIVEN a valid auth token and an existing order ID
- WHEN `orderService.cancelOrder(id)` is called
- THEN a PATCH request is sent to `/v1/orders/{id}` with body `{ status: "CANCELLED", cancel_reason: "BY_TOURIST" }`
- AND the request includes `Authorization: Bearer <token>`

### Requirement: RestOrderService — createOrder (NEW)

The system SHALL create an order via `POST /v1/orders` with a `CreateOrderInput` body. The request MUST include auth headers.

#### Scenario: Create order successfully

- GIVEN a valid auth token and a `CreateOrderInput` payload
- WHEN `orderService.createOrder(input)` is called
- THEN a POST request is sent to `/v1/orders` with the input body
- AND the response is the created `Order`

### Requirement: RestOrderService — updateOrder (NEW)

The system SHALL update an order's metadata via `PATCH /v1/orders/:id` with an `UpdateOrderInput` body. The request MUST include auth headers.

#### Scenario: Update order notes

- GIVEN a valid auth token and an existing order ID
- WHEN `orderService.updateOrder(id, { zzz_notes: "Updated notes" })` is called
- THEN a PATCH request is sent to `/v1/orders/{id}` with the update body

### Requirement: MockOrderService unchanged

The mock implementation MUST remain unchanged. It continues to simulate in-memory state transitions without network calls.

#### Scenario: Mock cancel still uses in-memory state

- GIVEN `USE_MOCKS=true`
- WHEN `orderService.cancelOrder(id)` is called
- THEN the mock updates `zzz_global_status` to `CANCELLED` in memory

---

## Deliverable C: Product Service Refactor

**File**: `apps/mobile/src/services/product.service.ts`

### Requirement: Remove RestProductService.placeOrder

The `RestProductService.placeOrder()` method SHALL be removed. It incorrectly builds orders in-memory and sends incorrect request bodies. The booking flow SHALL use `orderService.createOrder()` instead.

#### Scenario: REST mode does not call placeOrder

- GIVEN `USE_MOCKS=false`
- WHEN the booking screen confirms an order
- THEN `ProductService.placeOrder()` is NOT called
- AND `orderService.createOrder()` IS called instead

### Requirement: Keep MockProductService.placeOrder

The `MockProductService.placeOrder()` method SHALL remain unchanged. Mock mode continues using the existing in-memory implementation.

#### Scenario: Mock mode still calls placeOrder

- GIVEN `USE_MOCKS=true`
- WHEN the booking screen confirms an order
- THEN `ProductService.placeOrder()` is called (unchanged)

### Requirement: Keep existing REST methods

The `RestProductService` MUST keep `getServices()`, `getServiceById()`, `getServicesByCategory()`, `updateOrder()`, `updateOrderStatus()`, and `getOrders()`. These continue to work but SHALL use the new `apiClient` for auth headers.

---

## Deliverable D: Booking Flow 2-Step Integration

**Files**: `apps/mobile/src/stores/cart.store.ts`, `apps/mobile/src/app/tourist/booking.tsx`

### Requirement: 2-step flow in REST mode

When `USE_MOCKS=false`, the booking confirmation flow MUST execute two sequential API calls:

1. `POST /v1/reservations` with `{ zzz_service_at, zzz_time_of_day, zzz_guest_count }` — creates a reservation
2. `POST /v1/orders` with `{ zzz_reservation_id, zzz_catalog_type_id, zzz_items, zzz_notes }` — creates the order linked to that reservation

#### Scenario: Booking flow creates reservation then order

- GIVEN `USE_MOCKS=false` and the user taps "Confirm" on the booking footer
- WHEN the booking is confirmed
- THEN a reservation is created via `POST /v1/reservations`
- AND an order is created via `POST /v1/orders` with the returned reservation UUID
- AND the user is navigated to the orders screen

#### Scenario: Order creation fails — rollback reservation

- GIVEN `USE_MOCKS=false` and a reservation was created successfully
- WHEN the subsequent order creation fails (any error)
- THEN the reservation is cancelled via `PATCH /v1/reservations/{id}` with cancel body
- AND an error is shown to the user
- AND the error is logged via `logger.error()`

### Requirement: Mock mode flow unchanged

When `USE_MOCKS=true`, the booking flow MUST continue using the existing `ProductService.placeOrder()` method.

#### Scenario: Mock mode uses existing flow

- GIVEN `USE_MOCKS=true`
- WHEN the booking is confirmed
- THEN `ProductService.placeOrder()` is called (unchanged)
- AND no network calls are made

---

## Dependency

This spec depends on backend PR 3 and PR 4 of `orders-endpoints-booking-flow` being merged. The `/v1/orders` and `/v1/reservations` endpoints must be deployed and reachable. This change MUST NOT be started until those PRs are merged.

## Scenarios Summary

| Domain                         | Scenarios |
| ------------------------------ | --------- |
| Deliverable A: API Client      | 2         |
| Deliverable B: Order Service   | 6         |
| Deliverable C: Product Service | 3         |
| Deliverable D: Booking Flow    | 3         |
| **Total**                      | **14**    |
