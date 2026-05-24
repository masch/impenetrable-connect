# Proposal: Orders Endpoints (Booking Flow)

**Change Key**: `orders-endpoints-booking-flow`

## Intent

Enable the booking flow's core backend operations — creating, listing, updating, and status-managing orders and reservations. This is the first endpoint set that handles multi-table writes, status machine validation, and role-based authorization granularity in the backend. Without it, the mobile app's booking screens have nothing to talk to.

## Scope

### In Scope

**Reservations CRUD**:
| # | Endpoint | Description |
|---|----------|-------------|
| 1 | `POST /v1/reservations` | Create a reservation (date, time, moment, guest count) |
| 2 | `GET /v1/reservations` | List reservations with optional filters |
| 3 | `GET /v1/reservations/:id` | Get single reservation with its orders |
| 4 | `PATCH /v1/reservations/:id` | Update reservation metadata |

**Orders CRUD**:
| # | Endpoint | Description |
|---|----------|-------------|
| 5 | `POST /v1/orders` | Create an order under a reservation with catalog item selection |
| 6 | `GET /v1/orders` | List orders with role-scoped filters |
| 7 | `PATCH /v1/orders/:id` | Update order metadata (notes, notify_whatsapp) |
| 8 | `PATCH /v1/orders/:id/status` | Transition order status with validation |

**Additional deliverables**:

- `reservations`, `orders`, and `order_items` Drizzle table schemas in `apps/backend/src/db/schema/`
- `ReservationService` and `OrderService` classes in `apps/backend/src/services/`
- Create/Update DTO Zod schemas in `@repo/shared`
- Route files `apps/backend/src/routes/reservations.ts` and `orders.ts`
- Full test suite (route + service) following existing patterns
- Schema registration in `db/schema/index.ts` and `db/factory.ts`

### Out of Scope

- Catalog item DB schema (products table covers this)
- Any offer/notification engine logic (webhook, push, WhatsApp)
- Admin dashboard endpoints
- Payment integration
- Cancellation refund logic
- Order items modification after creation (items are immutable once created)

## Key Design Decisions

### 1. UUID Primary Keys — All New Tables

**Decision**: `reservations`, `orders`, and `order_items` use UUID primary keys (`uuid().defaultRandom()`) instead of `serial`.

**Rationale**: User explicitly requested UUID. Consistent with `users` and `refresh_tokens` tables which already use UUID. Avoids enumeration attacks. No `resetSequence()` needed after seeds.

**Type mapping**: All IDs in shared DTOs become `z.string().uuid()`. Foreign keys within the new tables (`zzz_reservation_id` on orders, `zzz_order_id` on order_items) are also UUID. FKs to existing tables (ventures, product_categories) remain integer.

### 2. Reservation Table Included

**Decision**: The `reservations` table is created in this change, with full CRUD endpoints.

**Rationale**: Orders require a valid reservation (`zzz_reservation_id` is required). Creating the reservation table AND its FK constraint means orders have a real reference, not a postergated constraint. The domain model is `Reservation → Orders` — the tourist picks a date/time first, then selects products.

### 3. Status Transition Map

**Decision**: Enforce a strict state machine server-side.

```
                    ┌──────────┐
                    │ SEARCHING │
                    └────┬─────┘
                  ┌──────┴──────┐
                  ▼             ▼
            ┌──────────┐  ┌─────────┐
            │OFFER_    │  │ EXPIRED │
            │PENDING   │  └─────────┘
            └────┬─────┘
          ┌──────┴──────┐
          ▼             ▼
    ┌──────────┐  ┌─────────┐
    │CONFIRMED │  │CANCELLED│
    └────┬─────┘  └─────────┘
     ┌───┴────┐
     ▼        ▼
┌────────┐ ┌──────┐
│COMPLETED│ │NO_SHOW│
└────────┘ └──────┘
```

**Valid transitions**:

- `SEARCHING → OFFER_PENDING`
- `SEARCHING → EXPIRED`
- `SEARCHING → CANCELLED`
- `OFFER_PENDING → CONFIRMED`
- `OFFER_PENDING → CANCELLED`
- `OFFER_PENDING → EXPIRED`
- `CONFIRMED → COMPLETED`
- `CONFIRMED → NO_SHOW`
- `CONFIRMED → CANCELLED`

Terminal: `COMPLETED`, `NO_SHOW`, `CANCELLED`, `EXPIRED`.

### 4. Pricing: Snapshot at Order Time

`zzz_price` in `order_items` stores the catalog price at creation. NOT a live reference. Orders are historical transactions — the agreed price must be preserved.

### 5. Auth Granularity

