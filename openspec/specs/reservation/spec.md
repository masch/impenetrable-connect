# Reservation Entity Specification

## Overview

This document defines the requirements for the Reservation entity in the impenetrable-connect system. Reservations track service bookings with temporal context including moment-of-day (breakfast, lunch, snack, dinner) and precise service datetime.

---

## Requirements

### Requirement: Service Moment Time Configuration

The system MUST store `startTime` and `endTime` (HH:mm format) for each `ServiceMoment` in the reservation configuration.

#### Scenario: Breakfast time range

- GIVEN `ServiceMoment` is "BREAKFAST"
- WHEN the system retrieves the moment configuration
- THEN the response SHALL include `startTime: "08:00"` and `endTime: "11:00"`

#### Scenario: Lunch time range

- GIVEN `ServiceMoment` is "LUNCH"
- WHEN the system retrieves the moment configuration
- THEN the response SHALL include `startTime: "12:00"` and `endTime: "15:00"`

#### Scenario: Snack time range

- GIVEN `ServiceMoment` is "SNACK"
- WHEN the system retrieves the moment configuration
- THEN the response SHALL include `startTime: "16:00"` and `endTime: "18:00"`

#### Scenario: Dinner time range

- GIVEN `ServiceMoment` is "DINNER"
- WHEN the system retrieves the moment configuration
- THEN the response SHALL include `startTime: "19:00"` and `endTime: "22:00"`

---

### Requirement: Timezone Support

The system MUST store a timezone identifier for each `ServiceMoment` with default "America/Argentina/Buenos_Aires".

#### Scenario: Default timezone

- GIVEN a `ServiceMoment` is configured without explicit timezone
- WHEN the moment configuration is retrieved
- THEN the timezone SHALL default to "America/Argentina/Buenos_Aires"

---

### Requirement: Service DateTime with Timezone

The system MUST store `zzz_service_at` as an ISO 8601 datetime string with timezone offset (e.g., "2024-01-15T09:30:00-03:00") instead of `zzz_service_date`.

#### Scenario: Storing service datetime with timezone

- GIVEN a reservation for 2024-01-15 at 09:30 for Breakfast
- WHEN the reservation is saved
- THEN `zzz_service_at` SHALL be "2024-01-15T09:30:00-03:00"
- AND `zzz_time_of_day` SHALL remain "BREAKFAST" for fast filtering

#### Scenario: Retrieving reservation with full datetime

- GIVEN a reservation exists with `zzz_service_at: "2024-01-15T12:30:00-03:00"`
- WHEN the reservation is retrieved
- THEN the response SHALL include the full ISO datetime with timezone

---

### Requirement: Time Selection Validation

The system MUST validate that a user-selected hour falls within the moment's allowed time range.

#### Scenario: Valid time selection

- GIVEN user selects "BREAKFAST" with time "09:30"
- WHEN the system validates the time against the moment range (08:00-11:00)
- THEN the validation SHALL pass

#### Scenario: Invalid time selection outside range

- GIVEN user selects "BREAKFAST" with time "12:30"
- WHEN the system validates the time against the moment range (08:00-11:00)
- THEN the validation SHALL fail with error "Time outside allowed range for BREAKFAST"

#### Scenario: Invalid time selection before range

- GIVEN user selects "DINNER" with time "18:00"
- WHEN the system validates the time against the moment range (19:00-22:00)
- THEN the validation SHALL fail with error "Time outside allowed range for DINNER"

---

### Requirement: Moment Time Display Helper

The system MUST provide a helper function to format a moment's time range for display.

#### Scenario: Format breakfast time range

- GIVEN a moment configuration with `startTime: "08:00"` and `endTime: "11:00"`
- WHEN `formatMomentTimeRange()` is called
- THEN the response SHALL be "08:00 - 11:00"

#### Scenario: Format dinner time range

- GIVEN a moment configuration with `startTime: "19:00"` and `endTime: "22:00"`
- WHEN `formatMomentTimeRange()` is called
- THEN the response SHALL be "19:00 - 22:00"

---

### Requirement: Timezone Type Definition

The system MUST define a reusable `Timezone` type in the shared package.

#### Scenario: Timezone type exists

- GIVEN the shared package is imported
- WHEN `Timezone` type is referenced
- THEN it SHALL be defined as a string literal type of valid IANA timezone identifiers

---

### Requirement: Reservation Db Schema

The `ReservationDbSchema` MUST use `zzz_service_at: z.string()` (ISO datetime with timezone) instead of `zzz_service_date: z.date()`.

#### Scenario: Creating reservation with datetime and timezone

- GIVEN user selects 2024-01-15 at 09:30 for Breakfast
- WHEN the reservation is created
- THEN the record SHALL include `zzz_service_at: "2024-01-15T09:30:00-03:00"`
- AND SHALL include `zzz_time_of_day: "BREAKFAST"`

#### Scenario: Reservation persists current time-of-day for filtering

- GIVEN a reservation is stored with `zzz_service_at: "2024-01-15T12:30:00-03:00"`
- WHEN queries filter by time of day
- THEN `zzz_time_of_day` SHALL contain "LUNCH" (derived from the time)

---

### Requirement: zzz_service_date (Removed)

The `zzz_service_date: z.date()` field has been replaced by `zzz_service_at` with full ISO datetime and timezone for proper timezone handling.

_Reason for removal_: ISO strings with offset carry timezone context at rest — no conversion ambiguity. Parsing is deterministic regardless of server config.

---

## Metadata

- **Domain**: reservation
- **Last Updated**: 2026-05-10
- **Source Change**: moment-time-ranges
