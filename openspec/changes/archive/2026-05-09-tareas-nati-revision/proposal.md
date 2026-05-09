# Proposal: Tareas Nati Revision

## Intent

Document features discussed with Nati for future implementation. This is a planning document to organize work items by priority and scope decisions, NOT implementation.

## Scope

### In Scope
- All 6 features listed below are in scope for documentation
- Ready for GH issue creation once proposal is approved

### Out of Scope (Already Done)
- #3: "ver detalle" → "realizar pedido" text — DONE in `catalog.book_now` (es.json)
- #7: Vianda option (price 9500 ARS) — DONE in mock catalog (ID 17)

## Capabilities

### New Capabilities
- `admin-catalog-crud`: Entrepreneur admin UI to manage plates/experiences in backend
- `moment-filtering`: Filter catalog items by selected meal moment (breakfast/lunch/snack/dinner)
- `time-ranges-display`: Show hour ranges for each moment in booking flow
- `category-expansion`: Add missing categories (Cultural Activities ID 3, Safari/Nature ID 4)
- `service-time-display`: Show meal/service hour on order confirmation
- `vianda-price-confirm`: Verify vianda price (currently 9500 ARS in mock)

### Modified Capabilities
- None at spec level yet — this is planning phase

## Approach

This is a PLANNING document only. No implementation will be done.

### Priority Order
1. **Low effort**: Category expansion (add IDs 3, 4 to mock) — 1 week
2. **Low effort**: Time ranges display (config in moments.ts) — 1 week
3. **Medium**: Moment filtering in booking flow — 2-3 weeks
4. **Medium**: Service time display in orders — 1 week
5. **High**: Admin CRUD for catalog (full backend + UI) — 4-6 weeks
6. **Low**: Vianda price verification — 1 day (backend verify)

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/mobile/src/mocks/catalog.ts` | Modified | Add categories 3+4, verify vianda price |
| `apps/mobile/src/constants/moments.ts` | Modified | Add hour ranges per moment |
| `apps/mobile/src/app/tourist/booking.tsx` | Modified | Filter catalog by selected moment |
| `apps/mobile/src/app/tourist/order-confirmation.tsx` | New | Display service hour |
| `apps/mobile/src/app/entrepreneur/` | New | Admin CRUD UI section |
| `apps/backend/src/db/schema/` | New | Catalog tables |
| `packages/shared/src/types/catalog.ts` | Modified | Add moment binding field |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| No backend catalog API | High | Requires full backend implementation |
| Schema migration for moment binding | Medium | Use optional field first, migrate later |
| Admin UI requires auth/roles | Medium | Reuse existing auth infrastructure |

## Rollback Plan

No implementation in this phase. Rollback not applicable.

## Dependencies

- Backend API for catalog CRUD (no existing endpoint)
- Database schema for catalog items
- Auth/role system for entrepreneur admin access

## Success Criteria

- [ ] All 6 features documented with scope clarity
- [ ] Priority order established and approved
- [ ] GH issues created for each feature
- [ ] Backend gaps identified for admin CRUD

---

**Total Features**: 6 new capabilities
**Status**: Planning complete, ready for spec phase