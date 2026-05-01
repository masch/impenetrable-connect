# Specification: venture-management-and-capacity-fix

## Requirements

1.  **Project-Level Guest Count Limit**: The tourist must not be able to select a guest count higher than the `Project.zzz_max_capacity_limit`.
2.  **Project-Level Item Quantity Limit**: The tourist must not be able to order more items of a certain service than the `Project.zzz_max_capacity_limit`.
3.  **Venture Configuration UI**: The entrepreneur must have a screen to view and update their venture's `max_capacity`.
4.  **Real-time Sync (Mocks)**: Changes made by one entrepreneur must be immediately visible to other entrepreneurs of the same venture (simulated via shared mock state).

## Scenarios

### 1. tourist-guest-count-limit

**GIVEN** the Project is configured with `zzz_max_capacity_limit = 20`
**WHEN** the tourist is on the `OrderSetupScreen`
**THEN** the guest count stepper should allow increasing the number up to 20
**AND** the "plus" button should be disabled when reaching 20.

### 2. tourist-item-quantity-limit

**GIVEN** the Project is configured with `zzz_max_capacity_limit = 20`
**WHEN** the tourist opens the `ReservationModal`
**THEN** the quantity stepper should be limited to 20.

### 3. venture-update-capacity

**GIVEN** the entrepreneur is logged into their venture config screen
**WHEN** they change the `max_capacity` from 20 to 30 and press "Save"
**THEN** a success alert is shown
**AND** the new capacity is reflected in the UI.

### 4. multi-entrepreneur-sync

**GIVEN** Venture A has two entrepreneurs: Maria and Pedro
**WHEN** Maria updates the capacity to 30
**THEN** Pedro sees 30 when he enters his configuration screen.
