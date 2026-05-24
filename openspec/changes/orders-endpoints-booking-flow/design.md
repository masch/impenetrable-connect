# Design: Orders Endpoints (Booking Flow)

**Change Key**: `orders-endpoints-booking-flow`

---

## 1. File Structure

### New Files (8)

| #   | File                                                    | Purpose                                                             |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | `apps/backend/src/db/schema/reservations.ts`            | Reservations Drizzle table schema                                   |
| 2   | `apps/backend/src/db/schema/orders.ts`                  | Orders Drizzle table schema                                         |
| 3   | `apps/backend/src/db/schema/order-items.ts`             | Order items Drizzle table schema                                    |
| 4   | `apps/backend/src/services/reservation.service.ts`      | ReservationService static class                                     |
| 5   | `apps/backend/src/services/order.service.ts`            | OrderService static class (with status machine + transaction logic) |
| 6   | `apps/backend/src/routes/reservations.ts`               | Reservation route handlers                                          |
| 7   | `apps/backend/src/routes/orders.ts`                     | Order route handlers                                                |
| 8   | `apps/backend/src/routes/reservations.test.ts`          | Reservation route tests                                             |
| 9   | `apps/backend/src/routes/orders.test.ts`                | Order route tests                                                   |
| 10  | `apps/backend/src/services/reservation.service.test.ts` | Reservation service tests                                           |
| 11  | `apps/backend/src/services/order.service.test.ts`       | Order service tests                                                 |

### Modified Files (7)

| #   | File                                        | Change                                                                |
| --- | ------------------------------------------- | --------------------------------------------------------------------- |
| 1   | `apps/backend/src/db/schema/index.ts`       | Add `export * from "./reservations"`, `"./orders"`, `"./order-items"` |
| 2   | `apps/backend/src/db/factory.ts`            | Add schema imports + register in `schema` object                      |
| 3   | `apps/backend/src/app.ts`                   | Add `reservationsRouter`, `ordersRouter` imports + mount routes       |
| 4   | `apps/backend/src/constants/http-status.ts` | Add `HTTP_CONFLICT = 409`, `HTTP_FORBIDDEN = 403`                     |
| 5   | `packages/shared/src/types/order.ts`        | UUID migration on `OrderDbSchema`; add input DTOs                     |
| 6   | `packages/shared/src/types/reservation.ts`  | UUID migration on `ReservationDbSchema`; add input DTOs               |
| 7   | `packages/shared/src/types/order-item.ts`   | UUID migration on `OrderItemSchema`                                   |

---

## 2. Schema Design

### 2.1 Enum Definitions

All enums must be defined **before** the tables that reference them, using `impenetrableSchema.enum()`.

```typescript
// apps/backend/src/db/schema/reservations.ts — enums at top
export const reservationStatusEnum = impenetrableSchema.enum("reservation_status", [
  "CREATED",
  "SEARCHING",
  "CONFIRMED",
  "CANCELLED",
]);

export const serviceMomentEnum = impenetrableSchema.enum("service_moment", [
  "BREAKFAST",
  "LUNCH",
  "SNACK",
  "DINNER",
]);
```

```typescript
// apps/backend/src/db/schema/orders.ts — enums at top
export const orderStatusEnum = impenetrableSchema.enum("order_status", [
  "SEARCHING",
  "OFFER_PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
  "EXPIRED",
]);

export const cancelReasonEnum = impenetrableSchema.enum("cancel_reason", [
  "BY_TOURIST",
  "BY_ENTREPRENEUR",
  "NO_VENTURE_AVAILABLE",
  "SYSTEM_ERROR",
]);
```

### 2.2 `reservations` Table

```typescript
// apps/backend/src/db/schema/reservations.ts
import { uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { auditColumns, impenetrableSchema } from "./base";
import { users } from "./users";

export const reservationStatusEnum = impenetrableSchema.enum("reservation_status", [
  "CREATED",
  "SEARCHING",
  "CONFIRMED",
  "CANCELLED",
]);
export const serviceMomentEnum = impenetrableSchema.enum("service_moment", [
  "BREAKFAST",
  "LUNCH",
  "SNACK",
  "DINNER",
]);

export const reservations = impenetrableSchema.table("reservations", {
  zzz_id: uuid("zzz_id").defaultRandom().primaryKey(),
  zzz_user_id: uuid("zzz_user_id")
    .references(() => users.id)
    .notNull(),
  zzz_service_at: timestamp("zzz_service_at", { withTimezone: true }).notNull(),
  zzz_time_of_day: serviceMomentEnum("zzz_time_of_day").notNull(),
  zzz_status: reservationStatusEnum("zzz_status").notNull().default("CREATED"),
  zzz_guest_count: integer("zzz_guest_count").notNull().default(1),
  ...auditColumns,
});

export type ReservationSelect = typeof reservations.$inferSelect;
export type ReservationInsert = typeof reservations.$inferInsert;
```

**Key notes**:

- `zzz_user_id` references `users.id` (UUID) — consistent with users table PK strategy
- `zzz_service_at` uses `withTimezone: true` — stores full ISO 8601 timestamps
- Status enum uses the 4-state macro-status (`CREATED`, `SEARCHING`, `CONFIRMED`, `CANCELLED`)
- No `zzz_deleted_at` in business logic — relies on status transitions, not soft-delete

### 2.3 `orders` Table

