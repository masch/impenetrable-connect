# Tasks: Orders Endpoints (Booking Flow)

## Review Workload Forecast

| Field                   | Value                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| Estimated changed lines | ~1,390                                                                                    |
| 400-line budget risk    | High                                                                                      |
| Chained PRs recommended | Yes                                                                                       |
| Suggested split         | PR 1 (Foundation) → PR 2 (Reservations) → PR 3 (Orders Core) → PR 4 (Orders Transactions) |
| Delivery strategy       | ask-on-risk                                                                               |
| Chain strategy          | pending                                                                                   |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal                                     | Likely PR | Notes                                         |
| ---- | ---------------------------------------- | --------- | --------------------------------------------- |
| 1    | Foundation (schema, types, constants)    | PR 1      | Base: main. ~235 lines                        |
| 2    | Reservation endpoints (service + routes) | PR 2      | Base: PR 1. ~440 lines                        |
| 3    | Order core service + routes              | PR 3      | Base: PR 1. ~520 lines (read + update routes) |
| 4    | Order transactions + mount               | PR 4      | Base: PR 3. ~195 lines (create, updateStatus) |

---

## Phase 1: Foundation

**Dependency**: None

- [x] **T-001** — Add `HTTP_CONFLICT` (409) and `HTTP_FORBIDDEN` (403) to `apps/backend/src/constants/http-status.ts`  
       _Files_: `apps/backend/src/constants/http-status.ts` | _Est_: 5 lines | _Dep_: — | _TDD_: no

- [x] **T-002** — Migrate shared Zod schemas to UUID (order.ts, reservation.ts, order-item.ts) + add 5 input DTOs (CreateReservationInput, UpdateReservationInput, CreateOrderInput, UpdateOrderInput, UpdateOrderStatusInput)  
       _Files_: `packages/shared/src/types/order.ts`, `packages/shared/src/types/reservation.ts`, `packages/shared/src/types/order-item.ts` | _Est_: 100 lines | _Dep_: — | _TDD_: yes

- [x] **T-003** — Create Drizzle table schemas: `reservations` table (with `reservation_status` + `service_moment` enums), `orders` table (with `order_status` + `cancel_reason` enums), `order_items` table  
       _Files_: `apps/backend/src/db/schema/reservations.ts`, `apps/backend/src/db/schema/orders.ts`, `apps/backend/src/db/schema/order-items.ts` | _Est_: 120 lines | _Dep_: — | _TDD_: no

- [x] **T-004** — Register new schemas in `db/schema/index.ts` (3 exports) and `db/factory.ts` (schema object + imports)  
       _Files_: `apps/backend/src/db/schema/index.ts`, `apps/backend/src/db/factory.ts` | _Est_: 10 lines | _Dep_: T-003 | _TDD_: no

## Phase 2: Services

**Dependency**: T-002, T-004

- [x] **T-005** — Implement `ReservationService` (create, getById, getAll with role-scoped subqueries, update) + unit tests (100% method coverage, role-scoping branches, empty/not-found cases)  
       _Files_: `apps/backend/src/services/reservation.service.ts`, `apps/backend/src/services/reservation.service.test.ts` | _Est_: 160 lines | _Dep_: T-002, T-004 | _TDD_: yes

- [ ] **T-006** — Implement `OrderService` core (status machine map, isValidTransition, isTerminal, getById, getAll with role-scoped filters, update with terminal-status guard, getByReservationId) + unit tests  
       _Files_: `apps/backend/src/services/order.service.ts`, `apps/backend/src/services/order.service.test.ts` | _Est_: 200 lines | _Dep_: T-002, T-004 | _TDD_: yes

- [ ] **T-007** — Implement `OrderService` transactional methods (create with price snapshot + item validation + reservation checks, updateStatus with transition validation + timestamp side effects + race-condition prevention) + `OrderServiceError` class + unit tests  
       _Files_: `apps/backend/src/services/order.service.ts`, `apps/backend/src/services/order.service.test.ts` | _Est_: 190 lines | _Dep_: T-006 | _TDD_: yes

## Phase 3: Routes & Wiring

**Dependency**: T-001, T-005, T-007

- [x] **T-008** — Implement reservation routes (POST `/` with roleGuard TOURIST, GET `/`, GET `/:id`, PATCH `/:id` with future-date + non-cancelled checks) + route tests (each endpoint: 200, 400, 401, 404, 500; PATCH: 403)  
       _Files_: `apps/backend/src/routes/reservations.ts`, `apps/backend/src/routes/reservations.test.ts` | _Est_: 280 lines | _Dep_: T-001, T-005 | _TDD_: yes

- [x] **T-009** — Implement order routes (POST `/` with roleGuard TOURIST + OrderServiceError mapping, GET `/` with filters, PATCH `/:id` with terminal-check, PATCH `/:id/status` with roleGuard ENTREPRENEUR/ADMIN) + route tests  
       _Files_: `apps/backend/src/routes/orders.ts`, `apps/backend/src/routes/orders.test.ts` | _Est_: 320 lines | _Dep_: T-001, T-007 | _TDD_: yes

- [x] **T-010** — Mount `ordersRouter` at `/v1/orders` in `app.ts`  
       _Files_: `apps/backend/src/app.ts` | _Est_: 5 lines | _Dep_: T-009 | _TDD_: no

---

## Dependency Graph

```
T-001 ─┐
T-002 ─┤
T-003 ─┤
       ├──→ T-004 → T-005 → T-008 →┐
       │                            ├──→ T-010
       └──→ T-006 → T-007 → T-009 →┘
```

Parallel: T-001, T-002, T-003 (no deps). Sequential: T-004 (needs T-003), T-005 (needs T-002, T-004), T-006 (needs T-002, T-004), T-007 (needs T-006), T-008 (needs T-001, T-005), T-009 (needs T-001, T-007), T-010 (needs T-008, T-009).

## Implementation Slices

| Slice | Tasks                           | Est Lines | Description                                                              |
| ----- | ------------------------------- | --------- | ------------------------------------------------------------------------ |
| PR 1  | T-001 → T-004                   | ~235      | Foundation: HTTP consts, shared DTOs, DB schemas, registration           |
| PR 2  | T-005 → T-008                   | ~440      | Reservation endpoints: service + routes + route tests                    |
| PR 3  | T-006 → T-009                   | ~520      | Order core + read routes: service core, get/list routes + tests          |
| PR 4  | T-007 → (rest of T-009) + T-010 | ~195      | Order transactions: create, updateStatus + remaining route tests + mount |

**Recommended chain strategy**: Stacked PRs to main. Each slice is independently verifiable. PR 1 is pure infra with no auth dependency. PRs 2–4 each add testable endpoints.
