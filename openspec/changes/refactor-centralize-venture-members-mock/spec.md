# Spec: Centralize Venture-Member Mock Assignments

## Context

Currently, the relationship between an entrepreneur and their venture is hardcoded in `agenda.store.ts`. This spec defines the move to a centralized mock assignment system.

## Scenarios

### 1. Unique Entrepreneur Assignment

- **Given** I am logged in as Maria (`entrepreneur_001`).
- **When** I view the Agenda.
- **Then** I should see orders for "Parador Don Esteban" (Venture 1).

### 2. Entrepreneur Switch

- **Given** I am logged in as Pepe (`entrepreneur_002`).
- **When** I view the Agenda.
- **Then** I should see orders for "Parador Bermejito" (Venture 2).

### 3. Multiple Venture Management

- **Given** an entrepreneur is assigned to multiple ventures.
- **When** I view the Agenda.
- **Then** I should see a consolidated list of orders from all assigned ventures.

### 4. No Assignment

- **Given** an entrepreneur with no assignments in `venture-members.data.ts`.
- **When** I view the Agenda.
- **Then** I should see an empty agenda (no error).

## Technical Constraints

- Must use `VentureMember` type from `@repo/shared`.
- Remove hardcoded user IDs from `agenda.store.ts`.
- Ensure `getMockAgendaOrders` is generic enough to filter by any venture ID.
