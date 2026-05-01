# Proposal: venture-management-and-capacity-fix

## Intent

1.  **Project Capacity Limit**: Implement a project-level maximum guest count and item quantity limit driven by `Project.zzz_max_capacity_limit`.
2.  **Venture Configuration**: Create a new screen for entrepreneurs to manage their venture's `max_capacity`. Any entrepreneur associated with the venture can edit this setting, and changes are synced across all entrepreneurs of that venture.

## Scope

### In Scope

- **Project Capacity Limit**:
  - Updating `index.tsx` (OrderSetup) and `ReservationModal.tsx` steppers to use a fixed project maximum (20).
- **Venture Configuration Screen**:
  - New screen `apps/mobile/src/app/entrepreneur/venture-config.tsx`.
  - UI for editing `zzz_max_capacity`.
- **Services**:
  - `VentureService` to handle venture-related operations.

### Out of Scope

- Real database persistence for venture changes (Mock implementation first).
- Multi-venture selection for a single user (A user belongs to 1 venture, but a venture can have multiple entrepreneurs).
- Advanced scheduling (only general pause/unpause).

## Post-MVP

- **Real-time Availability Calculation**: Evolve the steppers to cap the `guest_count` and `quantity` based on real-time availability (Venture `max_capacity` - `current_occupation`) for the selected slot. This is currently out of scope for the MVP.

## Approach

1.  **Strict TDD Workflow**:
    - Write unit tests for `VentureService` logic before implementation.
    - Write integration tests for UI steppers to verify project-level limits.
2.  **Shared Logic**:
    - Expose `zzz_max_capacity_limit` from the project context to the UI.
3.  **Entrepreneur Flow**:
    - Add a link in `entrepreneur/profile.tsx` or layout to access `venture-config`.
4.  **Data Consistency**:
    - Ensure `MOCK_VENTURES` are used as the source of truth for the config screen.

## Affected Areas

| Area                                                  | Impact   | Description                             |
| :---------------------------------------------------- | :------- | :-------------------------------------- |
| `apps/mobile/src/app/tourist/index.tsx`               | Modified | Use project-level limit for guestCount. |
| `apps/mobile/src/components/ReservationModal.tsx`     | Modified | Use project-level limit for quantity.   |
| `apps/mobile/src/app/entrepreneur/venture-config.tsx` | New      | Venture management screen.              |
| `apps/mobile/src/services/venture.service.ts`         | New      | Service for venture data.               |
| `apps/mobile/src/i18n/locales/*.json`                 | Modified | Add venture config translations.        |

## Success Criteria

- [ ] Tourists are limited by `Project.zzz_max_capacity_limit` in the steppers.
- [ ] Entrepreneurs can manage their individual `max_capacity` on the new config screen.
- [ ] Entrepreneurs can see and change their `max_capacity` on the new config screen.
- [ ] UI follows the premium "Impenetrable Connect" aesthetic (NativeWind + Custom Tokens).
