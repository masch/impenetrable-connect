# Exploration: Tareas Nati Revision

## Current State

### Emprendedor Features

1. **Admin: sección para cargar platos/experiencias** — **GAP**: No admin UI exists for managing plates/experiences. All catalog items are hardcoded in `apps/mobile/src/mocks/catalog.ts`. The entrepreneur can only configure venture status (paused/active) and capacity in `venture-config.tsx`.

2. **Orden del día: hora del servicio/comida** — **PARTIAL**: Users select a moment (BREAKFAST, LUNCH, SNACK, DINNER) on the order setup screen (`tourist/index.tsx`). The selected moment is stored in `zzz_reservation.zzz_time_of_day`. However, NO specific hour ranges are defined per moment (e.g., no "08:00-10:00" for breakfast).

### Turista Features

3. **Texto "ver detalle" → "realizar pedido"** — **DONE**: The translation key `catalog.book_now` is already "Realizar pedido" in Spanish (`apps/mobile/src/i18n/locales/es.json` line 114). The button displays this text in `ServiceCard.tsx` (line 103-106).

4. **Filtrado por momento del día** — **GAP**: No filtering in booking flow. All gastronomy services display regardless of the selected moment (breakfast/lunch/snack/dinner). The moment is selected BEFORE booking, but doesn't filter the catalog.

5. **Rango horario en pedido** — **GAP**: Only the 4 moment IDs exist (BREAKFAST, LUNCH, SNACK, DINNER) with icons/colors, but NO time ranges are defined. Each moment is just a label, not a time window.

6. **Menú con categorías: Gastronomía, Actividades Culturales, Safari** — **PARTIAL**: Currently has 2 categories:
   - Category ID 1: Gastronomía (Gastronomy)
   - Category ID 2: Excursiones (Excursions)
   - Category ID 3+: Does NOT exist. Safari and Cultural Activities categories need to be added.

7. **Vianda** — **DONE**: Exists in mock catalog with ID 17, price 9500 ARS (`apps/mobile/src/mocks/catalog.ts` lines 270-282).

## Affected Areas

| File                                                  | Impact                                       |
| ----------------------------------------------------- | -------------------------------------------- |
| `apps/mobile/src/mocks/catalog.ts`                    | Hardcoded catalog items; needs admin CRUD    |
| `apps/mobile/src/constants/moments.ts`                | Service moments without hour ranges          |
| `apps/mobile/src/app/tourist/booking.tsx`             | No filtering by moment in catalog display    |
| `apps/mobile/src/app/tourist/index.tsx`               | Order setup with moment selection            |
| `apps/mobile/src/app/entrepreneur/venture-config.tsx` | Only capacity/pause, no menu config          |
| `packages/shared/src/types/catalog.ts`                | Schema for catalog items (no moment binding) |
| `packages/shared/src/types/service-category.ts`       | Categories only have ID, no type enum        |
| `apps/backend/src/db/schema/`                         | No catalog tables exist (all mocked)         |

## Approaches

### 1. Add Admin CRUD for Plates/Experiences

- **Pros**: Complete control for entrepreneurs, dynamic menu
- **Cons**: Requires backend API, database schema, admin UI
- **Effort**: High

### 2. Filter Catalog by Moment

- **Pros**: Better UX, shows only relevant items per meal time
- **Cons**: Requires schema change to bind items to moments
- **Effort**: Medium

### 3. Add Time Ranges to Moments

- **Pros**: Clear user expectations, validation possible
- **Cons**: May restrict flexibility, needs UI for display
- **Effort**: Low (config change)

### 4. Add Safari/Cultural Activity Categories

- **Pros**: Complete the category set requested
- **Cons**: Needs mock data and potentially new service types
- **Effort**: Low (mock data + category ID)

## Recommendation

Prioritize in this order:

1. **Low-hanging fruit**: Add Safari category (ID 3) to mocks — already have gastronomy/excursions structure
2. **High value**: Add moment filtering to booking — major UX improvement
3. **Required**: Admin CRUD for plates/experiences — core business need

The time ranges can be added later as configuration, not blocking.

## Risks

- **Backend gap**: No catalog API exists; all is mocked in mobile
- **Schema change**: Binding items to moments requires schema migration
- **Testing**: Moment filtering needs e2e tests to verify correct items show

## Ready for Proposal

**Yes** — Enough clarity to create a proposal. The main decisions needed:

1. Scope: Which features to include in first iteration
2. Data model: How to store moment bindings (new field? separate table?)
3. Admin UX: Simple list or full CRUD with images/pricing?

Recommend proceeding to **sdd-propose** with scope focused on moment filtering + category expansion as the first tranche.
