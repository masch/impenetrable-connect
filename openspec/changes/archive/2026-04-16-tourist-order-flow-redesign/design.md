# Design: Tourist Order Flow Redesign

## Technical Approach

We will implement a mandatory context-first ordering flow. The system will ensure that a `date` and `moment` (time slot) are selected before the user can browse the catalog. This state will be managed by a new Zustand store and enforced via navigation guards.

## Architecture Decisions

### Decision: State Management for Ordering Session

**Choice**: Use a new Zustand store `useOrderContextStore`.
**Alternatives considered**: Passing props via navigation params, using existing `CatalogStore`.
**Rationale**: Context needs to be global across Catalog, Reservation, and potentially a new Order Review screen. Navigation params are too fragile for this. existing `CatalogStore` is already large and focused on service fetching.

### Decision: Entry Point and Navigation Guard

**Choice**: Make `/tourist/` (index) the `OrderSetupScreen`. Redirect from `Catalog` to index if context is missing.
**Alternatives considered**: Using a full-screen modal in Catalog.
**Rationale**: Provides a cleaner "Wizard" experience. It establishes a clear progression: Setup → Catalog → Reservation.

## Data Flow

    [OrderSetupScreen] ────▶ [OrderContextStore] ◀──── [CatalogScreen]
            │                        ▲                       │
            │                        │                       │
      (sets context)           (reads context)         (enforces context)
            │                        │                       │
            └────────────────────────┴────────▶ [ReservationModal]
                                                     (submits context)

### Decision: Compact Footer Layout (Unified Row)

**Choice**: Consolidate Order Summary, Session Info, and Confirm CTA into a single high-density row.
**Alternatives considered**: Traditional two-row layout (Total top, Confirm bottom).
**Rationale**: Mobile screens (especially on Android and Web with address bars) have limited vertical real estate. A single-row layout maximizes the browsable catalog area.
**Trade-offs**: Requires highly specific typography and padding tuning to avoid overflow on narrow devices.

### Decision: Strict Design Token Enforcement (GGA Compliance)

**Choice**: Prohibit all hardcoded hex colors in favor of the centralized `COLORS` token system.
**Alternatives considered**: Allowing local constants for component-specific colors.
**Rationale**: Ensures brand consistency and satisfies automated "Gentleman Guardian Angel" (GGA) architecture reviews. It facilitates global theme updates (e.g., dark mode) from a single source of truth.

## File Changes

| File                                              | Action | Description                                                                                                 |
| ------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `apps/mobile/src/stores/order-context.store.ts`   | Create | New store to manage `selectedDate`, `selectedMoment`, and `guestCount`.                                     |
| `apps/mobile/src/app/tourist/index.tsx`           | Modify | Replaces current redirect with the `OrderSetupScreen` UI.                                                   |
| `apps/mobile/src/app/tourist/catalog.tsx`         | Modify | Implements unified single-row footer with interactive total panel and session pill. Enforces design tokens. |
| `apps/mobile/src/components/ServiceCard.tsx`      | Modify | Upgraded to premium aesthetics: rounded-3xl, translucent category badges, refined typography.               |
| `apps/mobile/src/components/ReservationModal.tsx` | Modify | Remove internal date/moment selection. Read from `OrderContextStore`. Standardized colors.                  |
| `apps/mobile/src/components/Button.tsx`           | Modify | Enhanced to support optional titles/children for icon-only and complex footer layouts.                      |
| `apps/mobile/src/components/AppAlert.tsx`         | Modify | Converted to strict design tokens for all icons and background colors.                                      |
| `apps/mobile/src/i18n/locales/*.json`             | Modify | Added pluralization keys and standard catalog labels.                                                       |

## Interfaces / Contracts

```typescript
// useOrderContextStore
interface OrderContextState {
  selectedDate: Date | null;
  selectedMoment: TimeOfDay | null;
  guestCount: number;

  // Actions
  setContext: (date: Date, moment: TimeOfDay, guests?: number) => void;
  resetContext: () => void;
  isValid: () => boolean;
}
```

## Testing Strategy

| Layer       | What to Test          | Approach                                                           |
| ----------- | --------------------- | ------------------------------------------------------------------ |
| Unit        | `OrderContextStore`   | Test state updates and validation logic.                           |
| Integration | `Catalog` redirection | Verify that entering Catalog without context triggers a redirect.  |
| Integration | `ReservationModal`    | Verify it correctly receives data from the store instead of props. |

## Migration / Rollout

No data migration required as this is purely a frontend flow change and existing mock/API endpoints support individual reservation parameters.

## Open Questions

- [x] **Guest Count**: Should it be part of the initial setup? _Decision: Yes, it completes the "Context" for the order._
- [ ] **Moment Availability**: Should the moments be limited based on "Today's" current time? (e.g. if it's 2 PM, don't show Breakfast/Lunch for today).