```typescript
// apps/backend/src/db/schema/orders.ts
import { uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { auditColumns, impenetrableSchema } from "./base";
import { reservations } from "./reservations";
import { ventures } from "./ventures";

export const orderStatusEnum = impenetrableSchema.enum("order_status", [
  "SEARCHING",
  "OFFER_PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
  "EXPIRED",
]);
export const cancelReasonEnum = impenetrableSchema.enum("cancel_reason", [
  "BY_TOURIST",
  "BY_ENTREPRENEUR",
  "NO_VENTURE_AVAILABLE",
  "SYSTEM_ERROR",
]);

export const orders = impenetrableSchema.table("orders", {
  zzz_id: uuid("zzz_id").defaultRandom().primaryKey(),
  zzz_reservation_id: uuid("zzz_reservation_id")
    .references(() => reservations.zzz_id)
    .notNull(),
  zzz_catalog_type_id: integer("zzz_catalog_type_id").notNull(),
  // FK to product_categories.zzz_id (serial) — mixed FK pattern
  zzz_confirmed_venture_id: integer("zzz_confirmed_venture_id").references(() => ventures.id),
  zzz_notes: text("zzz_notes"),
  zzz_global_status: orderStatusEnum("zzz_global_status").notNull().default("SEARCHING"),
  zzz_cancel_reason: cancelReasonEnum("zzz_cancel_reason"),
  zzz_cancelled_at: timestamp("zzz_cancelled_at"),
  zzz_completed_at: timestamp("zzz_completed_at"),
  zzz_confirmed_at: timestamp("zzz_confirmed_at"),
  zzz_current_offer_venture_id: integer("zzz_current_offer_venture_id").references(
    () => ventures.id,
  ),
  zzz_notify_whatsapp: boolean("zzz_notify_whatsapp").notNull().default(false),
  ...auditColumns,
});

export type OrderSelect = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;
```

**Key notes**:

- `zzz_reservation_id` is UUID — references `reservations.zzz_id` (UUID)
- `zzz_confirmed_venture_id` and `zzz_current_offer_venture_id` are integer — reference `ventures.id` (serial) — **mixed FK pattern** by design
- `zzz_catalog_type_id` is integer — references `product_categories.zzz_id` (serial)
- Domain-specific timestamps (`zzz_confirmed_at`, `zzz_cancelled_at`, `zzz_completed_at`) are separate from `auditColumns` — set only when the corresponding status transition fires
- `zzz_cancel_reason` is nullable — only set on `CANCELLED` transitions

### 2.4 `order_items` Table

```typescript
// apps/backend/src/db/schema/order-items.ts
import { uuid, integer, numeric } from "drizzle-orm/pg-core";
import { auditColumns, impenetrableSchema } from "./base";
import { orders } from "./orders";

export const orderItems = impenetrableSchema.table("order_items", {
  zzz_id: uuid("zzz_id").defaultRandom().primaryKey(),
  zzz_order_id: uuid("zzz_order_id")
    .references(() => orders.zzz_id)
    .notNull(),
  zzz_catalog_item_id: integer("zzz_catalog_item_id").notNull(),
  // FK to products.zzz_id (serial) — catalog items are products
  zzz_quantity: integer("zzz_quantity").notNull(),
  zzz_price: numeric("zzz_price", { precision: 10, scale: 2 }).$type<number>().notNull(),
  // Price is a snapshot from catalog at order time — NOT a live reference
  ...auditColumns,
});

export type OrderItemSelect = typeof orderItems.$inferSelect;
export type OrderItemInsert = typeof orderItems.$inferInsert;
```

**Key notes**:

- `zzz_order_id` is UUID — FK to `orders.zzz_id`
- `zzz_catalog_item_id` is integer — FK to `products.zzz_id` (serial)
- `zzz_price` is numeric(10,2) with `.$type<number>()` — consistent with `products.ts` pattern
- File named `order-items.ts` (kebab-case) following existing convention for multi-word table files

### 2.5 Foreign Key Relationship Map

```
reservations.zzz_user_id ──→ users.id                    (UUID → UUID)
orders.zzz_reservation_id ──→ reservations.zzz_id         (UUID → UUID)
orders.zzz_confirmed_venture_id ──→ ventures.id            (int → serial)
orders.zzz_current_offer_venture_id ──→ ventures.id        (int → serial)
order_items.zzz_order_id ──→ orders.zzz_id                (UUID → UUID)
order_items.zzz_catalog_item_id ──→ products.zzz_id        (int → serial)
```

### 2.6 Schema Registration

**`db/schema/index.ts`** — add three lines:

```typescript
export * from "./reservations";
export * from "./orders";
export * from "./order-items";
```

**`db/factory.ts`** — add schema imports + register:

```typescript
import {
  projects,
  users,
  ventures,
  refreshTokens,
  reservations,
  orders,
  orderItems,
} from "./schema";

const schema = {
  projects,
  users,
  ventures,
  refreshTokens,
  reservations,
  orders,
  orderItems,
};
```

No changes needed in `drizzle.config.ts` — it already uses `impenetrable_connect` schema filter which will pick up the new tables.

---

## 3. Shared DTO Design

### 3.1 UUID Migration — Existing Schemas

**`packages/shared/src/types/order.ts`** — OrderDbSchema changes:

```typescript
// BEFORE
zzz_id: z.number().int().positive(),
zzz_reservation_id: z.number().int().positive(),

// AFTER
zzz_id: z.string().uuid(),
zzz_reservation_id: z.string().uuid(),
```

Also remove standalone `zzz_created_at: z.date()` — audit columns from the DB cover creation time; the domain timestamps (`zzz_confirmed_at`, `zzz_completed_at`, `zzz_cancelled_at`) remain.

**`packages/shared/src/types/reservation.ts`** — ReservationDbSchema changes:

```typescript
// BEFORE
zzz_id: z.number().int().positive(),

// AFTER
zzz_id: z.string().uuid(),
```

**`packages/shared/src/types/order-item.ts`** — OrderItemSchema changes:

```typescript
// BEFORE
zzz_id: z.number().int().positive(),
zzz_order_id: z.number().int().positive(),

// AFTER
zzz_id: z.string().uuid(),
zzz_order_id: z.string().uuid(),
```

### 3.2 Input DTOs — Reservation

Add to `packages/shared/src/types/reservation.ts`:

```typescript
export const CreateReservationInputSchema = z.object({
  zzz_service_at: z.string().datetime({ message: "ISO 8601 datetime with timezone required" }),
  zzz_time_of_day: ServiceMomentSchema,
  zzz_guest_count: z.number().int().positive("Guest count must be positive").default(1),
});
export type CreateReservationInput = z.infer<typeof CreateReservationInputSchema>;

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

### 3.3 Input DTOs — Order

Add to `packages/shared/src/types/order.ts`:

```typescript
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

### 3.4 Export Updates

The shared `index.ts` already exports from `order.ts`, `reservation.ts`, `order-item.ts`. The new input DTOs are exported automatically via their declarations in those files. No barrel-export changes needed.

---

## 4. Service Design

### 4.1 ReservationService

**File**: `apps/backend/src/services/reservation.service.ts`

