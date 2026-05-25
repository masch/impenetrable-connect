# Proposal: Implement Synchronous Order Matching/Routing in API Mode

## 1. Change Summary

**What**: Add synchronous order matching and routing logic to the backend (`OrderService.create`), allowing orders placed in API mode to be correctly matched and offered to an available venture. We will also add the missing `zzz_catalog_type_id` column to the `ventures` table schema in the database and the shared package to fully support the filtering specified in the master spec.

**Why**: Fixes a gap between MOCK and API modes where new orders created in API mode remain in `SEARCHING` status with `null` venture assignments, making them invisible to the entrepreneur request dashboard. By routing them synchronously on creation, the API mode will align with mock behavior and enable full end-to-end booking capability.

---

## 2. Scope

### Affected Packages & Files

| Module / Package  | File                                                                                                          | Impact / Changes                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/shared` | [venture.ts](file:///home/masch/dev/js/impenetrable-connect/packages/shared/src/types/venture.ts)             | Add `zzz_catalog_type_id` to `VentureSchema` and `CreateVentureSchema` / `UpdateVentureSchema`.                                                                                                  |
| `packages/shared` | [ventures.ts](file:///home/masch/dev/js/impenetrable-connect/packages/shared/src/mocks/ventures.ts)           | Update mock ventures array to include `zzz_catalog_type_id` (defaulting to Gastronomy `1` for the mock ventures).                                                                                |
| `apps/backend`    | [ventures.ts](file:///home/masch/dev/js/impenetrable-connect/apps/backend/src/db/schema/ventures.ts)          | Add `zzz_catalog_type_id` column referencing `product_categories.zzz_id`.                                                                                                                        |
| `apps/backend`    | [seed.ts](file:///home/masch/dev/js/impenetrable-connect/apps/backend/src/db/seed.ts)                         | Include `zzz_catalog_type_id` when seeding ventures.                                                                                                                                             |
| `apps/backend`    | [order.service.ts](file:///home/masch/dev/js/impenetrable-connect/apps/backend/src/services/order.service.ts) | Update `create` method to select the first matching, active, unpaused, under-capacity venture and set the order to `OFFER_PENDING` with that venture ID. Expire the order if no venture matches. |

### Migration Strategy

We will update the database schema for `ventures`:

1. Generate a schema migration containing the new `zzz_catalog_type_id` column on the `ventures` table.
2. Run database migration and re-run seed scripts.
3. If database changes are destructive or fail, drop the local/Neon schema and re-run migrations/seed.

---

## 3. Implementation Plan

### 3.1 Schema Changes

Update [schema/ventures.ts](file:///home/masch/dev/js/impenetrable-connect/apps/backend/src/db/schema/ventures.ts) to define `zzz_catalog_type_id`:

```typescript
import { productCategories } from "./product-categories";
// ...
export const ventures = impenetrableSchema.table("ventures", {
  // ...
  zzz_catalog_type_id: integer("zzz_catalog_type_id")
    .references(() => productCategories.zzz_id)
    .notNull(),
});
```

### 3.2 Backend Routing Logic (`OrderService.create`)

In [order.service.ts](file:///home/masch/dev/js/impenetrable-connect/apps/backend/src/services/order.service.ts), when creating an order:

1. Query all ventures matching `order.zzz_catalog_type_id` and the reservation's project ID, ordered by `zzz_cascade_order` (ascending).
2. For each venture:
   - Verify it is active and not paused (`zzz_is_active = true`, `zzz_is_paused = false`).
   - Query all existing confirmed orders at that `zzz_service_at` time:
     `current_occupation = SUM(guest_count) WHERE confirmed_venture_id = venture.id AND service_at = requested_time AND status = 'CONFIRMED'`.
   - Verify `current_occupation + guest_count <= venture.zzz_max_capacity`.
3. If a venture qualifies:
   - Insert the order with `zzz_global_status = 'OFFER_PENDING'` and `zzz_current_offer_venture_id = venture.id`.
4. If no venture qualifies:
   - Insert the order with `zzz_global_status = 'EXPIRED'` and `zzz_cancel_reason = 'NO_VENTURE_AVAILABLE'`.

---

## 4. Risks & Mitigation

| Risk                                | Severity | Mitigation                                                                                                                                      |
| ----------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Destructive migration conflict      | High     | Since we are in development, we can run `make db-reset` or drop and re-generate migrations to ensure a clean database state.                    |
| Exceeding the 400-line budget limit | Medium   | The matching algorithm is compact and fits cleanly within the existing transaction in `OrderService.create`. Tests will be updated and modular. |
| Seed/Mock data mismatch             | Low      | We will update the shared package mock ventures and seed file to populate the column correctly.                                                 |

---

## 5. Next Steps

1. **Obtain user approval** on this proposal.
2. **Interactive SDD steps**:
   - Create OpenSpec/Design (`openspec/specs/` and `openspec/designs/`).
   - Create task checklist (`openspec/tasks/`).
   - Run implementation (Apply phase).
   - Run verification and tests (Verify phase).
   - Archive changes.
