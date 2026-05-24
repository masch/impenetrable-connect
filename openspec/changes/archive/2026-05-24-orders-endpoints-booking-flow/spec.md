# Spec: Orders Endpoints (Booking Flow)

**Change Key**: `orders-endpoints-booking-flow`

## Purpose

Define the request/response contracts, validation rules, business logic, and scenario coverage for 8 booking-flow endpoints: 4 for reservations (`POST`, `GET`, `GET/:id`, `PATCH/:id`) and 4 for orders (`POST`, `GET`, `PATCH/:id`, `PATCH/:id/status`). This spec also defines the order status machine, role-based visibility, transaction guarantees, and error contracts.

## Existing Schema Updates

Before adding new DTOs, the existing shared Zod schemas MUST be updated to align with the UUID PK decision:

### OrderDbSchema (`packages/shared/src/types/order.ts`)

- `zzz_id: z.number().int().positive()` → `z.string().uuid()`
- `zzz_reservation_id: z.number().int().positive()` → `z.string().uuid()`
- Remove `zzz_created_at: z.date()` — audit columns cover creation time; domain-specific timestamps (`zzz_confirmed_at`, `zzz_completed_at`, `zzz_cancelled_at`) remain

### ReservationDbSchema (`packages/shared/src/types/reservation.ts`)

- `zzz_id: z.number().int().positive()` → `z.string().uuid()`
- Keep `zzz_created_at`, `zzz_updated_at` — align with audit column convention

### OrderItemSchema (`packages/shared/src/types/order-item.ts`)

- `zzz_id: z.number().int().positive()` → `z.string().uuid()`
- `zzz_order_id: z.number().int().positive()` → `z.string().uuid()`

## New Shared DTOs

### `CreateReservationInputSchema` (add to `reservation.ts`)

```ts
export const CreateReservationInputSchema = z.object({
  zzz_service_at: z.string().datetime({ message: "ISO 8601 datetime with timezone required" }),
  zzz_time_of_day: ServiceMomentSchema,
  zzz_guest_count: z.number().int().positive("Guest count must be positive").default(1),
});
export type CreateReservationInput = z.infer<typeof CreateReservationInputSchema>;
```

### `UpdateReservationInputSchema` (add to `reservation.ts`)

```ts
export const UpdateReservationInputSchema = z
  .object({
    zzz_service_at: z.string().datetime().optional(),
    zzz_time_of_day: ServiceMomentSchema.optional(),
    zzz_guest_count: z.number().int().positive().optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdateReservationInput = z.infer<typeof UpdateReservationInputSchema>;
```

### `CreateOrderInputSchema` (add to `order.ts`)

```ts
const OrderItemInputSchema = z.object({
  zzz_catalog_item_id: z.number().int().positive("Catalog item ID must be a positive integer"),
  zzz_quantity: z.number().int().positive("Quantity must be positive"),
});

export const CreateOrderInputSchema = z.object({
  zzz_reservation_id: z.string().uuid("Reservation ID must be a valid UUID"),
  zzz_catalog_type_id: z.number().int().positive("Catalog type ID must be positive"),
  zzz_notes: z.string().max(1000, "Notes must be under 1000 characters").optional(),
  zzz_notify_whatsapp: z.boolean().optional().default(false),
  zzz_items: z
    .array(OrderItemInputSchema)
    .min(1, "At least one item is required")
    .max(50, "Maximum 50 items per order"),
});
export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
```

### `UpdateOrderInputSchema` (add to `order.ts`)

```ts
export const UpdateOrderInputSchema = z
  .object({
    zzz_notes: z.string().max(1000).optional(),
    zzz_notify_whatsapp: z.boolean().optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdateOrderInput = z.infer<typeof UpdateOrderInputSchema>;
```

### `UpdateOrderStatusInputSchema` (add to `order.ts`)

