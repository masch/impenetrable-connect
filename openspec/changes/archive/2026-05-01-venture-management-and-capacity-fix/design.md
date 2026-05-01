# Design: venture-management-and-capacity-fix

## Architecture Decisions

### 1. Dynamic Venture Capacity

The system uses a dynamic, venture-controlled capacity.

- **Venture Level**: Each entrepreneur defines their own `zzz_max_capacity` via the configuration screen.
- **Tourist Flow**: The system uses the venture-specific capacity to cap the tourist's guest count and item quantity.

### 2. Venture-Level Management

Individual ventures still have their own `max_capacity` and `is_paused` flags. While the tourist UI isn't restricted by these in real-time in the MVP, the backend engine will use them during the assignment phase to filter out ventures that cannot handle the request.

### `VentureService` (New)

- `getVentureByUserId(userId: string)`: Finds the venture associated with the user via `VentureMember`.
- `updateVenture(id: number, data: Partial<Venture>)`: Updates the mock state.

### `apps/mobile/src/app/entrepreneur/venture-config.tsx` (New)

- Screen for managing the venture associated with the logged-in user.
- Includes:
  - **Max Capacity**: Numeric input to update the venture's capacity.

## Data Flow

1.  **Venture Config**: Component calls `VentureService.getVentureByUserId(currentUserId)` → Displays venture data.
2.  **Update**: User updates capacity → `VentureService.updateVenture` → Local mock state updated.
3.  **Tourist Flow**: `OrderSetupScreen` reads the venture limits → Stepper `max` prop updated (In Progress).
4.  **Catalog Flow**: `ReservationModal` reads the venture-specific capacity → Stepper `max` prop updated (In Progress).

## UI/UX

- **Colors**: Use `COLORS.primary` (#8c3d2b) and `COLORS.secondary` (#47664b).
- **Typography**: `Inter_700Bold` for headers, `Inter_400Regular` for body.
- **Feedback**: Use `impactAsync` on toggle/stepper and `AppAlert` for success/error.
