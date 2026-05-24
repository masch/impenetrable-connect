# Exploration Report: Orders Endpoints (Booking Flow)

## 1. Route Pattern Summary

### Structure

- Each entity has its own route file in `apps/backend/src/routes/` (e.g., `products.ts`, `ventures.ts`, `projects.ts`)
- Each creates a `new Hono<AppEnv>()` router, applies `authMiddleware` via `router.use("*", authMiddleware)`, then registers handlers
- Routers are exported as named exports (`{ router as venturesRouter }`) and mounted in `app.ts` via `app.route("/v1/ventures", venturesRouter)`

### Auth

- `authMiddleware` is applied per-router via `router.use("*", authMiddleware)`
- It reads `Authorization: Bearer <token>`, verifies JWT with `hono/jwt`'s `verify()`, and sets `c.set("jwtPayload", payload)`
- `roleGuard` exists in `auth.ts` but is NOT used in any current route — it checks `payload.role` against allowed roles
- `services.ts` route is explicitly public (no auth middleware)

### Validation

- **Current pattern**: Manual validation — `c.req.json()` + Zod `.parse()` inside the handler
- `@hono/zod-validator` is NOT used in any existing route
- Two validation error handling styles exist:
  - **Products**: No Zod at all — manually checks `Number(c.req.query("projectId"))` for NaN
  - **Ventures/Projects**: `c.req.json()` + `Schema.parse(body)` with catch for `ZodError` returning `error.flatten()`
- Query params are accessed raw (`c.req.query("key")`) — no Zod validation for query params

### Error Handling

- All handlers wrapped in try/catch
- `ZodError` → 400 with `{ error: "Validation failed", details: error.flatten() }`
- Other errors → 500 with `{ error: "Internal Server Error" }`
- Not-found flows → 404 with `{ error: "Not Found" }` (check service return for `undefined`)
- HTTP status codes from `../constants/http-status` (constants: HTTP_OK=200, HTTP_CREATED=201, HTTP_NO_CONTENT=204, HTTP_BAD_REQUEST=400, HTTP_NOT_FOUND=404, HTTP_INTERNAL_ERROR=500)

### Response Format

- All JSON responses use `c.json(body, statusCode)`
- Empty results return `[]` (not null)
- Single entities are returned directly (not wrapped in `{ data: ... }`)
- Delete returns `c.body(null, HTTP_NO_CONTENT)`

## 2. Service Pattern Summary

### Structure

- Static classes with `static async` methods (e.g., `VentureService`, `ProjectService`, `ProductService`)
- First argument is always `db: Db` (the Drizzle client from context)
- Additional arguments are typed inputs (e.g., `CreateVentureInput` from `@repo/shared`)

### DB Access

- All services import `type Db` from `../db` (the factory return type)
- Queries use Drizzle ORM methods: `db.select()`, `db.insert().values().returning()`, `db.update().set().where().returning()`
- No transactions used in any existing service — all operations are single-table
- No custom query builders or repository wrappers

### Return Values

- Direct object return (no wrapper)
- Single records: `const [record] = await db.select()...limit(1)` → returns record or `undefined`
- Create/Update: `const [record] = await db.insert()...returning()` → returns created/updated record
- Lists: `await db.select()...` → returns array
- Not-found handling is delegated to the route handler (service returns `undefined`, route checks)

### Error Handling

- No custom error classes in services
- No try/catch in services — errors propagate up to route handlers
- No validation in services — validation is the route's responsibility

## 3. Schema Pattern Summary

### Namespace

- All tables use `impenetrableSchema = pgSchema("impenetrable_connect")`
- Tables defined via `impenetrableSchema.table("table_name", { ... })`

### Column Naming