| Endpoint                    | Minimum Role        |
| --------------------------- | ------------------- |
| POST /v1/reservations       | TOURIST             |
| GET /v1/reservations        | Any (scoped)        |
| POST /v1/orders             | TOURIST             |
| GET /v1/orders              | Any (scoped)        |
| PATCH /v1/orders/:id        | Any (scoped)        |
| PATCH /v1/orders/:id/status | ENTREPRENEUR, ADMIN |

First production use of `roleGuard` middleware.

### 6. No Soft-Delete

Orders are cancelled, not deleted. Status machine replaces deletion.

### 7. Transaction Strategy

First use of Drizzle `db.transaction()` for atomic `order + order_items` insert.

### 8. User Context

Orders don't store `zzz_user_id` directly — derived through the reservation join. The reservation stores `zzz_user_id` directly.

## Approach

### New Drizzle Schemas

#### `reservations` table (`apps/backend/src/db/schema/reservations.ts`)

```ts
impenetrableSchema.table("reservations", {
  zzz_id: uuid("zzz_id").defaultRandom().primaryKey(),
  zzz_user_id: uuid("zzz_user_id").notNull(),
  // FK to users — references existing users table
  zzz_service_at: timestamp("zzz_service_at", { withTimezone: true }).notNull(),
  zzz_time_of_day: impenetrableSchema
    .enum("service_moment", ["LUNCH", "AFTERNOON", "DINNER"])
    .notNull(),
  zzz_status: impenetrableSchema
    .enum("reservation_status", ["CREATED", "SEARCHING", "CONFIRMED", "CANCELLED"])
    .notNull()
    .default("CREATED"),
  zzz_guest_count: integer("zzz_guest_count").notNull().default(1),
  ...auditColumns,
});
```

#### `orders` table (`apps/backend/src/db/schema/orders.ts`)

```ts
impenetrableSchema.table("orders", {
  zzz_id: uuid("zzz_id").defaultRandom().primaryKey(),
  zzz_reservation_id: uuid("zzz_reservation_id")
    .references(() => reservations.zzz_id)
    .notNull(),
  zzz_catalog_type_id: integer("zzz_catalog_type_id").notNull(),
  // FK to product_categories (maps to zzz_product_category_id)
  zzz_confirmed_venture_id: integer("zzz_confirmed_venture_id").references(() => ventures.id),
  zzz_notes: text("zzz_notes"),
  zzz_global_status: impenetrableSchema
    .enum("order_status", [
      "SEARCHING",
      "OFFER_PENDING",
      "CONFIRMED",
      "COMPLETED",
      "NO_SHOW",
      "CANCELLED",
      "EXPIRED",
    ])
    .notNull()
    .default("SEARCHING"),
  zzz_cancel_reason: impenetrableSchema.enum("cancel_reason", [
    "BY_TOURIST",
    "BY_ENTREPRENEUR",
    "NO_VENTURE_AVAILABLE",
    "SYSTEM_ERROR",
  ]),
  zzz_cancelled_at: timestamp("zzz_cancelled_at"),
  zzz_completed_at: timestamp("zzz_completed_at"),
  zzz_confirmed_at: timestamp("zzz_confirmed_at"),
  zzz_current_offer_venture_id: integer("zzz_current_offer_venture_id").references(
    () => ventures.id,
  ),
  zzz_notify_whatsapp: boolean("zzz_notify_whatsapp").notNull().default(false),
  ...auditColumns,
});
```

Domain-specific timestamps (`zzz_confirmed_at`, `zzz_completed_at`, `zzz_cancelled_at`) are separate from `auditColumns` — set only when the corresponding transition happens.

#### `order_items` table (`apps/backend/src/db/schema/order-items.ts`)

```ts
impenetrableSchema.table("order_items", {
  zzz_id: uuid("zzz_id").defaultRandom().primaryKey(),
  zzz_order_id: uuid("zzz_order_id")
    .references(() => orders.zzz_id)
    .notNull(),
  zzz_catalog_item_id: integer("zzz_catalog_item_id").notNull(),
  // FK to products.zzz_id — catalog items are products
  zzz_quantity: integer("zzz_quantity").notNull(),
  zzz_price: numeric("zzz_price", { precision: 10, scale: 2 }).$type<number>().notNull(),
  // Snapshot from catalog at order time
  ...auditColumns,
});
```

### New Shared DTOs