```ts
export const UpdateOrderStatusInputSchema = z
  .object({
    zzz_global_status: OrderStatusSchema,
    zzz_cancel_reason: CancelReasonSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.zzz_global_status === "CANCELLED" && !data.zzz_cancel_reason) {
        return false;
      }
      return true;
    },
    {
      message: "zzz_cancel_reason is required when status is CANCELLED",
      path: ["zzz_cancel_reason"],
    },
  )
  .refine(
    (data) => {
      if (data.zzz_global_status !== "CANCELLED" && data.zzz_cancel_reason) {
        return false;
      }
      return true;
    },
    {
      message: "zzz_cancel_reason is only allowed when status is CANCELLED",
      path: ["zzz_cancel_reason"],
    },
  );
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusInputSchema>;
```

---

## 1. POST /v1/reservations — Create Reservation

### Request

- **Method**: POST
- **Path**: `/v1/reservations`
- **Body**: `CreateReservationInputSchema`

### Response

| Status | Body                                                  | Description                      |
| ------ | ----------------------------------------------------- | -------------------------------- |
| 201    | `ReservationDbSchema`                                 | Reservation created successfully |
| 400    | `{ error: "Validation failed", details: ZodFlatten }` | Invalid input                    |
| 401    | `{ message: "errors.auth.unauthorized" }`             | No auth token                    |
| 500    | `{ error: "Internal Server Error" }`                  | DB or unexpected failure         |

### Auth

- JWT required (authMiddleware)
- Role guard: `[TOURIST]` — only tourists can create reservations
- `zzz_user_id` set from `jwtPayload.sub` (never from request body)

### Business Rules

1. `zzz_service_at` MUST be a future datetime (rejected if in the past)
2. `zzz_guest_count` MUST be ≥ 1 and ≤ 99
3. `zzz_time_of_day` MUST match one of `ServiceMomentSchema` ("BREAKFAST", "LUNCH", "SNACK", "DINNER")
4. Initial status is always `CREATED` (set by DB default)

### Edge Cases

| Scenario               | Behavior                                                        |
| ---------------------- | --------------------------------------------------------------- |
| Past datetime          | Reject with 400, detail: `zzz_service_at must be in the future` |
| Guest count = 0        | Reject 400 — positive() catches it                              |
| Guest count = 999      | Accept (≤ 99 rule TODO: is this configured? Decision to make)   |
| Invalid UUID token sub | 401 — JWT verify fails before handler                           |

---

## 2. GET /v1/reservations — List Reservations

### Request

- **Method**: GET
- **Path**: `/v1/reservations`
- **Query params**:

| Param    | Type                | Required | Default | Description                  |
| -------- | ------------------- | -------- | ------- | ---------------------------- |
| `status` | `ReservationStatus` | No       | —       | Filter by reservation status |
| `limit`  | `number`            | No       | 20      | Max results (≤ 100)          |
| `offset` | `number`            | No       | 0       | Pagination offset            |

### Response

| Status | Body                                      | Description           |
| ------ | ----------------------------------------- | --------------------- |
| 200    | `ReservationDbSchema[]`                   | Array of reservations |
| 401    | `{ message: "errors.auth.unauthorized" }` | No auth token         |
| 500    | `{ error: "Internal Server Error" }`      | DB failure            |

### Auth

- JWT required
- Role guard: None (any authenticated user)
- Data scoping:
  - **TOURIST**: WHERE `reservations.zzz_user_id = payload.sub`
  - **ENTREPRENEUR**: WHERE reservation has at least one order linked to a venture the user belongs to (JOIN orders ON reservation_id, JOIN venture_members ON venture_id)
  - **ADMIN**: No filter — all reservations

### Business Rules

1. Results ordered by `zzz_created_at DESC` (most recent first)
2. Default limit 20, max 100
3. Empty list returns `[]` (not null)

### Edge Cases

| Scenario                      | Behavior                      |
| ----------------------------- | ----------------------------- |
| Page beyond data              | Returns `[]`                  |
| Status filter with no matches | Returns `[]`                  |
| limit=150                     | Clamp to 100                  |
| offset=100000                 | Returns `[]` (no rows beyond) |

---

## 3. GET /v1/reservations/:id — Get Single Reservation

### Request