**Pattern**: Static class, follows `VentureService` exactly.

```typescript
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { type Db } from "../db";
import { reservations } from "../db/schema";
import type { CreateReservationInput, UpdateReservationInput } from "@repo/shared";
import { UserRole } from "@repo/shared";

export class ReservationService {
  // -- CREATE --
  static async create(db: Db, userId: string, input: CreateReservationInput) {
    const [reservation] = await db
      .insert(reservations)
      .values({
        zzz_user_id: userId,
        zzz_service_at: new Date(input.zzz_service_at),
        zzz_time_of_day: input.zzz_time_of_day,
        zzz_guest_count: input.zzz_guest_count,
      })
      .returning();
    return reservation;
  }

  // -- GET BY ID (with orders included or just the row) --
  static async getById(db: Db, id: string) {
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.zzz_id, id))
      .limit(1);
    return reservation;
  }

  // -- LIST (role-scoped) --
  static async getAll(
    db: Db,
    filters: { status?: string; limit?: number; offset?: number },
    userRole: UserRole,
    userId: string,
  ) {
    const limit = Math.min(filters.limit ?? 20, 100);
    const offset = filters.offset ?? 0;

    let query = db.select().from(reservations);

    // Role-based scoping
    const conditions = [];

    if (userRole === UserRole.TOURIST) {
      conditions.push(eq(reservations.zzz_user_id, userId));
    } else if (userRole === UserRole.ENTREPRENEUR) {
      // Entrepreneur: reservations linked to orders belonging to their ventures
      // This requires a subquery via venture_members
      // For the initial implementation, use a simplified approach:
      // subquery: orders where confirmed_venture_id or current_offer_venture_id
      //   is in (select venture_id from venture_members where user_id = userId)
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${sql.raw("impenetrable_connect.orders")} o
          LEFT JOIN ${sql.raw("impenetrable_connect.venture_members")} vm
            ON (o.zzz_confirmed_venture_id = vm.venture_id OR o.zzz_current_offer_venture_id = vm.venture_id)
          WHERE o.zzz_reservation_id = ${reservations.zzz_id}
            AND vm.user_id = ${userId}
        )`,
      );
    }
    // ADMIN: no filter — sees all

    if (filters.status) {
      conditions.push(eq(reservations.zzz_status, filters.status as never));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(reservations.zzzCreatedAt)).limit(limit).offset(offset);
  }

  // -- UPDATE --
  static async update(db: Db, id: string, input: UpdateReservationInput) {
    const updateData: Record<string, unknown> = {};
    if (input.zzz_service_at !== undefined)
      updateData.zzz_service_at = new Date(input.zzz_service_at);
    if (input.zzz_time_of_day !== undefined) updateData.zzz_time_of_day = input.zzz_time_of_day;
    if (input.zzz_guest_count !== undefined) updateData.zzz_guest_count = input.zzz_guest_count;

    const [updated] = await db
      .update(reservations)
      .set(updateData)
      .where(eq(reservations.zzz_id, id))
      .returning();
    return updated;
  }
}
```

**Method signatures**:

| Method    | Signature                                                 | Returns                                   |
| --------- | --------------------------------------------------------- | ----------------------------------------- |
| `create`  | `(db: Db, userId: string, input: CreateReservationInput)` | `Promise<ReservationSelect>`              |
| `getById` | `(db: Db, id: string)`                                    | `Promise<ReservationSelect \| undefined>` |
| `getAll`  | `(db: Db, filters, userRole: UserRole, userId: string)`   | `Promise<ReservationSelect[]>`            |
| `update`  | `(db: Db, id: string, input: UpdateReservationInput)`     | `Promise<ReservationSelect \| undefined>` |

**Implementation details**:

- No validation in service — delegate to route layer (Zod handles it)
- No custom error classes — return `undefined` for not-found, let route handle
- Entrepreneur scoping uses raw SQL subquery — necessary because the join involves `orders` + `venture_members`. **Risk**: raw SQL with `sql.raw()` for table names. Mitigation: table names are static literals, not user input.
- The `filters.status` cast to `never` is safe because the enum column maps to known string values

### 4.2 OrderService

**File**: `apps/backend/src/services/order.service.ts`

**Pattern**: Static class, with transaction logic for `create`.

```typescript
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { type Db } from "../db";
import { orders, orderItems, reservations, ventures } from "../db/schema";
import type { CreateOrderInput, UpdateOrderInput, UpdateOrderStatusInput } from "@repo/shared";
import { UserRole } from "@repo/shared";

// Status transition map (immutable)
const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  SEARCHING: ["OFFER_PENDING", "EXPIRED", "CANCELLED"],
  OFFER_PENDING: ["CONFIRMED", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  COMPLETED: [],
  NO_SHOW: [],
  CANCELLED: [],
  EXPIRED: [],
} as const;

const TERMINAL_STATUSES = new Set(["COMPLETED", "NO_SHOW", "CANCELLED", "EXPIRED"]);

