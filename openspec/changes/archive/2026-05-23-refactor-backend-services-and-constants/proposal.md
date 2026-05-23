# Proposal: Extract backend route logic to services and add HTTP constants

## Intent

To enforce backend conventions, clean architecture, and improve testability by:

1. Extracting all database query logic from Hono route handlers (`projects.ts`, `ventures.ts`, `products.ts`, `services.ts`) into dedicated service modules (`ProjectService`, `VentureService`, `ProductService`).
2. Creating a centralized module for HTTP status constants to replace hardcoded numeric values.
3. Standardizing exports by switching from default exports to named exports across all route files.

## Scope

### In Scope

1. **HTTP Status Constants**: Create `apps/backend/src/constants/http-status.ts` with named constants:
   - `HTTP_OK = 200`
   - `HTTP_CREATED = 201`
   - `HTTP_NO_CONTENT = 204`
   - `HTTP_BAD_REQUEST = 400`
   - `HTTP_NOT_FOUND = 404`
   - `HTTP_INTERNAL_ERROR = 500`
2. **Project Service**: Create `apps/backend/src/services/project.service.ts` containing:
   - `getAll(db)`: Returns all projects ordered by active status, then name.
   - `getById(db, id)`: Returns a project by ID or throws if not found.
   - `getFirstActive(db)`: Returns the first active project or null.
   - `create(db, input)`: Inserts a new project and returns it.
3. **Venture Service**: Create `apps/backend/src/services/venture.service.ts` containing:
   - `getAll(db)`: Returns all active/inactive ventures.
   - `getByUserId(db, userId)`: Returns ventures for which the user is a member.
   - `create(db, input)`: Inserts a new venture and returns it.
   - `update(db, id, input)`: Updates a venture by ID and returns the updated entity, or null.
   - `softDelete(db, id)`: Sets a venture's active flag to false and sets deleted timestamp, or returns null if not found.
4. **Product Service**: Refactor/Extend `apps/backend/src/services/product.service.ts`:
   - Encapulate `mapProductsWithCategories` under `ProductService` or keep it alongside.
   - Add `getCategoriesByProject(db, projectId)`: Returns active categories for a project.
   - Add `getProductsByCategoryIds(db, categoryIds)`: Returns active/non-paused products for category IDs.
5. **Route Refactoring**: Replace inline DB queries and raw status numbers with service calls and HTTP constants in:
   - `apps/backend/src/routes/projects.ts`
   - `apps/backend/src/routes/ventures.ts`
   - `apps/backend/src/routes/products.ts`
   - `apps/backend/src/routes/services.ts`
6. **Named Exports**: Convert any default exports in these router files to named exports for consistency.

### Out of Scope

- Client-side / Mobile app store changes.
- Schema definitions or database migration scripts.
- Modifying authentication or authorization middleware code.

## Capabilities

### New Capabilities

- `<backend-constants>`: Named HTTP constants centralized.
- `<project-service>`: Extracted DB services.
- `<venture-service>`: Extracted DB services.
- `<product-service>`: Expanded DB services.

## Approach

- Move DB query logic to services.
- All service methods accept the `db` instance as their first argument.
- Route controllers parse/validate inputs and invoke services.
- Replace HTTP codes: e.g. `200` with `HTTP_OK`.
- Change default route exports to named router exports and update imports in `app.ts`.

## Affected Areas

| Area                                           | Impact   | Description                                                               |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `apps/backend/src/constants/http-status.ts`    | [NEW]    | Centralized HTTP status codes                                             |
| `apps/backend/src/services/project.service.ts` | [NEW]    | Project-related database operations                                       |
| `apps/backend/src/services/venture.service.ts` | [NEW]    | Venture-related database operations                                       |
| `apps/backend/src/services/product.service.ts` | Modified | Add category and product DB lookup methods                                |
| `apps/backend/src/routes/projects.ts`          | Modified | Use ProjectService and HTTP constants; export named router                |
| `apps/backend/src/routes/ventures.ts`          | Modified | Use VentureService and HTTP constants; export named router                |
| `apps/backend/src/routes/products.ts`          | Modified | Use ProductService and HTTP constants; export named router                |
| `apps/backend/src/routes/services.ts`          | Modified | Use ProductService/ProjectService and HTTP constants; export named router |
| `apps/backend/src/app.ts`                      | Modified | Update imports from default to named for routers                          |

## Risks

| Risk                                            | Likelihood | Mitigation                                                                                                 |
| ----------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| DB transaction or query errors in services      | Low        | Maintain identical query logic and constraints. Cover refactored services and routes with automated tests. |
| Missing exports/imports causing runtime failure | Low        | `make check` type-checking and automated tests will catch import mismatches.                               |

## Rollback Plan

Revert the commits associated with this refactor branch.

## Success Criteria

- [ ] All database query logic removed from route files and moved to service classes.
- [ ] No hardcoded numeric status codes in updated route files (replace with HTTP constants).
- [ ] Named router exports used consistently.
- [ ] `make check` runs and passes successfully.
- [ ] All backend unit/integration tests pass without regression.