- **Method**: GET
- **Path**: `/v1/reservations/:id`
- **Param**: `id` (UUID)

### Response

| Status | Body                                          | Description                   |
| ------ | --------------------------------------------- | ----------------------------- |
| 200    | `ReservationSchema` (includes `zzz_orders[]`) | Full reservation with orders  |
| 401    | `{ message: "errors.auth.unauthorized" }`     | No auth token                 |
| 403    | `{ message: "errors.auth.forbidden" }`        | Wrong role / not own resource |
| 404    | `{ error: "Not Found" }`                      | Reservation does not exist    |
| 500    | `{ error: "Internal Server Error" }`          | DB failure                    |

### Auth

- JWT required
- Role guard: None (any authenticated user)
- Data scoping:
  - **TOURIST**: `reservation.zzz_user_id` MUST match `payload.sub` (403 if mismatch)
  - **ENTREPRENEUR**: Reservation MUST have at least one order linked to the user's ventures (403 if no link)
  - **ADMIN**: Always allowed

### Business Rules

1. Returns the full reservation aggregate including `zzz_orders[]` (nested orders)
2. If the UUID param is malformed, return 400

### Edge Cases

| Scenario                                | Behavior                          |
| --------------------------------------- | --------------------------------- |
| Non-existent UUID                       | 404                               |
| Malformed UUID                          | 400                               |
| Tourist accessing another's reservation | 403                               |
| Reservation with 0 orders               | Returns `{ ..., zzz_orders: [] }` |

---

## 4. PATCH /v1/reservations/:id — Update Reservation Metadata

### Request

- **Method**: PATCH
- **Path**: `/v1/reservations/:id`
- **Body**: `UpdateReservationInputSchema`

### Response

| Status | Body                                                  | Description                   |
| ------ | ----------------------------------------------------- | ----------------------------- |
| 200    | `ReservationDbSchema`                                 | Updated reservation           |
| 400    | `{ error: "Validation failed", details: ZodFlatten }` | Invalid input                 |
| 401    | `{ message: "errors.auth.unauthorized" }`             | No auth token                 |
| 403    | `{ message: "errors.auth.forbidden" }`                | Wrong role / not own resource |
| 404    | `{ error: "Not Found" }`                              | Reservation does not exist    |
| 500    | `{ error: "Internal Server Error" }`                  | DB failure                    |

### Auth

- JWT required
- Role guard: None (any authenticated user)
- Data scoping:
  - **TOURIST**: `reservation.zzz_user_id` MUST match `payload.sub`
  - **ENTREPRENEUR**: Reservation MUST link to user's ventures
  - **ADMIN**: Always allowed

### Business Rules

1. Only metadata fields can be updated: `zzz_service_at`, `zzz_time_of_day`, `zzz_guest_count`
2. Status is NOT updated via this endpoint (status changes implicitly through order lifecycle)
3. Cannot update a CANCELLED reservation (400 + error message)
4. `zzz_service_at` MUST be in the future when provided

### Edge Cases

| Scenario                     | Behavior                                      |
| ---------------------------- | --------------------------------------------- |
| Empty body                   | 400 — refine requires at least 1 field        |
| Update cancelled reservation | 400 — "Cannot update a cancelled reservation" |
| Past `zzz_service_at`        | 400 — validation error                        |
| Non-existent UUID            | 404                                           |

---

## 5. POST /v1/orders — Create Order with Items

### Request

- **Method**: POST
- **Path**: `/v1/orders`
- **Body**: `CreateOrderInputSchema`

### Response

| Status | Body                                                  | Description                           |
| ------ | ----------------------------------------------------- | ------------------------------------- |
| 201    | Full `Order` aggregate (with `zzz_items[]`)           | Order created atomically              |
| 400    | `{ error: "Validation failed", details: ZodFlatten }` | Invalid input                         |
| 401    | `{ message: "errors.auth.unauthorized" }`             | No auth token                         |
| 403    | `{ message: "errors.auth.forbidden" }`                | Wrong role                            |
| 404    | `{ error: "Not Found" }`                              | Reservation or catalog item not found |
| 409    | `{ error: "Reservation is cancelled" }`               | Reservation is non-active             |
| 500    | `{ error: "Internal Server Error" }`                  | DB/transaction failure                |