export class OrderService {
  // -- TRANSITION VALIDATION (stateless utility) --
  static isValidTransition(from: string, to: string): boolean {
    const allowed = ORDER_STATUS_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  static isTerminal(status: string): boolean {
    return TERMINAL_STATUSES.has(status);
  }

  // -- CREATE (transactional: order + items) --
  static async create(db: Db, userId: string, input: CreateOrderInput) {
    return db.transaction(async (tx) => {
      // 1. Validate reservation exists, belongs to user, and is not cancelled
      const [reservation] = await tx
        .select()
        .from(reservations)
        .where(eq(reservations.zzz_id, input.zzz_reservation_id))
        .limit(1);

      if (!reservation) {
        throw new OrderServiceError("Not Found", "Reservation not found", 404);
      }
      if (reservation.zzz_user_id !== userId) {
        throw new OrderServiceError("Forbidden", "Order must belong to your reservation", 403);
      }
      if (reservation.zzz_status === "CANCELLED") {
        throw new OrderServiceError(
          "Conflict",
          "Cannot create orders on a cancelled reservation",
          409,
        );
      }

      // 2. Insert the order row
      const [order] = await tx
        .insert(orders)
        .values({
          zzz_reservation_id: input.zzz_reservation_id,
          zzz_catalog_type_id: input.zzz_catalog_type_id,
          zzz_notes: input.zzz_notes ?? null,
          zzz_notify_whatsapp: input.zzz_notify_whatsapp ?? false,
          zzz_global_status: "SEARCHING",
        })
        .returning();

      // 3. Snapshop prices from products table and insert order_items
      // NOTE: Products table is products (with serial PK zzz_id)
      // In a real implementation, this would query products where
      // products.zzz_id IN (input items' catalog_item_ids)
      // For now, snapshot the price at creation time
      const itemsToInsert = input.zzz_items.map((item) => ({
        zzz_order_id: order.zzz_id,
        zzz_catalog_item_id: item.zzz_catalog_item_id,
        zzz_quantity: item.zzz_quantity,
        // zzz_price is snapshotted — in full impl, fetch from products table
        zzz_price: 0, // Placeholder: will be fetched from catalog in transaction
      }));

      const insertedItems = await tx.insert(orderItems).values(itemsToInsert).returning();

      return { ...order, zzz_items: insertedItems };
    });
  }

  // -- GET BY ID --
  static async getById(db: Db, id: string) {
    const [order] = await db.select().from(orders).where(eq(orders.zzz_id, id)).limit(1);
    return order;
  }

  // -- LIST (with role-scoped filters) --
  static async getAll(
    db: Db,
    filters: { status?: string; reservation_id?: string; limit?: number; offset?: number },
    userRole: UserRole,
    userId: string,
  ) {
    const limit = Math.min(filters.limit ?? 20, 100);
    const offset = filters.offset ?? 0;

    const conditions: unknown[] = [];

    // Role scoping
    if (userRole === UserRole.TOURIST) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${sql.raw("impenetrable_connect.reservations")} r
          WHERE r.zzz_id = ${orders.zzz_reservation_id}
            AND r.zzz_user_id = ${userId}
        )`,
      );
    } else if (userRole === UserRole.ENTREPRENEUR) {
      conditions.push(
        sql`(
          ${orders.zzz_confirmed_venture_id} IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM ${sql.raw("impenetrable_connect.venture_members")} vm
            WHERE vm.venture_id = ${orders.zzz_confirmed_venture_id}
              AND vm.user_id = ${userId}
          )
        ) OR (
          ${orders.zzz_current_offer_venture_id} IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM ${sql.raw("impenetrable_connect.venture_members")} vm
            WHERE vm.venture_id = ${orders.zzz_current_offer_venture_id}
              AND vm.user_id = ${userId}
          )
        )`,
      );
    }

    // Optional filters
    if (filters.status) {
      conditions.push(eq(orders.zzz_global_status, filters.status as never));
    }
    if (filters.reservation_id) {
      conditions.push(eq(orders.zzz_reservation_id, filters.reservation_id));
    }

    let query = db.select().from(orders);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(orders.zzzCreatedAt)).limit(limit).offset(offset);
  }

  // -- UPDATE metadata --
  static async update(db: Db, id: string, input: UpdateOrderInput) {
    const updateData: Record<string, unknown> = {};
    if (input.zzz_notes !== undefined) updateData.zzz_notes = input.zzz_notes;
    if (input.zzz_notify_whatsapp !== undefined)
      updateData.zzz_notify_whatsapp = input.zzz_notify_whatsapp;

    // Reject update if order is in terminal state
    const [current] = await db.select().from(orders).where(eq(orders.zzz_id, id)).limit(1);
    if (!current) return undefined;
    if (this.isTerminal(current.zzz_global_status)) {
      throw new OrderServiceError("Bad Request", "Cannot update a terminal order", 400);
    }

    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.zzz_id, id))
      .returning();
    return updated;
  }

  // -- UPDATE STATUS (with transition validation + timestamp side effects) --
  static async updateStatus(
    db: Db,
    id: string,
    input: UpdateOrderStatusInput,
    userId: string,
    userRole: UserRole,
  ) {
    return db.transaction(async (tx) => {
      // Read current state INSIDE the transaction (avoids race conditions)
      const [current] = await tx.select().from(orders).where(eq(orders.zzz_id, id)).limit(1);

      if (!current) {
        throw new OrderServiceError("Not Found", "Order not found", 404);
      }

      const fromStatus = current.zzz_global_status;
      const toStatus = input.zzz_global_status;

      // Validate transition
      if (!this.isValidTransition(fromStatus, toStatus)) {
        throw new OrderServiceError(
          "Bad Request",
          `Invalid status transition from ${fromStatus} to ${toStatus}`,
          400,
        );
      }

      // Side effects: set domain timestamps based on target status
      const setData: Record<string, unknown> = {
        zzz_global_status: toStatus,
      };

      if (toStatus === "CONFIRMED") {
        setData.zzz_confirmed_at = new Date();
        // zzz_confirmed_venture_id would be set from context in full impl
      }
      if (toStatus === "CANCELLED") {
        setData.zzz_cancelled_at = new Date();
        setData.zzz_cancel_reason = input.zzz_cancel_reason;
      }
      if (toStatus === "COMPLETED") {
        setData.zzz_completed_at = new Date();
      }
      // EXPIRED and NO_SHOW: no domain timestamp set (only audit updated_at)

      const [updated] = await tx
        .update(orders)
        .set(setData)
        .where(eq(orders.zzz_id, id))
        .returning();

      return updated;
    });
  }

  // -- GET BY RESERVATION --
  static async getByReservationId(db: Db, reservationId: string) {
    return db
      .select()
      .from(orders)
      .where(eq(orders.zzz_reservation_id, reservationId))
      .orderBy(desc(orders.zzzCreatedAt));
  }
}

// Simple error class to carry HTTP status codes from service to route
export class OrderServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number,
  ) {
    super(message);
    this.name = "OrderServiceError";
  }
}
```

**Method signatures**:

| Method               | Signature                                                                                 | Returns                                                   |
| -------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `create`             | `(db: Db, userId: string, input: CreateOrderInput)`                                       | `Promise<OrderSelect & { zzz_items: OrderItemSelect[] }>` |
| `getById`            | `(db: Db, id: string)`                                                                    | `Promise<OrderSelect \| undefined>`                       |
| `getAll`             | `(db: Db, filters, userRole, userId)`                                                     | `Promise<OrderSelect[]>`                                  |
| `update`             | `(db: Db, id: string, input: UpdateOrderInput)`                                           | `Promise<OrderSelect \| undefined>`                       |
| `updateStatus`       | `(db: Db, id: string, input: UpdateOrderStatusInput, userId: string, userRole: UserRole)` | `Promise<OrderSelect>`                                    |
| `getByReservationId` | `(db: Db, reservationId: string)`                                                         | `Promise<OrderSelect[]>`                                  |

