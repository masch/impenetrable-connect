# Specification: Extract backend route logic to services and add HTTP constants

## Requirements

### 1. HTTP Constants

- The file `apps/backend/src/constants/http-status.ts` MUST export the following constants:
  - `HTTP_OK` as `200`
  - `HTTP_CREATED` as `201`
  - `HTTP_NO_CONTENT` as `204`
  - `HTTP_BAD_REQUEST` as `400`
  - `HTTP_NOT_FOUND` as `404`
  - `HTTP_INTERNAL_ERROR` as `500`
- All route files and services MUST use these constants instead of inline numbers for status codes.

### 2. Service Interfaces

#### 2.1 ProjectService (`apps/backend/src/services/project.service.ts`)

- MUST export a class `ProjectService` with the following static methods:
  - `getAll(db: Db)`: Retrieves all projects from DB ordered by `zzz_is_active` desc, then `zzz_name` asc.
  - `getById(db: Db, id: number)`: Retrieves a single project by ID or returns `undefined` if not found.
  - `getFirstActive(db: Db)`: Retrieves the first active project or `undefined`.
  - `create(db: Db, input: CreateProjectInput)`: Inserts a project and returns the created record.

#### 2.2 VentureService (`apps/backend/src/services/venture.service.ts`)

- MUST export a class `VentureService` with the following static methods:
  - `getAll(db: Db)`: Retrieves all ventures ordered by `zzz_is_active` desc, then `name` asc.
  - `getByUserId(db: Db, userId: string)`: Retrieves all ventures where the user is a member, ordered by `zzz_is_active` desc, then `name` asc.
  - `create(db: Db, input: CreateVentureInput)`: Inserts a venture and returns the created record.
  - `update(db: Db, id: number, input: UpdateVentureInput)`: Updates a venture by ID and returns the updated record, or `undefined` if not found.
  - `softDelete(db: Db, id: number)`: Sets `zzz_is_active` to false and `zzzDeletedAt` to current date/time, and returns the updated record, or `undefined` if not found.

#### 2.3 ProductService (`apps/backend/src/services/product.service.ts`)

- MUST export a class `ProductService` with the following static methods:
  - `getCategoriesByProject(db: Db, projectId: number)`: Retrieves all active product categories (`zzz_is_active = true`) for `zzz_project_id = projectId`.
  - `getProductsByCategoryIds(db: Db, categoryIds: number[])`: Retrieves all products where `zzz_product_category_id` is in `categoryIds` and `zzz_global_pause = false`.
  - `mapProductsWithCategories(items, categories, projectId)`: Retains existing mapping behavior.

### 3. Route Handlers

- All controllers MUST call corresponding services to run database queries.
- Controllers MUST NOT initiate direct Drizzle query builder queries (e.g. `db.select().from(...)`) for these domains.
- All router files MUST export the router via a named export (e.g., `export { router as projectsRouter }`).

## Scenarios

### Scenario 1: Fetching all projects

- **Given** a request to `GET /v1/projects`
- **When** the database has multiple active and inactive projects
- **Then** the route handler MUST invoke `ProjectService.getAll(db)`
- **And** return the projects ordered by active desc, then name asc with status `HTTP_OK`.

### Scenario 2: Project creation with invalid data

- **Given** a request to `POST /v1/projects` with empty body or invalid fields
- **When** the validation parser throws a `ZodError`
- **Then** the route handler MUST log a validation failure warning
- **And** return a status `HTTP_BAD_REQUEST` with validation details.

### Scenario 3: Soft-deleting an existing venture

- **Given** a request to `DELETE /v1/ventures/:id` for a valid venture ID
- **When** the database has a matching venture
- **Then** the route handler MUST invoke `VentureService.softDelete(db, id)`
- **And** return a status `HTTP_NO_CONTENT` with an empty body.

### Scenario 4: Fetching services for first active project

- **Given** a request to `GET /v1/services`
- **When** there is an active project
- **Then** the route handler MUST resolve the project ID using `ProjectService.getFirstActive(db)`
- **And** retrieve the categories and products via `ProductService`
- **And** return mapped products with status `HTTP_OK`.
