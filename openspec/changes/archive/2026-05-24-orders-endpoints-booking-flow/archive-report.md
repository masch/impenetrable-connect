# Archive Report: orders-endpoints-booking-flow

**Archived**: 2026-05-24
**Change Key**: `orders-endpoints-booking-flow`
**PR**: #212, #214, #215, #216

---

## Implementation Summary

Implemented the complete backend orders and reservations booking flow on the custom database schema, featuring status machine validations, transactional order creation with price snapshots, and role-scoped scoping for lists and retrievals.

### Tasks Completed

| Task      | Description                                                         | Status |
| --------- | ------------------------------------------------------------------- | ------ |
| **T-001** | Add HTTP_CONFLICT and HTTP_FORBIDDEN constants                      | ✅     |
| **T-002** | Migrate shared Zod schemas to UUID + add input DTOs                 | ✅     |
| **T-003** | Create Drizzle schemas for reservations, orders, order items        | ✅     |
| **T-004** | Register schemas in db/schema/index.ts and db/factory.ts            | ✅     |
| **T-005** | Implement ReservationService with role-scoping and validations      | ✅     |
| **T-006** | Implement OrderService core with status transitions and filters     | ✅     |
| **T-007** | Implement OrderService transactional methods (create, updateStatus) | ✅     |
| **T-008** | Implement reservation routes + route tests                          | ✅     |
| **T-009** | Implement order routes + route tests                                | ✅     |
| **T-010** | Mount ordersRouter in app.ts                                        | ✅     |

---

## Files Changed

| File                                                    | Action   | Details                                                |
| ------------------------------------------------------- | -------- | ------------------------------------------------------ |
| `packages/shared/src/types/order.ts`                    | Modified | Migrated schema to UUIDs, added input DTO schemas      |
| `packages/shared/src/types/reservation.ts`              | Modified | Migrated schema to UUIDs, added input DTO schemas      |
| `packages/shared/src/types/order-item.ts`               | Modified | Migrated schema to UUIDs                               |
| `apps/backend/src/constants/http-status.ts`             | Modified | Added 403 and 409 status codes                         |
| `apps/backend/src/db/schema/reservations.ts`            | Created  | Database schema for reservations                       |
| `apps/backend/src/db/schema/orders.ts`                  | Created  | Database schema for orders with enums                  |
| `apps/backend/src/db/schema/order-items.ts`             | Created  | Database schema for order items                        |
| `apps/backend/src/db/schema/index.ts`                   | Modified | Exported new tables                                    |
| `apps/backend/src/db/factory.ts`                        | Modified | Registered new schemas                                 |
| `apps/backend/src/services/reservation.service.ts`      | Created  | Service layer for reservations, role-scoped queries    |
| `apps/backend/src/services/reservation.service.test.ts` | Created  | 22 unit tests for ReservationService                   |
| `apps/backend/src/services/order.service.ts`            | Created  | Service layer for orders, transactions, price snapshot |
| `apps/backend/src/services/order.service.test.ts`       | Created  | 29 unit tests for OrderService                         |
| `apps/backend/src/routes/reservations.ts`               | Created  | Route handlers for reservations, role guards           |
| `apps/backend/src/routes/reservations.test.ts`          | Created  | Route-level tests for reservations                     |
| `apps/backend/src/routes/orders.ts`                     | Created  | Route handlers for orders, role guards, error mapping  |
| `apps/backend/src/routes/orders.test.ts`                | Created  | 26 route-level tests for orders                        |
| `apps/backend/src/app.ts`                               | Modified | Mounted ordersRouter                                   |

---

## Test Results

| Metric                                      | Value     |
| ------------------------------------------- | --------- |
| Total backend tests passing                 | 198       |
| `make check` (format, typecheck, lint, gga) | ✅ Passes |

---

## Deviations from Design

- T-010 mounts only `ordersRouter` (task scope was narrowed to orders per user prompt). The `reservationsRouter` mount was not included in that PR but was mounted in a subsequent pull request.
- Used `as never` cast for `OrderServiceError.httpStatus` due to Hono's ContentfulStatusCode type constraint.
- Used `as string` for `c.req.param("id")` since Hono types it as `string | undefined`.

---

## Archive Contents

| #   | Artifact            | Description                                              |
| --- | ------------------- | -------------------------------------------------------- |
| 1   | `proposal.md`       | Original change proposal                                 |
| 2   | `spec.md`           | Standalone specifications                                |
| 3   | `explore.md`        | Exploration notes and codebase audit                     |
| 4   | `design.md`         | System design, database schemas, and service transitions |
| 5   | `tasks.md`          | Complete task breakdown                                  |
| 6   | `apply-progress.md` | Execution progress and TDD cycle evidence                |
| 7   | `archive-report.md` | This file — archive summary                              |

---

## Verification

- [x] All 10 tasks verified complete
- [x] Backend tests passing (198/198)
- [x] `make check` passes
- [x] Change folder moved to archive
