# Delta for reservation — Moment-Based Catalog Filtering

## ADDED Requirements

### Requirement: Catalog Item Moment Binding

The system SHALL support an optional `zzz_service_moments` array field on `CatalogItem` that specifies which service moments the item is available for.

#### Scenario: Item with specific moments

- GIVEN a `CatalogItem` with `zzz_service_moments: ["BREAKFAST", "LUNCH"]`
- WHEN the item is displayed in the booking flow
- THEN the item SHALL be available for selection in BREAKFAST and LUNCH contexts
- AND SHALL NOT appear when SNACK or DINNER is selected

#### Scenario: Item with all moments

- GIVEN a `CatalogItem` with `zzz_service_moments: ["BREAKFAST", "LUNCH", "SNACK", "DINNER"]`
- WHEN the item is displayed in the booking flow
- THEN the item SHALL appear regardless of which moment is selected

### Requirement: Moment-Based Gastronomy Filtering

The system MUST filter gastronomy catalog items (category_id = 1) by comparing `selectedMoment` against `item.zzz_service_moments`.

#### Scenario: Filter by BREAKFAST moment

- GIVEN user selects "Desayuno" (BREAKFAST) moment
- WHEN the booking screen loads
- THEN only items with `BREAKFAST` in their `zzz_service_moments` array SHALL be displayed
- AND items without BREAKFAST SHALL be hidden

#### Scenario: Filter by DINNER moment

- GIVEN user selects "Cena" (DINNER) moment
- WHEN the booking screen loads
- THEN only items with `DINNER` in their `zzz_service_moments` array SHALL be displayed
- AND items without DINNER SHALL be hidden

#### Scenario: Filter by SNACK moment

- GIVEN user selects "Merienda" (SNACK) moment
- WHEN the booking screen loads
- THEN only items with `SNACK` in their `zzz_service_moments` array SHALL be displayed

#### Scenario: Filter by LUNCH moment

- GIVEN user selects "Almuerzo" (LUNCH) moment
- WHEN the booking screen loads
- THEN only items with `LUNCH` in their `zzz_service_moments` array SHALL be displayed

### Requirement: Excursion Moment-Agnostic Display

The system SHALL NOT filter excursion catalog items (category_id = 2) by moment. Excursions MUST always display regardless of selected moment.

#### Scenario: Excursions visible during BREAKFAST

- GIVEN user selects "Desayuno" (BREAKFAST) moment
- WHEN the booking screen loads
- THEN all excursion items (category_id = 2) SHALL be displayed
- AND excursion items SHALL NOT be filtered by `zzz_service_moments`

#### Scenario: Excursions visible during DINNER

- GIVEN user selects "Cena" (DINNER) moment
- WHEN the booking screen loads
- THEN all excursion items (category_id = 2) SHALL be displayed

## MODIFIED Requirements

### Requirement: Reservation Db Schema

The `CatalogItemSchema` in `packages/shared/src/types/catalog.ts` SHALL include an optional `zzz_service_moments` array field.

(Previously: CatalogItemSchema did not have moment binding)

#### Scenario: Schema includes moment array

- GIVEN the `CatalogItemSchema` is parsed
- WHEN a catalog item with `zzz_service_moments` is validated
- THEN the schema SHALL accept the field as a valid ServiceMoment array

#### Scenario: Schema accepts items without moments

- GIVEN a `CatalogItem` is created without `zzz_service_moments`
- WHEN the schema validates the item
- THEN the item SHALL be accepted (field is optional)

---

## Metadata

- **Domain**: reservation
- **Change**: moment-based-catalog-filtering
- **Last Updated**: 2026-05-11