### Auth

- JWT required
- Role guard: `[TOURIST]` — only tourists can create orders

### Business Rules

1. **Reservation validation**: The referenced reservation MUST exist, MUST belong to the authenticated user, and MUST NOT be in CANCELLED status
2. **Catalog type validation**: `zzz_catalog_type_id` MUST reference an existing product category
3. **Item validation**: Every `zzz_catalog_item_id` in `zzz_items` MUST reference an existing catalog item (product); if ANY item is invalid, the entire transaction rolls back
4. **Price snapshot**: Each `zzz_price` in `order_items` is snapshotted from `products.zzz_price` at creation time — NOT a live reference
5. **Atomic creation**: Order + all order_items are created in a single Drizzle `db.transaction()`
6. **Initial status**: `zzz_global_status` defaults to `SEARCHING`

### Transaction Scenarios

| Scenario                              | Behavior                                                |
| ------------------------------------- | ------------------------------------------------------- |
| All items valid                       | Atomically insert order + N order_items, return 201     |
| One catalog item ID invalid           | Transaction rolls back, 404 with item details           |
| Reservation doesn't exist             | Transaction rolls back, 404                             |
| Reservation belongs to different user | 403 — "Order must belong to your reservation"           |
| Reservation is CANCELLED              | 409 — "Cannot create orders on a cancelled reservation" |
| DB constraint violation (e.g., FK)    | Transaction rolls back, 500                             |

### Edge Cases

| Scenario                              | Behavior                              |
| ------------------------------------- | ------------------------------------- |
| Empty items array                     | 400 — min(1) catches it               |
| Items array with 51 items             | 400 — max(50) catches it              |
| Quantity = 0 in an item               | 400 — positive() catches it           |
| `zzz_notes` = 1001 chars              | 400 — max(1000) catches it            |
| Concurrent create on same reservation | Both succeed — no uniqueness conflict |

---

## 6. GET /v1/orders — List Orders

### Request

- **Method**: GET
- **Path**: `/v1/orders`
- **Query params**:

| Param            | Type           | Required | Default | Description            |
| ---------------- | -------------- | -------- | ------- | ---------------------- |
| `status`         | `OrderStatus`  | No       | —       | Filter by order status |
| `reservation_id` | `string(uuid)` | No       | —       | Filter by reservation  |
| `limit`          | `number`       | No       | 20      | Max results (≤ 100)    |
| `offset`         | `number`       | No       | 0       | Pagination offset      |

### Response

| Status | Body                                                                    | Description    |
| ------ | ----------------------------------------------------------------------- | -------------- |
| 200    | `Order[]` (aggregate with `zzz_items[]`, `zzz_user`, `zzz_reservation`) | List of orders |
| 401    | `{ message: "errors.auth.unauthorized" }`                               | No auth token  |
| 500    | `{ error: "Internal Server Error" }`                                    | DB failure     |

### Auth

- JWT required
- Role guard: None (any authenticated user)
- Data scoping:
  - **TOURIST**: Orders where reservation.zzz_user_id = payload.sub (JOIN through reservations)
  - **ENTREPRENEUR**: Orders where `zzz_confirmed_venture_id` OR `zzz_current_offer_venture_id` is in user's ventures (check venture_members)
  - **ADMIN**: All orders

### Business Rules

1. Results ordered by `zzz_created_at DESC`
2. Default limit 20, max 100
3. Response is the full Order aggregate: flat fields + `zzz_items[]`, `zzz_reservation`, `zzz_user`, `zzz_confirmed_venture`, `zzz_current_offer_venture`

### Edge Cases

| Scenario                              | Behavior                |
| ------------------------------------- | ----------------------- |
| Filter by non-existent reservation_id | Returns `[]`            |
| Tourist sees only own orders          | Filter applied silently |
| Empty result                          | Returns `[]`            |
| Status filter + reservation_id filter | Both applied (AND)      |