### 4.3 Status Machine Implementation

```typescript
// The transition map is the single source of truth
const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  SEARCHING: ["OFFER_PENDING", "EXPIRED", "CANCELLED"],
  OFFER_PENDING: ["CONFIRMED", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  COMPLETED: [],
  NO_SHOW: [],
  CANCELLED: [],
  EXPIRED: [],
};

const TERMINAL_STATUSES = new Set(["COMPLETED", "NO_SHOW", "CANCELLED", "EXPIRED"]);
```

**Validation algorithm**:

1. Read current status (inside transaction)
2. Look up `ORDER_STATUS_TRANSITIONS[currentStatus]`
3. If target not in allowed array → throw 400
4. Apply side effects (timestamps)
5. Update row

**Transaction guarantee**: The read of current status and the update MUST be in the same transaction. This prevents the race condition where two concurrent requests both see `SEARCHING` and both attempt to transition to `OFFER_PENDING`. The first succeeds; the second's read inside the transaction sees `OFFER_PENDING` (post-first-update) and validates against it.

### 4.4 Price Snapshot Strategy

Inside `OrderService.create()`:

1. Inside the transaction, query `products` table for all `zzz_catalog_item_id` values
2. Verify every ID exists → if any missing, throw 404 with item details → rollback
3. Map each input item to its product's `zzz_price` for the `order_items` insert

```typescript
// Inside db.transaction():
const productIds = input.zzz_items.map((i) => i.zzz_catalog_item_id);
const products = await tx
  .select()
  .from(productsTable)
  .where(inArray(productsTable.zzz_id, productIds));

if (products.length !== productIds.length) {
  const foundIds = new Set(products.map((p) => p.zzz_id));
  const missing = productIds.filter((id) => !foundIds.has(id));
  throw new OrderServiceError("Not Found", `Catalog items not found: ${missing.join(", ")}`, 404);
}

const priceMap = new Map(products.map((p) => [p.zzz_id, p.zzz_price]));
const itemsToInsert = input.zzz_items.map((item) => ({
  zzz_order_id: order.zzz_id,
  zzz_catalog_item_id: item.zzz_catalog_item_id,
  zzz_quantity: item.zzz_quantity,
  zzz_price: priceMap.get(item.zzz_catalog_item_id)!,
}));
```

---

## 5. Route Design

### 5.1 General Pattern

Each route file follows the established `ventures.ts` pattern:

- `new Hono<AppEnv>()`
- `router.use("*", authMiddleware)` — JWT required for all endpoints
- `roleGuard` applied per-route where needed
- try/catch with `ZodError` → 400, `OrderServiceError` → mapped status, other → 500
- Constant HTTP status codes from `http-status.ts` (plus new `HTTP_CONFLICT`)

### 5.2 reservations.ts

```typescript
import { Hono } from "hono";
import { ZodError } from "zod";
import { CreateReservationInputSchema, UpdateReservationInputSchema, UserRole } from "@repo/shared";
import { logger } from "../services/logger.service";
import { type AppEnv } from "../config/env";
import { authMiddleware, roleGuard } from "../middleware/auth";
import { ReservationService } from "../services/reservation.service";
import {
  HTTP_OK,
  HTTP_CREATED,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_FORBIDDEN,
  HTTP_CONFLICT,
  HTTP_INTERNAL_ERROR,
} from "../constants/http-status";

const router = new Hono<AppEnv>();
router.use("*", authMiddleware);

// POST / — Create reservation (TOURIST only)
router.post("/", roleGuard([UserRole.TOURIST]), async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const body = await c.req.json();
    const validated = CreateReservationInputSchema.parse(body);

    // Business rule: service_at must be in the future
    const serviceDate = new Date(validated.zzz_service_at);
    if (serviceDate <= new Date()) {
      return c.json({ error: "zzz_service_at must be in the future" }, HTTP_BAD_REQUEST);
    }

    // Guest count cap
    if (validated.zzz_guest_count > 99) {
      return c.json({ error: "Guest count must be 99 or less" }, HTTP_BAD_REQUEST);
    }

    const reservation = await ReservationService.create(db, payload.sub, validated);
    return c.json(reservation, HTTP_CREATED);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Reservation validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    logger.error("Error creating reservation", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

// GET / — List reservations (scoped)
router.get("/", async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const status = c.req.query("status");
    const limit = Number(c.req.query("limit")) || undefined;
    const offset = Number(c.req.query("offset")) || undefined;

    const results = await ReservationService.getAll(
      db,
      { status, limit, offset },
      payload.role,
      payload.sub,
    );
    return c.json(results, HTTP_OK);
  } catch (error) {
    logger.error("Error fetching reservations", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

// GET /:id — Get single reservation
router.get("/:id", async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const id = c.req.param("id");

    // Basic UUID format check
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return c.json({ error: "Invalid ID format" }, HTTP_BAD_REQUEST);
    }

    const reservation = await ReservationService.getById(db, id);
    if (!reservation) {
      return c.json({ error: "Not Found" }, HTTP_NOT_FOUND);
    }

    // Scoping check at route level for single-resource access
    if (payload.role === UserRole.TOURIST && reservation.zzz_user_id !== payload.sub) {
      return c.json({ error: "Forbidden" }, HTTP_FORBIDDEN);
    }

    // NOTE: Full aggregate (with orders) requires joining — for initial impl, return the row
    // Full aggregate endpoint can be added later or via query param
    return c.json(reservation, HTTP_OK);
  } catch (error) {
    logger.error("Error fetching reservation", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

// PATCH /:id — Update reservation metadata
router.patch("/:id", async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const id = c.req.param("id");

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return c.json({ error: "Invalid ID format" }, HTTP_BAD_REQUEST);
    }

    const body = await c.req.json();
    const validated = UpdateReservationInputSchema.parse(body);

    // Fetch current state for scoping + cancellation check
    const current = await ReservationService.getById(db, id);
    if (!current) {
      return c.json({ error: "Not Found" }, HTTP_NOT_FOUND);
    }

    // Scoping
    if (payload.role === UserRole.TOURIST && current.zzz_user_id !== payload.sub) {
      return c.json({ error: "Forbidden" }, HTTP_FORBIDDEN);
    }

    // Cannot update cancelled reservation
    if (current.zzz_status === "CANCELLED") {
      return c.json({ error: "Cannot update a cancelled reservation" }, HTTP_BAD_REQUEST);
    }

    // Validate future date if service_at is being updated
    if (validated.zzz_service_at && new Date(validated.zzz_service_at) <= new Date()) {
      return c.json({ error: "zzz_service_at must be in the future" }, HTTP_BAD_REQUEST);
    }

    const updated = await ReservationService.update(db, id, validated);
    return c.json(updated, HTTP_OK);
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn("Reservation validation failed", { error: error.message });
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    logger.error("Error updating reservation", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

export { router as reservationsRouter };
```

