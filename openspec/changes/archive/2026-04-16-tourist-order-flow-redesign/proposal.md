## Changed Details: Redesign Order Flow

### Intent

Replace the existing reactive order flow (Service -> Date/Moment) with a mandatory proactive flow (Date/Moment -> Catalog). This ensures tourists choose their context first, providing a more natural "shopping" experience.

### Impact

- **Mandatory Context**: Users must select a date and moment before seeing the catalog (or as the first step of entering it).
- **Simplified Reservations**: The `ReservationModal` will no longer handle date/moment selection, reducing complexity and potential errors.
- **Improved UX**: Clearer "Session" feeling for ordering.

### Strategy

1. **Context Store**: Implement `useOrderContextStore` using Zustand to track `selectedDate`, `selectedMoment`, and `guestCount`.
2. **Order Setup Screen**: Create a high-fidelity screen for initial selection.
3. **Navigation Guard/Flow**: Update `tourist/_layout.tsx` or `catalog.tsx` to ensure the setup is completed before browsing.
4. **Modal Cleanup**: Strip `DatePicker` and `MomentSelection` from `ReservationModal.tsx`.

### Non-Goals

- Changing the backend API (we will continue to use the same reservation endpoints).
- Implementing global cart (for now, reservations remain per-service but with shared context).

### Alternatives Considered

- **In-catalog headers**: Rejected to keep the UI clean and focus on the selection as a "gate".
- **Conditional Modal**: Keep selection in the modal if context is missing. Rejected per user request to replace the flow entirely.