---

## 7. PATCH /v1/orders/:id — Update Order Metadata

### Request

- **Method**: PATCH
- **Path**: `/v1/orders/:id`
- **Body**: `UpdateOrderInputSchema`

### Response

| Status | Body                                                  | Description                   |
| ------ | ----------------------------------------------------- | ----------------------------- |
| 200    | `OrderDbSchema` (flat row)                            | Updated order                 |
| 400    | `{ error: "Validation failed", details: ZodFlatten }` | Invalid input                 |
| 401    | `{ message: "errors.auth.unauthorized" }`             | No auth token                 |
| 403    | `{ message: "errors.auth.forbidden" }`                | Wrong role / not own resource |
| 404    | `{ error: "Not Found" }`                              | Order does not exist          |
| 500    | `{ error: "Internal Server Error" }`                  | DB failure                    |

### Auth

- JWT required
- Role guard: None (any authenticated user)
- Data scoping:
  - **TOURIST**: Order must belong to the user's reservation (reservation.zzz_user_id = payload.sub)
  - **ENTREPRENEUR**: Order must involve the user's venture (confirmed_venture_id or current_offer_venture_id in user's venture_members)
  - **ADMIN**: Always allowed

### Business Rules

1. Only `zzz_notes` and `zzz_notify_whatsapp` can be updated
2. Cannot update metadata on terminal status orders (CANCELLED, COMPLETED, NO_SHOW, EXPIRED) — 400

### Edge Cases

| Scenario                         | Behavior                               |
| -------------------------------- | -------------------------------------- |
| Update notes on COMPLETED order  | 400 — "Cannot update a terminal order" |
| Empty body                       | 400 — refine requires at least 1 field |
| Non-existent UUID                | 404                                    |
| Tourist updating another's order | 403 — scoping check                    |

---

## 8. PATCH /v1/orders/:id/status — Transition Order Status

### Request

- **Method**: PATCH
- **Path**: `/v1/orders/:id/status`
- **Body**: `UpdateOrderStatusInputSchema`

### Response

| Status | Body                                                                                              | Description                 |
| ------ | ------------------------------------------------------------------------------------------------- | --------------------------- |
| 200    | `OrderDbSchema` (flat row with updated status + timestamps)                                       | Status transitioned         |
| 400    | `{ error: "Validation failed", details }` or `{ error: "Invalid status transition from X to Y" }` | Invalid input or transition |
| 401    | `{ message: "errors.auth.unauthorized" }`                                                         | No auth token               |
| 403    | `{ message: "errors.auth.forbidden" }`                                                            | Wrong role                  |
| 404    | `{ error: "Not Found" }`                                                                          | Order does not exist        |
| 409    | `{ error: "Status conflict: order is already in terminal state" }`                                | Concurrent update conflict  |
| 500    | `{ error: "Internal Server Error" }`                                                              | DB failure                  |

### Auth

- JWT required
- Role guard: `[ENTREPRENEUR, ADMIN]` — only entrepreneurs and admins can transition order status

### Business Rules

1. Status transitions are validated against the allowed state machine (see below)
2. On transition to `CONFIRMED`: set `zzz_confirmed_at = new Date()`, set `zzz_confirmed_venture_id` from context
3. On transition to `CANCELLED`: set `zzz_cancelled_at = new Date()`, `zzz_cancel_reason` IS REQUIRED
4. On transition to `COMPLETED`: set `zzz_completed_at = new Date()`
5. No domain timestamps are set for `EXPIRED` or `NO_SHOW` (only `zzz_updated_at` from audit columns)
6. Concurrent status updates MUST be handled — second transaction sees the updated status and validates against it (transaction isolation)

### Edge Cases

| Scenario                                          | Behavior                                                                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Transition to CANCELLED without cancel_reason     | 400 — refine catches it                                                                                                                         |
| Transition COMPLETED → CONFIRMED                  | 400 — "Invalid status transition from COMPLETED to CONFIRMED"                                                                                   |
| Two concurrent PATCH to CONFIRMED                 | First succeeds; second sees CONFIRMED and validates against it (either 400 if invalid next transition, or succeeds if same target — idempotent) |
| ENTREPRENEUR trying to transition unrelated order | 403 — role is correct but scoping could fail. However, `roleGuard` checks role only; scoping is a service concern.                              |

