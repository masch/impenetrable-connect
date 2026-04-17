# Tourist Experience Specification

## Purpose

Define the user journey for tourists when browsing the catalog and making reservations, ensuring a proactive selection of time and date context.

## Requirements

### Requirement: Mandatory Order Context

The system MUST ensure that a tourist has selected a **Date** and a **Moment of Day** before they can browse the service catalog or initiate a reservation.

#### Scenario: Entry without context

- GIVEN a tourist is not yet in an ordering session
- WHEN they navigate to the Catalog tab
- THEN they MUST be redirected to the Order Setup screen
- AND the catalog MUST NOT be visible until selection is complete

#### Scenario: Selection completion

- GIVEN a tourist is on the Order Setup screen
- WHEN they select a valid Date (Today, Tomorrow, or Custom)
- AND they select a valid Moment (Breakfast, Lunch, Snack, or Dinner)
- AND they proceed
- THEN the system MUST save this context
- AND navigate the user to the Catalog view

### Requirement: Persistent Order Context

The system MUST maintain the active Order Context (Date, Moment, and optionally Guest Count) across the Catalog and Reservation screens until the session is completed or manually reset.

#### Scenario: Consistent context in Catalog

- GIVEN an active Order Context (e.g., "Tomorrow", "Lunch")
- WHEN browsing the Catalog
- THEN the header MUST display the active context ("Ordering for Tomorrow - Lunch")
- AND individual service selections MUST inherit this context

### Requirement: Context-Refined Reservation

The reservation process MUST focus on quantity and specific details, assuming the Date and Moment from the active context.

#### Scenario: Simplified Reservation Modal

- GIVEN an active Order Context (e.g., "Today", "Dinner")
- WHEN the user selects a service from the Catalog
- THEN the Reservation Modal MUST show the pre-selected Date and Moment as read-only or header information
- AND the user MUST only be required to select Quantity and optional Notes
- AND the "Confirm" action MUST submit the reservation using the active context

### Requirement: Context Reset

The user MUST be able to change or reset their active Order Context at any time from the Catalog view.

#### Scenario: Modifying context

- GIVEN an active Order Context
- WHEN the user clicks on the Context Header in the Catalog
- THEN they MUST be returned to the Order Setup screen (or a similar selection UI)
- AND changing the selection MUST update all subsequent reservation attempts

### Requirement: Interactive Order Summary

The Catalog MUST provide a persistent, compact summary of the current order selections without obstructing the browsing experience.

#### Scenario: Unified Footer Status

- GIVEN one or more items in the current ordering session
- WHEN browsing the Catalog
- THEN a unified single-row footer MUST be displayed
- AND it MUST show the total item count and total currency amount on the left
- AND it MUST show the active session context (date/moment) in a secondary "pill" variant on the right
- AND it MUST provide a clear "Confirm" action as the primary trigger

#### Scenario: Order Detail Toggle

- GIVEN the unified footer is visible
- WHEN the user interacts with the "Total" area (item count/amount)
- THEN a detailed list of selected services MUST expand above the footer
- AND each item in the list MUST allow individual editing or removal

### Requirement: Premium Service Presentation

Service cards MUST adhere to a minimalist, high-fidelity aesthetic to professionalize the catalog appearance.

#### Scenario: Card Visual Identity

- GIVEN a service in the catalog
- WHEN displayed as a card
- THEN it MUST use high-radius corners (min 24dp)
- AND it MUST include a translucent "pill-style" badge for its category
- AND it MUST follow strict design token constraints for all colors and typography
