# Venture State Specification

## Purpose

Centralize venture collection and selection state management via Zustand store, replacing scattered direct service calls. Mirrors `project.store.ts` pattern. Works with both mock and REST service implementations.

## Requirements

### Requirement: Store State Shape

The store MUST expose typed state: `ventures[]`, `selectedVenture`, `isLoading`, `isSaving`, `error`.

**Strength**: MUST

#### Scenario: Initial state is empty and idle

- GIVEN the app initializes the store
- WHEN `useVentureStore` is first called
- THEN `ventures` equals empty array
- AND `selectedVenture` is null
- AND `isLoading` is false
- AND `isSaving` is false
- AND `error` is null

---

### Requirement: Fetch Ventures

The store MUST provide `fetchVentures` action that loads all ventures and sets `isLoading` during the request.

**Strength**: MUST

#### Scenario: Successfully fetch ventures

- GIVEN the store is in idle state
- WHEN component calls `useVentureStore.getState().fetchVentures()`
- THEN `isLoading` becomes true
- AND `error` is set to null
- AND on success, `ventures` contains fetched ventures
- AND `isLoading` becomes false

#### Scenario: Fetch ventures handles network error

- GIVEN the store is in idle state
- WHEN `fetchVentures()` is called and the API fails
- THEN `isLoading` becomes true
- AND on failure, `error` contains user-friendly message
- AND `isLoading` becomes false
- AND `ventures` remains unchanged

#### Scenario: Fetch ventures returns empty array

- GIVEN no ventures exist
- WHEN `fetchVentures()` is called
- THEN response returns HTTP 200
- AND `ventures` is set to empty array

---

### Requirement: Select Venture

The store MUST provide `selectVenture` action that sets `selectedVenture` by ID.

**Strength**: MUST

#### Scenario: Successfully select existing venture

- GIVEN `ventures` contains venture with ID 42
- WHEN component calls `useVentureStore.getState().selectVenture(42)`
- THEN `isLoading` becomes true
- AND `selectedVenture` is set to the matching venture
- AND `isLoading` becomes false

#### Scenario: Select non-existent venture sets null

- GIVEN no venture exists with ID 999
- WHEN `selectVenture(999)` is called
- THEN `isLoading` becomes true
- AND on completion, `selectedVenture` is null
- AND `isLoading` becomes false

#### Scenario: Direct selection by object

- GIVEN component has venture object
- WHEN `setSelectedVenture(venture)` is called with venture object
- THEN `selectedVenture` is set immediately without API call

---

### Requirement: Create Venture

The store MUST provide `createVenture` action that POSTs to backend and optimistically adds to list.

**Strength**: MUST

#### Scenario: Successfully create venture

- GIVEN `ventures` contains existing ventures
- WHEN component calls `createVenture({ name: "New", ownerId: "u1", zzz_project_id: 1 })`
- THEN `isSaving` becomes true
- AND on success, new venture is appended to `ventures` array
- AND `isSaving` becomes false
- AND created venture is returned

#### Scenario: Create venture failure

- GIVEN store is in idle state
- WHEN `createVenture()` is called and API returns error
- THEN `isSaving` becomes true
- AND on failure, `error` is set to "Failed to create venture"
- AND `isSaving` becomes false
- AND `ventures` array is unchanged
- AND null is returned

---

### Requirement: Update Venture

The store MUST provide `updateVenture` action that uses PUT method (not PATCH) and updates both list and selection.

**Strength**: MUST

#### Scenario: Successfully update venture

- GIVEN `ventures` contains venture with ID 42
- AND `selectedVenture` is set to venture 42
- WHEN `updateVenture(42, { name: "Updated" })` is called
- THEN `isSaving` becomes true
- AND on success, venture 42 in `ventures` array is updated
- AND `selectedVenture` is updated to reflect changes
- AND `isSaving` becomes false
- AND updated venture is returned

#### Scenario: Update non-existent venture

- GIVEN store is in idle state
- WHEN `updateVenture(999, { name: "Test" })` is called
- THEN `isSaving` becomes true
- AND on failure, `error` is set
- AND `isSaving` becomes false
- AND null is returned

---

### Requirement: Delete Venture

The store MUST provide `deleteVenture` action that removes venture from list and clears selection.

**Strength**: MUST

#### Scenario: Successfully delete venture

- GIVEN `ventures` contains venture with ID 42
- AND `selectedVenture` is set to venture 42
- WHEN `deleteVenture(42)` is called
- THEN `isSaving` becomes true
- AND on success, venture 42 is removed from `ventures` array
- AND `selectedVenture` is set to null
- AND `isSaving` becomes false
- AND true is returned

#### Scenario: Delete non-existent venture

- GIVEN store is in idle state
- WHEN `deleteVenture(999)` is called
- THEN `isSaving` becomes true
- AND on failure, `error` is set
- AND `isSaving` becomes false
- AND false is returned

---

## Acceptance Criteria

| ID   | Criterion                                              | Test Method                          |
| ---- | ------------------------------------------------------ | ------------------------------------ |
| AC1  | Store initializes with correct empty state             | Assert initial selector values       |
| AC2  | `fetchVentures` populates `ventures` array             | Assert ventures length > 0           |
| AC3  | `fetchVentures` sets error on failure                  | Mock API failure, assert error state |
| AC4  | `selectVenture` sets `selectedVenture`                 | Assert selectedVenture matches ID    |
| AC5  | `createVenture` optimistically adds to list            | Assert ventures length increases     |
| AC6  | `updateVenture` updates list and selection             | Assert both reflect new values       |
| AC7  | `deleteVenture` removes from list and clears selection | Assert length decreases and null     |
| AC8  | `isLoading` used for reads, `isSaving` for mutations   | Assert correct flags per action      |
| AC9  | Error messages are user-friendly via `mapNetworkError` | Mock failure, assert error string    |
| AC10 | All `make test` pass for store and service modules     | Run `make test`                      |

## Implementation Notes

- Follow `project.store.ts` interface exactly
- Use `isLoading` for reads (`fetchVentures`, `selectVenture`), `isSaving` for mutations (`createVenture`, `updateVenture`, `deleteVenture`)
- Service methods must align with backend: GET `/ventures`, POST `/ventures`, PUT `/ventures/:id`, DELETE `/ventures/:id`
- Mock service MUST implement all CRUD operations
- Components using `VentureService` directly should migrate to store selectors