- **Mixed convention**: Older tables (ventures, users, venture_members, refresh_tokens) use bare `id` for PK
- **Newer tables** (products, projects, product_categories) use `zzz_id` for PK
- **Business columns**: `zzz_` prefix throughout (e.g., `zzz_name_i18n`, `zzz_is_active`, `zzz_price`)
- **Audit columns**: spread from `auditColumns`:
  ```ts
  export const auditColumns = {
    zzzCreatedAt: timestamp("zzz_created_at").defaultNow().notNull(),
    zzzUpdatedAt: timestamp("zzz_updated_at").defaultNow().notNull(),
    zzzDeletedAt: timestamp("zzz_deleted_at"),
  };
  ```

### PK Strategy

- `serial("id").primaryKey()` — auto-increment integer (ventures, venture_members)
- `serial("zzz_id").primaryKey()` — auto-increment with `zzz_` prefix (products, projects, product_categories)
- `uuid("id").primaryKey().defaultRandom()` — UUID (users, refresh_tokens)

### Foreign Keys

- `.references(() => otherTable.column)` inline in column definition
- Example: `integer("zzz_product_category_id").references(() => productCategories.zzz_id).notNull()`

### Custom Types

- JSONB: `jsonb("zzz_name_i18n").$type<Record<string, string>>().notNull()`
- Numeric: `numeric("zzz_price", { precision: 10, scale: 2 }).$type<number>().notNull()`
- Schema enums: `impenetrableSchema.enum("user_role", ["ADMIN", "ENTREPRENEUR", "TOURIST"])`

### Type Exports

```ts
export type ProductSelect = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;
```

### Indexes

- No `table => ({ ... })` second argument used in any current schema — no custom indexes defined
- Uniqueness is handled via `.unique()` on the column

### Schema Registration

- All schemas exported from `db/schema/index.ts` via `export * from "./<table>"`

## 4. Test Pattern Summary

### Framework

- Bun native test (`bun:test`) — `describe`, `it`, `expect`, `beforeAll`, `beforeEach`, `spyOn`

### DB Mocking

- `spyOn(dbFactory, "createDb").mockReturnValue(mockDb)` replaces the factory
- `resetDbCache()` called in `beforeEach` to clear the cached DB instance from `dbMiddleware`
- Mock objects follow Drizzle's chainable API:
  ```ts
  const mockDb = {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => Promise.resolve([mockRecord]),
        }),
      }),
    }),
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([mockRecord]) }) }),
    update: () => ({
      set: () => ({ where: () => ({ returning: () => Promise.resolve([mockRecord]) }) }),
    }),
  } as unknown as Db;
  ```
- Some mocks use a `then/catch` pattern for `Promise`-like behavior in simpler queries

### Auth Token Setup

- `beforeAll`: generate token via `sign()` from `hono/jwt`
  ```ts
  token = await sign(
    { sub: "1", role: "admin", exp: Math.floor(Date.now() / 1000) + 3600 },
    TEST_ENV.JWT_SECRET,
  );
  ```

### Route Testing

- `app.request(path, options, env)` — no server needed
- `env` (3rd arg) is an object with `DATABASE_URL`, `JWT_SECRET`, etc.
- Auth header: `{ headers: { Authorization: \`Bearer ${token}\` } }`
- Tests cover: 200 (success), 400 (invalid input), 401 (no auth), 500 (DB failure)
- `spyOn` is used per-test or per-suite, with `mockRestore()` after assertions

### Service Testing

- Direct mock `Db` objects passed to service methods
- No app bootstrap needed — just instantiate mock and call service
- Tests for: GET all, GET by user, create, update, soft-delete

## 5. Key Files Map

