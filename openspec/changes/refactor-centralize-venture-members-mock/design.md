# Design: Centralize Venture-Member Mock Assignments

## Architecture Overview

The solution moves the entrepreneur-venture relationship from hardcoded logic in stores to a centralized mock data system that mirrors the database structure (`VentureMember` table).

## Proposed Components

### 1. Mock Data: `apps/mobile/src/mocks/venture-members.data.ts`

- Purpose: Single Source of Truth for mock assignments.
- Export: `MOCK_VENTURE_MEMBERS: VentureMember[]`.
- Sample Data:
  - `entrepreneur_001` -> `venture_id: 1`
  - `entrepreneur_002` -> `venture_id: 2`
  - `entrepreneur_003` -> `venture_id: 3`
  - `entrepreneur_004` -> `venture_id: 4`

### 2. Mock Logic: `apps/mobile/src/mocks/venture-members.ts`

- Helper function: `getVentureIdsByUserId(userId: string): number[]`.
- Returns all venture IDs associated with the user in the mock data.

### 3. Store Update: `apps/mobile/src/stores/agenda.store.ts`

- Current: Checks for `entrepreneur_001` ID.
- New:
  1. Get current user ID from `mockGetCurrentUser()`.
  2. Call `getVentureIdsByUserId(userId)`.
  3. Fetch agenda for each venture ID found.
  4. Consolidate results.

### 4. Agenda Logic: `apps/mobile/src/mocks/agenda.ts`

- Update `getMockAgendaOrders` to accept `ventureId: number`.
- Filter `getAllMockOrders()` based on the provided `ventureId`.

## Alternatives Considered

- **Directly adding `venture_id` to `User` entity**: Rejected because it violates the real DB schema where users can manage multiple ventures.
- **Hardcoding in `auth.store.ts`**: Rejected because auth should only handle credentials and user profile, not business assignments.
