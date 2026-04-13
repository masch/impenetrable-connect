# Delta for Reservation

## ADDED Requirements

### Requirement: Date Selection in Reservation Modal

A user MUST be able to select a service date when making a reservation, rather than being forced to use today's date.

The ReservationModal SHALL provide:

- Quick-select chips for Today and Tomorrow
- Native date picker for custom date selection
- Display of the currently selected date

#### Scenario: Quick-select Today

- GIVEN the ReservationModal is open
- WHEN the user taps the "Today" chip
- THEN the date is set to the current date
- AND the selected date is displayed in the date field
- AND the chip shows a selected state

#### Scenario: Quick-select Tomorrow

- GIVEN the ReservationModal is open
- WHEN the user taps the "Tomorrow" chip
- THEN the date is set to tomorrow's date
- AND the selected date is displayed in the date field
- AND the chip shows a selected state

#### Scenario: Custom Date Selection Opens Picker

- GIVEN the ReservationModal is open
- AND no date chip is selected
- WHEN the user taps the date field
- THEN the native date picker is displayed
- AND the picker shows dates from Today to Today + 30 days
- WHEN the user selects a date in the picker
- THEN the picker closes
- AND the selected date is displayed in the date field

#### Scenario: Selected Date Passed to Callback

- GIVEN the user has selected a date (via chip or picker)
- WHEN the user confirms the reservation
- THEN the selected date MUST be passed to the onConfirm callback
- AND the date value MUST match the displayed date

### Requirement: Date Validation Boundaries

The date picker MUST enforce business validation rules.

The system SHALL restrict date selection to:

- Minimum: Today's date (cannot select past dates)
- Maximum: Today + 30 days (cannot book more than 30 days in advance)

#### Scenario: Past Dates Not Selectable

- GIVEN the native date picker is open
- THEN dates before today MUST NOT be selectable
- AND attempting to select shows an error or picker rejects input

#### Scenario: Beyond 30 Days Not Selectable

- GIVEN the native date picker is open
- THEN dates beyond Today + 30 days MUST NOT be selectable
- AND the max date in picker is limited to Today + 30

## MODIFIED Requirements

### Requirement: Reservation Flow Includes Date

A user MUST be able to reserve a service for a specific date, not only for today.

(Previously: Date was implicitly set to today's date with no user control)

#### Scenario: Complete Reservation Flow

- GIVEN a service is displayed in the catalog
- WHEN the user taps to reserve
- THEN the ReservationModal opens
- AND includes a date selection section with Today/Tomorrow chips
- AND includes moment of day selection
- AND includes quantity selection
- AND allows adding notes
- WHEN the user selects date, moment, quantity
- AND taps confirm
- THEN the order is created with the selected date
- AND the order includes service_date from the user's selection