| File                                               | Role                                                          |
| -------------------------------------------------- | ------------------------------------------------------------- |
| `apps/backend/src/app.ts`                          | App bootstrap: middleware registration + route mounting       |
| `apps/backend/src/config/env.ts`                   | AppEnv type, getAppConfig() env resolver                      |
| `apps/backend/src/middleware/auth.ts`              | JWT authMiddleware + roleGuard                                |
| `apps/backend/src/middleware/db.ts`                | Drizzle client injection (cached singleton)                   |
| `apps/backend/src/constants/http-status.ts`        | HTTP status code constants                                    |
| `apps/backend/src/db/factory.ts`                   | Drizzle client factory (Neon vs postgres-js)                  |
| `apps/backend/src/db/index.ts`                     | DB re-exports                                                 |
| `apps/backend/src/db/schema/base.ts`               | `impenetrableSchema`, `auditColumns`                          |
| `apps/backend/src/db/schema/index.ts`              | Schema barrel export                                          |
| `apps/backend/src/db/schema/products.ts`           | Products table schema (closest analog to orders)              |
| `apps/backend/src/db/schema/product-categories.ts` | Product categories schema                                     |
| `apps/backend/src/db/schema/ventures.ts`           | Ventures table schema (mixed naming convention)               |
| `apps/backend/src/db/schema/users.ts`              | Users table schema (w/ enum for user_role)                    |
| `apps/backend/src/db/schema/refresh-tokens.ts`     | Refresh tokens schema                                         |
| `apps/backend/src/db/schema/projects.ts`           | Projects table schema                                         |
| `apps/backend/src/db/schema/venture-members.ts`    | Venture members join table                                    |
| `apps/backend/src/routes/products.ts`              | Products route (read-only)                                    |
| `apps/backend/src/routes/services.ts`              | Services route (public, read-only)                            |
| `apps/backend/src/routes/ventures.ts`              | Ventures route (full CRUD: GET, POST, PUT, DELETE)            |
| `apps/backend/src/routes/projects.ts`              | Projects route (GET all, GET by id, POST)                     |
| `apps/backend/src/services/product.service.ts`     | Product service (static methods)                              |
| `apps/backend/src/services/venture.service.ts`     | Venture service (static methods, full CRUD)                   |
| `apps/backend/src/services/project.service.ts`     | Project service (static methods)                              |
| `apps/backend/src/services/auth.service.ts`        | Auth service (login, create tourist, JWT)                     |
| `packages/shared/src/types/order.ts`               | Zod schemas: OrderDbSchema, OrderSchema                       |
| `packages/shared/src/types/order-item.ts`          | Zod schemas: OrderItemSchema                                  |
| `packages/shared/src/types/reservation.ts`         | Zod schemas: ReservationDbSchema, ReservationSchema           |
| `packages/shared/src/types/common.ts`              | Shared Zod enums: OrderStatusSchema, CancelReasonSchema, etc. |
| `packages/shared/src/index.ts`                     | Shared package barrel export                                  |
| `apps/backend/drizzle.config.ts`                   | Drizzle Kit config (schema filter: `impenetrable_connect`)    |

## 6. Recommendations

### What to Replicate

1. **Route structure**: Follow `ventures.ts` pattern — `new Hono<AppEnv>()`, `authMiddleware`, try/catch with ZodError handling, constant HTTP status codes
2. **Service pattern**: Static class with `db: Db` first arg — follow `VentureService` for full CRUD
3. **Schema pattern**: Use `impenetrableSchema.table()`, `auditColumns`, `zzz_` prefix for business columns — follow `products.ts` for `zzz_id` PK and JSONB types
4. **Test pattern**: `spyOn(dbFactory, "createDb")`, `resetDbCache()`, token via `sign()`, `app.request()` with env bindings
5. **Schema registration**: Export from `db/schema/index.ts`, add to factory schema mapping in `db/factory.ts`
6. **Shared types**: Zod schemas in `@repo/shared` for Create/Update DTOs — as `OrderDbSchema` already exists

### What to Avoid

1. **Manual validation without Zod**: Products checks `isNaN()` for query params — use Zod schemas consistently (follow ventures pattern)
2. **Mixed PK naming**: Use `zzz_id` for new tables (consistent with newest schema convention, not bare `id`)
3. **Missing `returning()`**: Always use `.returning()` on inserts/updates to get the created/updated record
4. **Module-level DB init**: Already warned against in `db/index.ts` — don't create a static DB instance

