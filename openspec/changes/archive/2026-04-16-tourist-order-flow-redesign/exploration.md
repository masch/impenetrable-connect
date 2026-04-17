## Exploration: Tourist Order Flow Redesign

### Current State

Today, the tourist flow is reactive and will be **fully replaced**:

1. User goes to **Catalog**.
2. User browses all services.
3. User selects a service.
4. **ReservationModal** opens to select Date, Moment, Quantity, and Notes.

We are moving to a **Mandatory Proactive Flow**:

1. User MUST select Date and Moment first.
2. User enters Catalog with persistent context.
3. **ReservationModal** only handles Quantity and Notes.

### Affected Areas

- `apps/mobile/src/app/tourist/_layout.tsx` — Navigation change to make setup the entry point.
- `apps/mobile/src/app/tourist/catalog.tsx` — Redirect to setup if context is missing.
- `apps/mobile/src/components/ReservationModal.tsx` — REMOVAL of date/moment selection logic.
- `apps/mobile/src/app/tourist/order-setup.tsx` (New) — Initial selection screen.
- `apps/mobile/src/stores/order-context.store.ts` (New) — Persistence of the "Active Ordering Session".
- `apps/mobile/src/i18n/locales/es.json` — New strings for the setup screen.

### Approaches

1. **Modal Blocking Approach** — When entering the Catalog, if no date/moment is selected, show a full-screen modal to pick them.
   - Pros: Simple to implement, keeps the Catalog as the main entry.
   - Cons: Can be disruptive if the user just wants to browse.
   - Effort: Low

2. **Multi-Step Flow Approach** — Create a dedicated `/tourist/order-setup` screen that acts as the entry point.
   - Pros: Clean UX, clear intent ("I am starting an order"), highly scalable for future filtering (category, guest count).
   - Cons: Adds an extra click for browsing-only users (though they can probably skip it).
   - Effort: Medium

3. **In-Catalog Toolbar** — Keep the Catalog as index, but add a prominent "Ordering for: [Date] [Moment]" toolbar at the top that can be expanded to change settings.
   - Pros: Context is always visible and editable without leaving the screen.
   - Cons: Cramped UI on smaller screens, complexity in coordinate state with the modal.
   - Effort: High

### Recommendation

I recommend **Approach 2 (Multi-Step Flow)**. By separating the "When" from the "What", we simplify the cognitive load. The user defines their context first, and then enters a "Locked" catalog view where everything they see is relevant to their chosen time.

### Risks

- **Store Sync**: Ensuring that the `CatalogStore` (fetching services) and the `OrderContextStore` (filtering/selecting) stay in sync if availability depends on the time.
- **Back Navigation**: Handling the case where a user wants to change the date/moment after entering the catalog.
- **Guest Context**: The user mentioned selecting "Date" and "Moment", but ofter "Quantity" is also global for an order. We should consider if guest count belongs in the setup too.

### Ready for Proposal

Yes. The requirements are clear and the technical impact is well-understood. I will propose a solution centered on a new `order-setup` screen and a shared context store.
