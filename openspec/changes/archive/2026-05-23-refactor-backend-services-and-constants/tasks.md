# Tasks: Extract backend route logic to services and add HTTP constants

## Review Workload Forecast

| Field                   | Value                               |
| ----------------------- | ----------------------------------- |
| Estimated changed lines | ~400                                |
| 400-line budget risk    | Medium                              |
| Chained PRs recommended | Yes                                 |
| Suggested split         | Single PR (size:exception approved) |
| Delivery strategy       | ask-on-risk (resolved to exception) |
| Chain strategy          | none                                |

Decision needed before apply: No (resolved by user)
Chained PRs recommended: No (overridden by user size:exception)
Chain strategy: none
400-line budget risk: Medium

### Work Unit (Single PR)

| Unit | Goal                                                                           | Likely PR | Notes                   |
| ---- | ------------------------------------------------------------------------------ | --------- | ----------------------- |
| 1    | Full implementation (Constants, Services, Route refactoring, and verification) | Single PR | Approved size:exception |

---

## Phase 1: Constants & Services (PR 1)

- [ ] 1.1 HTTP constants — Create `apps/backend/src/constants/http-status.ts` defining `HTTP_OK`, `HTTP_CREATED`, `HTTP_NO_CONTENT`, `HTTP_BAD_REQUEST`, `HTTP_NOT_FOUND`, and `HTTP_INTERNAL_ERROR`.
- [ ] 1.2 ProjectService — Create `apps/backend/src/services/project.service.ts` implementing `getAll`, `getById`, `getFirstActive`, and `create`.
- [ ] 1.3 VentureService — Create `apps/backend/src/services/venture.service.ts` implementing `getAll`, `getByUserId`, `create`, `update`, and `softDelete`.
- [ ] 1.4 ProductService — Refactor `apps/backend/src/services/product.service.ts` to expose `ProductService` class with `getCategoriesByProject` and `getProductsByCategoryIds`, alongside `mapProductsWithCategories`.
- [ ] 1.5 Service unit tests — Create unit test files (e.g. `project.service.test.ts`, `venture.service.test.ts`) to verify business logic and DB calls are isolated correctly.

## Phase 2: Route handlers and Integration (PR 2)

- [ ] 2.1 Refactor Projects Route — Update `apps/backend/src/routes/projects.ts` to call `ProjectService`, replace hardcoded status codes, and use named exports.
- [ ] 2.2 Refactor Ventures Route — Update `apps/backend/src/routes/ventures.ts` to call `VentureService`, replace hardcoded status codes, and use named exports.
- [ ] 2.3 Refactor Products Route — Update `apps/backend/src/routes/products.ts` to call `ProductService`, replace hardcoded status codes, and use named exports.
- [ ] 2.4 Refactor Services Route — Update `apps/backend/src/routes/services.ts` to call `ProductService` and `ProjectService`, replace hardcoded status codes, and use named exports.
- [ ] 2.5 App Entry Point — Update `apps/backend/src/app.ts` to import the routes as named exports instead of defaults.
- [ ] 2.6 Route unit tests — Review and adapt existing backend API tests to ensure they verify the updated route behavior correctly.

## Phase 3: Testing & Verification

- [ ] 3.1 Verify `make check` — Run `make check` to ensure formatting, type-checking, linter, and GGA are completely green.
- [ ] 3.2 Verify backend tests — Run `make test-backend` to ensure all tests pass.
- [ ] 3.3 Verify full tests — Run `make test` to ensure no regression across backend, mobile, or shared packages.
