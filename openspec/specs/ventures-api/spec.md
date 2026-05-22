# Ventures API Specification

## Purpose

Provides REST API endpoints for venture entity CRUD operations. Enables mobile app to fetch and create ventures via `/v1/ventures` route.

## Requirements

### Requirement: GET Ventures Returns All Ventures

The system MUST return all ventures ordered by `zzz_is_active` (descending) then `zzz_name` (ascending).

**Strength**: MUST

#### Scenario: Return ventures sorted by active status and name

- GIVEN the database contains ventures with mixed active/inactive status
- WHEN client requests GET `/v1/ventures` with valid JWT
- THEN response returns HTTP 200
- AND body contains array of ventures
- AND active ventures appear before inactive
- AND ventures with same status sorted alphabetically by name

#### Scenario: Empty database returns empty array

- GIVEN no ventures exist in database
- WHEN client requests GET `/v1/ventures` with valid JWT
- THEN response returns HTTP 200
- AND body contains empty array

---

### Requirement: POST Ventures Creates New Venture

The system MUST validate request body against CreateVentureSchema and create venture in database.

**Strength**: MUST

#### Scenario: Create venture with valid data

- GIVEN valid venture data (name, ownerId, zzz_project_id, optional fields)
- WHEN client requests POST `/v1/ventures` with valid JWT and JSON body
- THEN response returns HTTP 201
- AND body contains created venture with generated id and timestamps

#### Scenario: Create venture with only required fields

- GIVEN venture data with only required fields (name, ownerId, zzz_project_id)
- WHEN client requests POST `/v1/ventures`
- THEN response returns HTTP 201
- AND venture created with default values (zzz_max_capacity: 0, zzz_is_active: true, etc.)

#### Scenario: Invalid venture data returns 400

- GIVEN invalid venture data (missing required fields, wrong types)
- WHEN client requests POST `/v1/ventures`
- THEN response returns HTTP 400
- AND body contains validation error details

---

### Requirement: Unauthenticated Requests Return 401

The system MUST reject requests without valid JWT authentication.

**Strength**: MUST

#### Scenario: Request without Authorization header

- GIVEN no Authorization header present
- WHEN client requests GET or POST `/v1/ventures`
- THEN response returns HTTP 401

#### Scenario: Request with invalid JWT token

- GIVEN Authorization header with malformed token
- WHEN client requests GET or POST `/v1/ventures`
- THEN response returns HTTP 401

---

### Requirement: PUT Ventures Updates Existing Venture

The system MUST validate the request body against UpdateVentureSchema, find the venture by ID, and return the updated venture with HTTP 200.

**Strength**: MUST

#### Scenario: Update venture with valid partial data

- GIVEN the database contains a venture with ID 42
- WHEN client requests PUT `/v1/ventures/42` with valid JWT and JSON body containing `{"name": "Updated Name"}`
- THEN response returns HTTP 200
- AND body contains the updated venture with `name` set to "Updated Name"
- AND all other fields remain unchanged

#### Scenario: Update venture with full valid data

- GIVEN the database contains a venture with ID 42
- WHEN client requests PUT `/v1/ventures/42` with valid JWT and JSON body containing all updateable fields
- THEN response returns HTTP 200
- AND body contains the venture with all provided fields updated

#### Scenario: Update non-existent venture returns 404

- GIVEN no venture exists with ID 999
- WHEN client requests PUT `/v1/ventures/999` with valid JWT and JSON body
- THEN response returns HTTP 404
- AND body contains error indicating resource not found

#### Scenario: Update with invalid payload returns 400

- GIVEN valid venture exists in database
- WHEN client requests PUT `/v1/ventures/42` with invalid JSON body (e.g., empty string for required fields, invalid UUID)
- THEN response returns HTTP 400
- AND body contains validation error details

#### Scenario: Update with unauthorized request returns 401

- GIVEN no Authorization header present
- WHEN client requests PUT `/v1/ventures/42`
- THEN response returns HTTP 401

---

### Requirement: DELETE Ventures Removes Venture

The system MUST locate the venture by ID and return HTTP 204 on successful deletion.

**Strength**: MUST

#### Scenario: Delete existing venture returns 204

- GIVEN the database contains a venture with ID 42
- WHEN client requests DELETE `/v1/ventures/42` with valid JWT
- THEN response returns HTTP 204
- AND body is empty

#### Scenario: Delete non-existent venture returns 404

- GIVEN no venture exists with ID 999
- WHEN client requests DELETE `/v1/ventures/999` with valid JWT
- THEN response returns HTTP 404
- AND body contains error indicating resource not found

#### Scenario: Delete with unauthorized request returns 401

- GIVEN no Authorization header present
- WHEN client requests DELETE `/v1/ventures/42`
- THEN response returns HTTP 401

---

## Acceptance Criteria

| ID   | Criterion                                             | Test Method               |
| ---- | ----------------------------------------------------- | ------------------------- |
| AC1  | GET /v1/ventures returns 200 with ventures array      | `make test` passes        |
| AC2  | Ventures ordered by zzz_is_active DESC, name ASC      | Assert order in test      |
| AC3  | POST /v1/ventures creates venture and returns 201     | `make test` passes        |
| AC4  | Invalid POST returns 400 with validation errors       | Assert status 400 in test |
| AC5  | Unauthenticated requests return 401                   | Assert status 401 in test |
| AC6  | All tests pass via `make test`                        | Run `make test`           |
| AC7  | PUT /v1/ventures/:id returns 200 with updated venture | `make test` passes        |
| AC8  | PUT returns 404 when venture not found                | Assert status 404 in test |
| AC9  | PUT returns 400 on invalid payload                    | Assert status 400 in test |
| AC10 | DELETE /v1/ventures/:id returns 204 on success        | `make test` passes        |
| AC11 | DELETE returns 404 when venture not found             | Assert status 404 in test |
| AC12 | Unauthenticated PUT/DELETE return 401                 | Assert status 401 in test |

## Implementation Notes

- Follow `projects.ts` pattern: Hono<AppEnv>, authMiddleware, Zod validation
- Use `CreateVentureSchema` from `@repo/shared`
- Use `ventures` table from `apps/backend/src/db/schema/ventures`
- Register route: `app.route("/v1/ventures", venturesRouter)`
- Test coverage: same as `projects.test.ts`

### PUT/DELETE Implementation Notes

- `UpdateVentureSchema`: All fields optional except those explicitly required for update logic. Must omit `id`, `createdAt`, `updatedAt`, `zzz_project_id`, `ownerId`.
- Mutable fields: `name`, `zzz_max_capacity`, `zzz_cascade_order`, `zzz_is_paused`
- Use `db.update(ventures).set({...}).where(eq(ventures.id, id)).returning()` for PUT.
- Soft delete for DELETE: set `zzz_is_active: false` and `zzzDeletedAt: now()` via `db.update()`.
- Verify existence before update/delete to return 404.
- Follow same error handling pattern: ZodError → 400, other errors → 500.
