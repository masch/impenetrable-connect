# Specification: Tourist Orders Screen

## Requirements

- **Order Listing**: Display all orders belonging to the authenticated tourist.
- **Categorization**: Use a segmented control to separate "Active" orders from "History".
- **Status Mapping**:
  - Active: SEARCHING, CONFIRMED.
  - History: COMPLETED, CANCELLED, NO_SHOW.
- **Order Cards**: Show service name, date, time (localized), number of guests, and status badge.
- **Actions**:
  - SEARCHING orders must show a "Cancel" button.
  - CONFIRMED orders must show the reservation code.
- **Localization**: Full i18n support for all strings and locale-aware date/currency formatting.
- **Architecture**:
  - Centralized `AppAlert` for all alerts.
  - Centralized `Button` for all actions.
  - Zero `any` policy and strict immutability.

## Scenarios

### Scenario 1: Cancelling an order

- **Given** an order in SEARCHING status.
- **When** the user presses "Cancel".
- **Then** a confirmation `AppAlert` must be shown.
- **And** if confirmed, the order must be updated to CANCELLED.

### Scenario 2: Viewing empty history

- **Given** no orders in history status.
- **Then** a localized "No items" message must be shown instead of a blank screen.