**Note**: The current `roleGuard` middleware checks role only (JWT payload.role). Scoping (does this entrepreneur own this order's venture?) is NOT enforced by roleGuard — it MUST be enforced at the service level. The spec calls this out as a risk for PATCH /:id/status and GET /:id endpoints.

---

## Status Machine Specification

### Valid Transitions

| From          | To            | Trigger                                | Timestamp Set      |
| ------------- | ------------- | -------------------------------------- | ------------------ |
| SEARCHING     | OFFER_PENDING | Offer sent to venture                  | —                  |
| SEARCHING     | EXPIRED       | Cascade timeout, no ventures available | —                  |
| SEARCHING     | CANCELLED     | Tourist cancels before offer           | `zzz_cancelled_at` |
| OFFER_PENDING | CONFIRMED     | Entrepreneur accepts                   | `zzz_confirmed_at` |
| OFFER_PENDING | CANCELLED     | Tourist or entrep cancels during offer | `zzz_cancelled_at` |
| OFFER_PENDING | EXPIRED       | Offer response timeout                 | —                  |
| CONFIRMED     | COMPLETED     | Service delivered                      | `zzz_completed_at` |
| CONFIRMED     | NO_SHOW       | Tourist didn't arrive                  | —                  |
| CONFIRMED     | CANCELLED     | Cancellation after confirmation        | `zzz_cancelled_at` |

### Terminal States

`COMPLETED`, `NO_SHOW`, `CANCELLED`, `EXPIRED` — no transitions out of terminal states.

### Invalid Transitions (examples that MUST be rejected)

| From          | To            | Rejection Message                                    |
| ------------- | ------------- | ---------------------------------------------------- |
| SEARCHING     | CONFIRMED     | `Invalid transition from SEARCHING to CONFIRMED`     |
| SEARCHING     | COMPLETED     | `Invalid transition from SEARCHING to COMPLETED`     |
| SEARCHING     | NO_SHOW       | `Invalid transition from SEARCHING to NO_SHOW`       |
| OFFER_PENDING | SEARCHING     | `Invalid transition from OFFER_PENDING to SEARCHING` |
| OFFER_PENDING | COMPLETED     | `Invalid transition from OFFER_PENDING to COMPLETED` |
| OFFER_PENDING | NO_SHOW       | `Invalid transition from OFFER_PENDING to NO_SHOW`   |
| CONFIRMED     | SEARCHING     | `Invalid transition from CONFIRMED to SEARCHING`     |
| CONFIRMED     | OFFER_PENDING | `Invalid transition from CONFIRMED to OFFER_PENDING` |
| CONFIRMED     | EXPIRED       | `Invalid transition from CONFIRMED to EXPIRED`       |
| COMPLETED     | any           | `COMPLETED is a terminal state`                      |
| CANCELLED     | any           | `CANCELLED is a terminal state`                      |
| NO_SHOW       | any           | `NO_SHOW is a terminal state`                        |
| EXPIRED       | any           | `EXPIRED is a terminal state`                        |

### Transition Validation Algorithm

```
function validateTransition(currentStatus, targetStatus):
  transitions = {
    SEARCHING:     [OFFER_PENDING, EXPIRED, CANCELLED],
    OFFER_PENDING: [CONFIRMED, CANCELLED, EXPIRED],
    CONFIRMED:     [COMPLETED, NO_SHOW, CANCELLED],
    COMPLETED:     [],
    NO_SHOW:       [],
    CANCELLED:     [],
    EXPIRED:       [],
  }
  allowed = transitions[currentStatus]
  return targetStatus in allowed
```

---

## Role Visibility Matrix

| Endpoint                    | TOURIST                                  | ENTREPRENEUR           | ADMIN          |
| --------------------------- | ---------------------------------------- | ---------------------- | -------------- |
| POST /v1/reservations       | ✅ Create own (roleGuard)                | ❌ 403                 | ❌ 403         |
| GET /v1/reservations        | ✅ Own only (user_id filter)             | ✅ Related to ventures | ✅ All         |
| GET /v1/reservations/:id    | ✅ Own only (403 if not)                 | ✅ Related to ventures | ✅ All         |
| PATCH /v1/reservations/:id  | ✅ Own only                              | ✅ Related to ventures | ✅ All         |
| POST /v1/orders             | ✅ Create on own reservation (roleGuard) | ❌ 403                 | ❌ 403         |
| GET /v1/orders              | ✅ Own reservations' orders              | ✅ Ventures involved   | ✅ All         |
| PATCH /v1/orders/:id        | ✅ Own reservations                      | ✅ Ventures involved   | ✅ All         |
| PATCH /v1/orders/:id/status | ❌ 403                                   | ✅ (roleGuard)         | ✅ (roleGuard) |

### Scoping Implementation Note

Role-based data scoping must happen at the **service layer**, not the route layer. The route calls a service method with `(db, filters, userRole, userId)` and the service appends WHERE conditions based on role. This keeps the route handler clean and the scoping logic testable.

---

## Error Scenarios Summary

| HTTP Code | When                                                                     | Response Body                                         |
| --------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| 400       | Zod validation failure                                                   | `{ error: "Validation failed", details: ZodFlatten }` |
| 400       | Business rule violation (past date, terminal update, invalid transition) | `{ error: "Description of violation" }`               |
| 401       | Missing or invalid Authorization header                                  | `{ message: "errors.auth.unauthorized" }`             |
| 401       | Expired or malformed JWT                                                 | `{ message: "errors.auth.token_expired_or_invalid" }` |
| 403       | Role not in allowed list (roleGuard)                                     | `{ message: "errors.auth.forbidden" }`                |
| 403       | Resource does not belong to user (service-level scoping)                 | `{ error: "Forbidden" }`                              |
| 404       | Resource not found by UUID                                               | `{ error: "Not Found" }`                              |
| 409       | Status conflict (concurrent update, cancelled reservation)               | `{ error: "Conflict description" }`                   |
| 500       | Unexpected error or DB failure                                           | `{ error: "Internal Server Error" }`                  |

---

## Risks Discovered During Spec

| Risk                                                   | Impact                                                                                                               | Mitigation                                                                                                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **roleGuard does not scope by resource**               | PATCH /:id/status allows any ENTREPRENEUR to transition ANY order, even if their venture isn't involved              | Service-level scoping MUST check venture membership before applying status transition                                                                              |
| **Concurrent status transition race**                  | Two requests could both pass the validate-and-update check before the first commits                                  | Use transactional read + write — read current status inside the transaction, then validate, then update; do NOT read-then-validate-then-transact in separate steps |
| **Existing shared types use z.number for UUID fields** | OrderDbSchema, ReservationDbSchema, OrderItemSchema all use `z.number().int()` for IDs that will now be UUID strings | Must update ALL existing Zod schemas before implementation — listed above in "Existing Schema Updates"                                                             |
| **Pricing snapshot drift between read and write**      | Catalog price could change between reading and inserting in the same transaction                                     | Read prices inside the transaction, not before — the transaction ensures a consistent snapshot                                                                     |
| **No existing specs to diff against**                  | This is the first spec for the orders/reservations domain — no regression safety net                                 | Ensure thorough scenario coverage in tests                                                                                                                         |

---

## Scenarios Count

| Category                       | Count  |
| ------------------------------ | ------ |
| Happy path (200/201)           | 8      |
| Validation error (400)         | 7      |
| Auth error (401)               | 8      |
| Forbidden (403)                | 6      |
| Not found (404)                | 4      |
| Conflict (409)                 | 2      |
| Server error (500)             | 8      |
| Valid status transitions       | 9      |
| Invalid status transitions     | 13     |
| Transaction rollback scenarios | 5      |
| **Total defined scenarios**    | **70** |