```ts
// Reservation DTOs
const CreateReservationInputSchema = z.object({
  zzz_service_at: z.string().datetime(),
  zzz_time_of_day: ServiceMomentSchema,
  zzz_guest_count: z.number().int().positive().default(1),
});

const UpdateReservationInputSchema = z
  .object({
    zzz_service_at: z.string().datetime().optional(),
    zzz_time_of_day: ServiceMomentSchema.optional(),
    zzz_guest_count: z.number().int().positive().optional(),
  })
  .partial();

// Order DTOs
const CreateOrderInputSchema = z.object({
  zzz_reservation_id: z.string().uuid(),
  zzz_catalog_type_id: z.number().int().positive(),
  zzz_notes: z.string().optional(),
  zzz_notify_whatsapp: z.boolean().optional().default(false),
  zzz_items: z
    .array(
      z.object({
        zzz_catalog_item_id: z.number().int().positive(),
        zzz_quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

const UpdateOrderInputSchema = z
  .object({
    zzz_notes: z.string().optional(),
    zzz_notify_whatsapp: z.boolean().optional(),
  })
  .partial();

const UpdateOrderStatusInputSchema = z.object({
  zzz_global_status: OrderStatusSchema,
  zzz_cancel_reason: CancelReasonSchema.optional(),
});
```

### Services

#### `ReservationService`

Static class following `VentureService` pattern:

| Method                              | Description                               |
| ----------------------------------- | ----------------------------------------- |
| `create(db, userId, input)`         | Create reservation for authenticated user |
| `getById(db, id)`                   | Fetch single reservation                  |
| `getAll(db, filters, role, userId)` | List with role-scoped filtering           |
| `update(db, id, input)`             | Update reservation metadata               |

#### `OrderService`

| Method                                  | Description                                    |
| --------------------------------------- | ---------------------------------------------- |
| `create(db, input)`                     | Create order + order_items in a DB transaction |
| `getById(db, id)`                       | Fetch single order with items                  |
| `getAll(db, filters)`                   | List orders with optional filters              |
| `update(db, id, input)`                 | Update metadata (notes, notify_whatsapp)       |
| `updateStatus(db, id, statusDto)`       | Validate + apply status transition             |
| `getByReservationId(db, reservationId)` | List orders for a reservation                  |

### Routes

Each entity gets its own route file in `src/routes/` following the established pattern: `new Hono<AppEnv>()`, `authMiddleware`, try/catch with ZodError handling, constants from `http-status.ts`.

**reservations.ts**:
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/v1/reservations` | JWT | TOURIST |
| GET | `/v1/reservations` | JWT | Any (scoped) |
| GET | `/v1/reservations/:id` | JWT | Any (scoped) |
| PATCH | `/v1/reservations/:id` | JWT | Any (scoped) |

**orders.ts**:
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/v1/orders` | JWT | TOURIST |
| GET | `/v1/orders` | JWT | Any (scoped) |
| PATCH | `/v1/orders/:id` | JWT | Any (scoped) |
| PATCH | `/v1/orders/:id/status` | JWT | ENTREPRENEUR, ADMIN |

### Route Mounting

In `app.ts`:

```ts
import { reservationsRouter } from "./routes/reservations";
import { ordersRouter } from "./routes/orders";

app.route("/v1/reservations", reservationsRouter);
app.route("/v1/orders", ordersRouter);
```

### Test Strategy

Following the patterns from the exploration:

- **Route tests**: `app.request()` with mock DB, token via `sign()`
- **Service tests**: Direct mock `Db` objects
- **Transaction tests**: Spy on `db.transaction` for `OrderService.create()`
- **Coverage**: 200, 400 (invalid input), 401 (no auth), 403 (wrong role), 404 (not found), 500 (DB failure)

## Risks

| Risk                                | Impact                                                    | Mitigation                                                       |
| ----------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- |
| **First transaction usage**         | Transaction behavior differs between Neon and postgres-js | Test both. Drizzle's API is driver-agnostic.                     |
| **Race condition on status**        | Concurrent PATCH /:id/status                              | Transaction isolation — second tx sees updated status.           |
| **roleGuard first deployment**      | Untested in production                                    | Thorough coverage. Middleware is 3 branches.                     |
| **Price snapshot vs catalog drift** | Product deleted after order                               | Validate all items exist at creation time.                       |
| **Unfiltered GET performance**      | Large datasets                                            | Default 20, max 100. Index later if needed.                      |
| **UUID migration**                  | Existing serial FK patterns                               | Mixed: new tables use UUID, FKs to existing tables stay integer. |

## Next

Recommended next phase: **Spec (sdd-spec)**.

The spec phase should define:

1. Detailed request/response schemas for each reservation + order endpoint
2. Scenario coverage for all status transitions (valid + invalid)
3. Role-scoped data visibility for GET endpoints
4. Transaction rollback scenarios
5. Pagination boundary conditions
