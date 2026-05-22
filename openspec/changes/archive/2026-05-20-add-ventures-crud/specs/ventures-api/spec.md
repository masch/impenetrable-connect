# Delta for Ventures API — add-ventures-crud

## ADDED Requirements

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

## MODIFIED Requirements

None — this change adds new endpoints without modifying existing GET/POST behavior.

---

## REMOVED Requirements

None.

---

## Acceptance Criteria

| ID   | Criterion                                             | Test Method               |
| ---- | ----------------------------------------------------- | ------------------------- |
| AC7  | PUT /v1/ventures/:id returns 200 with updated venture | `make test` passes        |
| AC8  | PUT returns 404 when venture not found                | Assert status 404 in test |
| AC9  | PUT returns 400 on invalid payload                    | Assert status 400 in test |
| AC10 | DELETE /v1/ventures/:id returns 204 on success        | `make test` passes        |
| AC11 | DELETE returns 404 when venture not found             | Assert status 404 in test |
| AC12 | Unauthenticated PUT/DELETE return 401                 | Assert status 401 in test |

---

## Implementation Notes

- `UpdateVentureSchema`: All fields optional except those explicitly required for update logic. Must omit `id`, `createdAt`, `updatedAt`.
- Use `db.update(ventures).set(...).where(eq(ventures.id, id)).returning()` for PUT.
- Use `db.delete(ventures).where(eq(ventures.id, id))` for DELETE.
- Verify existence with `.select().from(ventures).where(eq(ventures.id, id))` before update/delete to return 404.
- Follow same error handling pattern as existing POST handler: ZodError → 400, other errors → 500.