### 5.3 orders.ts

```typescript
// Similar pattern to reservations.ts but with:
// - POST /: roleGuard([UserRole.TOURIST])
// - PATCH /:id/status: roleGuard([UserRole.ENTREPRENEUR, UserRole.ADMIN])
// - OrderServiceError catch block for service-thrown business errors
//
// Key handler details:

// POST / — Create order (TOURIST only)
router.post("/", roleGuard([UserRole.TOURIST]), async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const body = await c.req.json();
    const validated = CreateOrderInputSchema.parse(body);

    const order = await OrderService.create(db, payload.sub, validated);
    return c.json(order, HTTP_CREATED);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    if (error instanceof OrderServiceError) {
      return c.json({ error: error.message }, error.httpStatus);
    }
    logger.error("Error creating order", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});

// PATCH /:id/status — Transition order status (ENTREPRENEUR, ADMIN)
router.patch("/:id/status", roleGuard([UserRole.ENTREPRENEUR, UserRole.ADMIN]), async (c) => {
  try {
    const db = c.var.db;
    const payload = c.get("jwtPayload") as { sub: string; role: UserRole };
    const id = c.req.param("id");

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return c.json({ error: "Invalid ID format" }, HTTP_BAD_REQUEST);
    }

    const body = await c.req.json();
    const validated = UpdateOrderStatusInputSchema.parse(body);

    const updated = await OrderService.updateStatus(db, id, validated, payload.sub, payload.role);
    return c.json(updated, HTTP_OK);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Validation failed", details: error.flatten() }, HTTP_BAD_REQUEST);
    }
    if (error instanceof OrderServiceError) {
      return c.json({ error: error.message }, error.httpStatus);
    }
    logger.error("Error updating order status", error);
    return c.json({ error: "Internal Server Error" }, HTTP_INTERNAL_ERROR);
  }
});
```

### 5.4 Route Mounting in app.ts

```typescript
import { reservationsRouter } from "./routes/reservations";
import { ordersRouter } from "./routes/orders";

app.route("/v1/reservations", reservationsRouter);
app.route("/v1/orders", ordersRouter);
```

### 5.5 Auth Middleware Application Summary

| Endpoint                      | Middleware Chain                                      | Notes                                                          |
| ----------------------------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| All reservation routes        | `authMiddleware`                                      | JWT verified, payload set                                      |
| `POST /v1/reservations`       | `authMiddleware` → `roleGuard([TOURIST])`             | First production use of roleGuard                              |
| `GET /v1/reservations`        | `authMiddleware`                                      | Scoped at service layer                                        |
| `GET /v1/reservations/:id`    | `authMiddleware`                                      | Scoped at route layer                                          |
| `PATCH /v1/reservations/:id`  | `authMiddleware`                                      | Scoped at route layer                                          |
| All order routes              | `authMiddleware`                                      | JWT verified, payload set                                      |
| `POST /v1/orders`             | `authMiddleware` → `roleGuard([TOURIST])`             | Role check before handler                                      |
| `GET /v1/orders`              | `authMiddleware`                                      | Scoped at service layer                                        |
| `PATCH /v1/orders/:id`        | `authMiddleware`                                      | Scoped at route layer                                          |
| `PATCH /v1/orders/:id/status` | `authMiddleware` → `roleGuard([ENTREPRENEUR, ADMIN])` | Minimal role check; venture-level scoping is a service concern |