### What's Unique About Orders

1. **Status machine**: Orders have a lifecycle (`SEARCHING → OFFER_PENDING → CONFIRMED → COMPLETED`, or to `CANCELLED`/`EXPIRED`/`NO_SHOW`). The `PATCH /v1/orders/:id/status` endpoint needs status transition validation — enforce valid transitions server-side.
2. **Multi-table writes**: Creating an order likely involves writing to `orders` + `order_items` tables — consider a DB transaction.
3. **Domain aggregate**: The `Order` type in shared includes nested `OrderItem[]`, `User`, `Venture`, `Reservation` — the GET response should join/aggregate. The `OrderSchema` (domain aggregate) vs `OrderDbSchema` (flat row) split already exists in shared types.
4. **Reservation linkage**: Order creation may require validating the reservation exists and isn't cancelled. The `zzz_reservation_id` FK needs consideration.
5. **Catalog validation**: Order items reference `zzz_catalog_item_id` — need to validate items exist and prices match (or are snapshotted).
6. **Auth granularity**: Consider who can create orders (TOURIST role only), who can update status (ENTREPRENEUR role only). The `roleGuard` middleware exists but is unused.
7. **No existing order DB schema**: The `orders` and `order_items` tables don't exist in `db/schema/` yet — they need to be created from scratch.

### Naming Considerations

- The existing shared types use `zzz_global_status` as the column name for order status — be consistent
- Order timestamps: OrderDbSchema uses `zzz_created_at`, `zzz_confirmed_at`, `zzz_completed_at`, `zzz_cancelled_at` — some overlap with `auditColumns.zzzCreatedAt`/`zzzUpdatedAt`. Decide which to use (domain-specific status timestamps vs generic audit columns)
- The `OrderDbSchema` already defines `zzz_created_at: z.date()` independent of `auditColumns` — this is a deviation from the schema pattern. Align with `auditColumns` for `zzzCreatedAt`/`zzzUpdatedAt` but keep domain-specific timestamps (`zzz_confirmed_at`, etc.)

## 7. Questions/Unknowns

1. **Order status transitions**: What are the valid transitions? E.g., can a CONFIRMED order go back to SEARCHING? Can COMPLETED be changed? Need a status transition map for the `PATCH /:id/status` endpoint.

2. **Catalog type**: What is `zzz_catalog_type_id`? The shared types have it but no schema defines what a catalog type is. Is it the product category ID? A higher-level grouping?

3. **Pricing strategy**: When creating an order, is `zzz_price` in `order_items` snapshotted from the catalog at order time, or is it a live reference? The shared schema uses `zzz_price: z.number().nonnegative()` — suggest snapshot for audit trail.

4. **Reservation vs Order relationship**: Can an order exist without a reservation? The schema makes `zzz_reservation_id` required. Is the flow always: create reservation → create order(s) under it?

5. **Auth for PATCH status**: Who can update order status? The `roleGuard` exists but is never used. For `PATCH /:id/status`, should it be restricted to ENTREPRENEUR or ADMIN? For `POST /orders`, should it be restricted to TOURIST?

6. **Soft-delete for orders**: Should orders be soft-deletable? The `auditColumns` include `zzzDeletedAt` but for orders with status machines, deletion may not make sense. Consider omitting soft-delete and relying on status transitions.

7. **GET /v1/orders filtering**: The overview mentions `GET /v1/orders` — what filters are needed? By user? By status? By date range? By reservation? The existing GET patterns support optional query params but don't use Zod for them.

8. **What is an order in the domain**: Is an order "a group of items a tourist wants at a specific time slot"? Or "a request sent to a specific venture"? The current `OrderDbSchema` has `zzz_confirmed_venture_id` and `zzz_current_offer_venture_id`, suggesting it starts without a venture and gets assigned. This is a complex domain model that the current codebase doesn't have a parallel for.
