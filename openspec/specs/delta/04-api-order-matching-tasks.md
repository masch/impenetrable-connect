# Task Checklist: API Order Matching & Venture Capacity Routing

## Phase 1: Infrastructure & DB Schema Refactoring

- [ ] **1.1 Update Shared Package Types**
  - Rename `zzz_catalog_type_id` to `zzz_product_category_id` in [packages/shared/src/types/order.ts](file:///home/masch/dev/js/impenetrable-connect/packages/shared/src/types/order.ts).
  - Add `zzz_product_category_id` to [packages/shared/src/types/venture.ts](file:///home/masch/dev/js/impenetrable-connect/packages/shared/src/types/venture.ts).

- [ ] **1.2 Update Shared Mocks**
  - Update mock orders and ventures in [packages/shared/src/mocks/](file:///home/masch/dev/js/impenetrable-connect/packages/shared/src/mocks/) to match new category naming and properties.

- [ ] **1.3 Update Backend Schema Definitions**
  - Rename column in [apps/backend/src/db/schema/orders.ts](file:///home/masch/dev/js/impenetrable-connect/apps/backend/src/db/schema/orders.ts).
  - Add column in [apps/backend/src/db/schema/ventures.ts](file:///home/masch/dev/js/impenetrable-connect/apps/backend/src/db/schema/ventures.ts).

- [ ] **1.4 Generate and Apply Migrations**
  - Generate Drizzle migration using `make db-generate` (or equivalent CLI tool).
  - Apply migrations and seed local database using `make db-reset` or similar.

---

## Phase 2: Implementation of API Order Matching Logic

- [ ] **2.1 Implement Routing Logic in `OrderService.create`**
  - Update `OrderService.create` in [apps/backend/src/services/order.service.ts](file:///home/masch/dev/js/impenetrable-connect/apps/backend/src/services/order.service.ts) to find the first matching venture (active, unpaused, under-capacity) sorted by `zzz_cascade_order` ascending.
  - Set the order's status to `OFFER_PENDING` with `zzz_current_offer_venture_id` on match.
  - Set the order's status to `EXPIRED` with cancel reason `NO_VENTURE_AVAILABLE` on failure.

- [ ] **2.2 Refactor Backend Routes**
  - Rename occurrences of `zzz_catalog_type_id` to `zzz_product_category_id` in [apps/backend/src/routes/orders.ts](file:///home/masch/dev/js/impenetrable-connect/apps/backend/src/routes/orders.ts).

- [ ] **2.3 Refactor Client-side Services & Mocks**
  - Rename `zzz_catalog_type_id` to `zzz_product_category_id` in [apps/mobile/src/services/product.service.ts](file:///home/masch/dev/js/impenetrable-connect/apps/mobile/src/services/product.service.ts) and [apps/mobile/src/services/order.service.ts](file:///home/masch/dev/js/impenetrable-connect/apps/mobile/src/services/order.service.ts).
  - Rename field in [apps/mobile/src/mocks/orders.ts](file:///home/masch/dev/js/impenetrable-connect/apps/mobile/src/mocks/orders.ts) and other mock data.

---

## Phase 3: Testing & Verification

- [ ] **3.1 Refactor Test Suites**
  - Update all backend and shared test files to use `zzz_product_category_id`.
  - Update client-side tests in `apps/mobile/src/__tests__/` and screens.

- [ ] **3.2 Add Order Matching Unit Tests**
  - Add scenarios in `apps/backend/src/services/order.service.test.ts` to assert that:
    - Orders are correctly assigned to the first venture in rotation.
    - Capacity is checked and exceeded capacity triggers expiration.
    - Paused ventures are skipped.

- [ ] **3.3 Run Test Validation**
  - Run `make test` and verify that all test suites pass successfully.