**Important**: The `roleGuard` checks JWT role only. Service-level scoping (does this entrepreneur own this order's venture?) is NOT enforced by `roleGuard` — it's enforced at the service layer via the raw SQL subqueries through `venture_members`.

### 5.6 HTTP Status Constants Addition

```typescript
// apps/backend/src/constants/http-status.ts
export const HTTP_CONFLICT = 409;
export const HTTP_FORBIDDEN = 403;
```

### 5.7 Error Contract Mapping

| HTTP Code | When                                                 | Thrown by                                    | Route Handling                                                                                             |
| --------- | ---------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 400       | Zod validation failure                               | ZodError in route                            | Caught in try/catch, returns `{ error: "Validation failed", details: error.flatten() }`                    |
| 400       | Business rule violation (past date, terminal update) | Route check (if guard) or OrderServiceError  | Returns `{ error: "Description" }`                                                                         |
| 401       | Missing/invalid JWT                                  | authMiddleware                               | Returns `{ message: "errors.auth.unauthorized" }` or `{ message: "errors.auth.token_expired_or_invalid" }` |
| 403       | Role not allowed                                     | roleGuard                                    | Returns `{ message: "errors.auth.forbidden" }`                                                             |
| 403       | Resource access denied                               | Route check (ownership)                      | Returns `{ error: "Forbidden" }`                                                                           |
| 404       | Resource not found                                   | Route (check undefined) or OrderServiceError | Returns `{ error: "Not Found" }`                                                                           |
| 409       | Status conflict / cancelled reservation              | OrderServiceError                            | Returns `{ error: "Description" }`                                                                         |
| 500       | Unexpected error                                     | Any                                          | Returns `{ error: "Internal Server Error" }`                                                               |

**Architect note**: There is a **response shape inconsistency** between the auth middleware and the application error responses: auth middleware uses `{ message: "..." }` while application errors use `{ error: "..." }`. This is an existing pattern in the codebase (from `auth.ts` and `ventures.ts`). This design preserves it to avoid breaking existing behavior. A future refactor could align these.

---

## 6. Test Design

### 6.1 Test Structure

#### `reservations.service.test.ts`

```
describe("ReservationService"
  describe("create"
    it("should create a reservation and return it")
    it("should use the provided user_id, not the token sub directly")  // service gets userId as param
  )
  describe("getById"
    it("should return a reservation by UUID")
    it("should return undefined when not found")
  )
  describe("getAll"
    it("should return all reservations for ADMIN")
    it("should filter by user_id for TOURIST")
    it("should apply status filter when provided")
    it("should apply limit and offset")
    it("should default to limit 20, max 100")
    it("should return empty array when no matches")
  )
  describe("update"
    it("should update reservation metadata")
    it("should return undefined when not found")
  )
)
```

#### `order.service.test.ts`

```
describe("OrderService"
  describe("create"
    it("should create order + items in a transaction")
    it("should reject if reservation does not exist")
    it("should reject if reservation belongs to different user")
    it("should reject if reservation is cancelled")
    it("should snapshot prices from catalog")
    it("should rollback transaction if catalog item not found")
    it("should rollback transaction on any DB failure")
  )
  describe("getById"
    it("should return an order by UUID")
    it("should return undefined when not found")
  )
  describe("getAll"
    it("should return all orders for ADMIN")
    it("should filter by reservation for TOURIST")
    it("should filter by venture membership for ENTREPRENEUR")
    it("should apply status filter")
    it("should apply reservation_id filter")
  )
  describe("update"
    it("should update notes and notify_whatsapp")
    it("should return undefined when not found")
    it("should reject update on terminal status order")
  )
  describe("updateStatus"
    it("should apply valid transition SEARCHING → OFFER_PENDING")
    it("should apply valid transition CONFIRMED → COMPLETED with confirmed_at")
    it("should apply valid transition CANCELLED with cancel_reason + cancelled_at")
    it("should reject invalid transition SEARCHING → CONFIRMED")
    it("should reject transition from terminal state")
    it("should reject CANCELLED without cancel_reason")
    it("should set confirmed_at on CONFIRMED transition")
    it("should set cancelled_at + cancel_reason on CANCELLED transition")
    it("should set completed_at on COMPLETED transition")
  )
  describe("getByReservationId"
    it("should return orders for a given reservation")
    it("should return empty array when no orders")
  )
  describe("isValidTransition"
    it("should return true for valid transitions")
    it("should return false for invalid transitions")
  )
)
```

#### `reservations.test.ts` (route tests)

```
describe("Reservations API"
  describe("POST /v1/reservations"
    it("should return 201 when creating a reservation (TOURIST)")
    it("should return 403 when non-TOURIST creates reservation")
    it("should return 400 when body is invalid")
    it("should return 400 when service_at is in the past")
    it("should return 401 without auth token")
    it("should return 500 on DB failure")
  )
  describe("GET /v1/reservations"
    it("should return 200 with array")
    it("should return 401 without auth token")
    it("should return 500 on DB failure")
  )
  describe("GET /v1/reservations/:id"
    it("should return 200 with reservation")
    it("should return 404 when not found")
    it("should return 400 when UUID is malformed")
    it("should return 403 when tourist accesses another's reservation")
    it("should return 401 without auth token")
  )
  describe("PATCH /v1/reservations/:id"
    it("should return 200 when updating own reservation")
    it("should return 404 when not found")
    it("should return 400 when body is empty")
    it("should return 400 when updating cancelled reservation")
    it("should return 400 when service_at is in the past")
    it("should return 403 when tourist updates another's reservation")
    it("should return 401 without auth token")
  )
)
```

#### `orders.test.ts` (route tests)

```
describe("Orders API"
  describe("POST /v1/orders"
    it("should return 201 when creating order (TOURIST)")
    it("should return 403 when non-TOURIST creates order")
    it("should return 400 when body is invalid")
    it("should return 400 when items array is empty")
    it("should return 400 when items exceed 50")
    it("should return 401 without auth token")
    it("should return 404 when reservation not found")
    it("should return 403 when creating order on another's reservation")
    it("should return 409 when reservation is cancelled")
    it("should return 500 on DB failure")
  )
  describe("GET /v1/orders"
    it("should return 200 with array")
    it("should return 401 without auth token")
    it("should apply status filter")
    it("should apply reservation_id filter")
  )
  describe("PATCH /v1/orders/:id"
    it("should return 200 when updating own order")
    it("should return 404 when not found")
    it("should return 400 when body is empty")
    it("should return 400 when order is in terminal state")
    it("should return 401 without auth token")
  )
  describe("PATCH /v1/orders/:id/status"
    it("should return 200 on valid transition (ENTREPRENEUR)")
    it("should return 200 on valid transition (ADMIN)")
    it("should return 403 on TOURIST role")
    it("should return 400 on invalid transition")
    it("should return 400 when cancelling without reason")
    it("should return 404 when order not found")
    it("should return 401 without auth token")
  )
)
```

### 6.2 Mock Strategy

**Service tests**: Direct mock `Db` objects with chainable API — exactly the same pattern as `venture.service.test.ts`.

```typescript
// Pattern for service tests (no app bootstrap needed)
const mockDb = {
  select: () => ({ from: () => ({ where: () => ({ orderBy: () => Promise.resolve([]) }) }) }),
  insert: () => ({ values: () => ({ returning: () => Promise.resolve([mockRecord]) }) }),
  update: () => ({
    set: () => ({ where: () => ({ returning: () => Promise.resolve([mockRecord]) }) }),
  }),
} as unknown as Db;
```

**Transaction mock** for `OrderService.create`:

```typescript
// The transaction mock must accept a callback and invoke it with a mock tx object
const mockTx = {
  select: () => ({
    from: () => ({ where: () => ({ limit: () => Promise.resolve([mockReservation]) }) }),
  }),
  insert: () => ({ values: () => ({ returning: () => Promise.resolve([mockOrder]) }) }),
};

const mockDb = {
  transaction: async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx),
} as unknown as Db;
```

**Route tests**: Use `spyOn(dbFactory, "createDb")` + `app.request()` — same pattern as `ventures.test.ts`.

**Auth token setup** (shared across test suites):

```typescript
const token = await sign(
  { sub: "uuid-user-1", role: "TOURIST", exp: Math.floor(Date.now() / 1000) + 3600 },
  TEST_ENV.JWT_SECRET,
);
```

### 6.3 Coverage Targets

| Layer                            | Target                                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Service — ReservationService** | 100% of methods, 100% of branches (role scoping, not-found)                                          |
| **Service — OrderService**       | 100% of methods, 100% of transition validation branches, all 9 valid + 13 invalid transitions tested |
| **Service — Transaction**        | 5 rollback scenarios (reservation missing, wrong user, cancelled, item missing, DB failure)          |
| **Route — reservations**         | Each endpoint: 200, 400, 401, 404, 500                                                               |
| **Route — orders**               | Each endpoint: 200, 400, 401, 403, 404, 500; PATCH status: 409                                       |
| **Integration**                  | Auth chain (roleGuard + service scoping), transaction rollback                                       |

**Test count estimate**: ~70 tests total (matching the 70 scenarios from the spec).

---

## 7. Implementation Order

This order minimizes broken state during development by building from the inside out: schema → shared types → service → routes → tests → mount.

| Step   | Files                                                      | Why This Order                                       |
| ------ | ---------------------------------------------------------- | ---------------------------------------------------- |
| **1**  | `http-status.ts` (add `HTTP_CONFLICT`, `HTTP_FORBIDDEN`)   | Zero-dependency first step                           |
| **2**  | `db/schema/reservations.ts`, `orders.ts`, `order-items.ts` | Core data model — nothing else works without it      |
| **3**  | `db/schema/index.ts`, `db/factory.ts`                      | Register schemas so `Db` type includes them          |
| **4**  | `packages/shared/*.ts` (UUID migration + input DTOs)       | Shared types needed by both service and routes       |
| **5**  | `services/reservation.service.ts`                          | No dependency on routes, depends on schemas + shared |
| **6**  | `services/reservation.service.test.ts`                     | Test immediately after implementation                |
| **7**  | `services/order.service.ts`                                | Depends on schemas + shared + transaction pattern    |
| **8**  | `services/order.service.test.ts`                           | Test immediately after implementation                |
| **9**  | `routes/reservations.ts`                                   | Depends on service + shared                          |
| **10** | `routes/reservations.test.ts`                              | Test immediately after implementation                |
| **11** | `routes/orders.ts`                                         | Depends on service + shared                          |
| **12** | `routes/orders.test.ts`                                    | Test immediately after implementation                |
| **13** | `app.ts` (mount routes)                                    | Last — routes exist and are tested before mounting   |

**Key principle**: Each step is testable before the next begins. After step 8, all services are tested. After step 12, all routes are tested. Step 13 is just wiring.

---

## Complexity Estimate

| Metric                                 | Count                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| **New files**                          | 11                                                                                    |
| **Modified files**                     | 7                                                                                     |
| **Total LOC estimate**                 | ~1,400 – 1,700                                                                        |
| — Schema definitions                   | ~120                                                                                  |
| — Shared types (UUID migration + DTOs) | ~120                                                                                  |
| — Services (implementation)            | ~350                                                                                  |
| — Routes (implementation)              | ~400                                                                                  |
| — Tests (services + routes)            | ~600                                                                                  |
| — Config/wiring changes                | ~30                                                                                   |
| **Enum declarations (DB-level)**       | 4 (`reservation_status`, `service_moment`, `order_status`, `cancel_reason`)           |
| **Drizzle table schemas**              | 3                                                                                     |
| **Zod DTOs**                           | 5 (CreateReservation, UpdateReservation, CreateOrder, UpdateOrder, UpdateOrderStatus) |

---

## Risks

| Risk                                       | Impact                                                                                                                                     | Mitigation                                                                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **First transaction code in the codebase** | `db.transaction()` API differs subtly from synchronous mock chains                                                                         | Thoroughly test the transaction mock; the mock must pass a mock `tx` object with all needed chainable methods                                            |
| **Raw SQL in service scoping**             | `sql.raw()` with table names — fragile if table names change; no compile-time checks                                                       | Keep table name strings in one place; add comment pointing to schema file                                                                                |
| **roleGuard + service scoping gap**        | ENTREPRENEUR with `roleGuard` can request any order's status transition; service-layer venture scoping isn't implemented in the first pass | The initial implementation validates role only; venture-level scoping requires the `venture_members` subquery in `updateStatus`. This is noted as a gap. |
| **Order aggregate response**               | Spec says GET /:id returns order with nested items, user, venture — but Drizzle joins across mixed PK types (UUID + serial) may be complex | Initial implementation returns the flat `OrderSelect` row without join aggregates. Full aggregate response is future work.                               |
| **Reservation aggregate with orders**      | GET /v1/reservations/:id spec says include `zzz_orders[]`                                                                                  | Initial implementation returns the reservation row only. Full aggregate requires a second query to `orders` table. Noted as a gap.                       |
| **Concurrent status update race**          | Two requests could both read SEARCHING before either commits                                                                               | Mitigated by doing the read INSIDE the transaction — second tx sees committed state. Test with sequential mock.                                          |
| **UUID migration breaking existing code**  | Changing `OrderDbSchema.zzz_id` from `z.number()` to `z.string().uuid()` breaks any code that parses existing data                         | Audit all callers before migration. The shared types are used in both mobile and backend — coordinate deployment.                                        |

---

## Next Recommended

The design is complete. The next SDD phase is **tasks** (`sdd-tasks`), which will break this design into individual implementation tasks with precise scope, dependencies, and acceptance criteria.

Key decisions made in this design that the tasks phase must preserve:

1. Transaction pattern for `OrderService.create()` and `OrderService.updateStatus()`
2. `OrderServiceError` as a lightweight HTTP-aware error class
3. Mixed FK types (UUID for new tables, integer for existing tables)
4. Role-based scoping via subqueries at the service layer
5. Price snapshot inside transaction (read from products table)
6. Status transition map as a module-level `const` in `order.service.ts`
7. Response shape inconsistency preserved (`{ message }` for auth, `{ error }` for application)
