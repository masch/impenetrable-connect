# Reservation Management Specification

## Purpose

The Reservation Management system is responsible for grouping multiple service requests (Gastronomy, Activities, etc.) from a single tourist into a unified customer journey. It acts as the bridge between the tourist's intent and the system's equitable assignment logic.

## Requirements

### Requirement: Reservation Lifecycle

The system MUST manage a `Reservation` as the root entity for all tourist requests made for a specific date and moment (Time Of Day).

#### Scenario: Creating a multi-item reservation

- GIVEN a tourist with an active session
- WHEN the tourist selects "Empanadas" (Gastronomy) and "Horseback Riding" (Activities) for "Tomorrow - Lunch"
- THEN the system SHALL create a single `Reservation` record
- AND the system SHALL create two separate `Order` records (one for Gastronomy, one for Activities) linked to that Reservation
- AND the Reservation status SHALL remain `PENDING` until all child Orders are resolved.

### Requirement: Automatic Order Splitting

The system MUST automatically split a Reservation into multiple `Order` records based on the `CatalogType` of the requested items.

#### Scenario: Splitting items by type

- GIVEN a Reservation containing items of types "Gastronomy" and "Guide Services"
- WHEN the reservation is confirmed by the tourist
- THEN the system MUST create exactly one `Order` for the "Gastronomy" group
- AND exactly one `Order` for the "Guide Services" group
- AND each `Order` MUST contain its respective `OrderItem` details.

### Requirement: Reservation Status Aggregation

The system SHALL determine the status of a `Reservation` based on the status of its constituent `Orders`.

#### Scenario: Partial confirmation

- GIVEN a Reservation with two Orders (A and B)
- WHEN Order A is `CONFIRMED` by a venture but Order B is still `SEARCHING`
- THEN the Reservation status SHALL be `PARTIALLY_CONFIRMED`
- AND the tourist SHOULD see which parts of their journey are secured.
