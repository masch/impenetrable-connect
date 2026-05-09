# Tasks: Tareas Nati Revision

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 150-250 |
| 400-line budget risk | Low |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Mobile) → PR 2 (Backend + Admin) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Moment filtering, time ranges, category expansion | PR 1 | UI/mocking only; base = main |
| 2 | Admin CRUD, service time display, vianda price | PR 2 | Requires backend API; base = main |

## Phase 1: Data & Configuration (PR 1)

- [ ] 1.1 Update `moments.ts` — Add hour ranges: BREAKFAST 7:00-11:00, LUNCH 12:00-15:30, SNACK 16:00-18:30, DINNER 19:00-22:00
- [ ] 1.2 Update `catalog.ts` mock — Add moment binding field to items (optional for Phase 1)
- [ ] 1.3 Update `catalog.ts` mock — Add categories ID 3 (Cultural Activities) and ID 4 (Safari/Nature)

## Phase 2: UI Filtering (PR 1)

- [ ] 2.1 Update `booking.tsx` — Add moment selector dropdown/tabs before catalog display
- [ ] 2.2 Filter catalog items in `booking.tsx` based on selected moment from context/state
- [ ] 2.3 Display hour ranges next to moment selector using values from `moments.ts`

## Phase 3: Order Service Time (PR 2)

- [ ] 3.1 Create `order-confirmation.tsx` — Display selected moment and time range
- [ ] 3.2 Pass moment context from booking flow to order confirmation screen

## Phase 4: Admin CRUD (PR 2)

- [ ] 4.1 Define DB schema: `catalog_items` table (id, name, description, price, category_id, moment_ids[], entrepreneur_id, created_at, updated_at)
- [ ] 4.2 Create backend API: `GET /api/catalog` (list items for entrepreneur)
- [ ] 4.3 Create backend API: `POST /api/catalog` (create new item)
- [ ] 4.4 Create backend API: `PUT /api/catalog/:id` (update item)
- [ ] 4.5 Create backend API: `DELETE /api/catalog/:id` (soft delete item)
- [ ] 4.6 Create entrepreneur admin page `apps/mobile/src/app/entrepreneur/catalog/` — List view with CRUD buttons
- [ ] 4.7 Add form modal for create/edit catalog item with fields: name, description, price, category, moment selection

## Phase 5: Verification

- [ ] 5.1 PR 1 — Verify moment filtering shows correct items per time range
- [ ] 5.2 PR 1 — Verify categories 3, 4 appear in catalog
- [ ] 5.3 PR 2 — Verify vianda price (9500 ARS) in order confirmation
- [ ] 5.4 PR 2 — Verify admin CRUD operations persist to DB