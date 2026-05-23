# Tasks: Fix product images not loading in dev-web-api mode

## Review Workload Forecast

| Field                   | Value       |
| ----------------------- | ----------- |
| Estimated changed lines | ~46         |
| 400-line budget risk    | Low         |
| Chained PRs recommended | No          |
| Suggested split         | Single PR   |
| Delivery strategy       | ask-on-risk |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal                                       | Likely PR | Notes                              |
| ---- | ------------------------------------------ | --------- | ---------------------------------- |
| 1    | Backend + shared (CORS + seed data + test) | PR 1      | Independent from mobile            |
| 2    | Mobile (rendering + error feedback)        | PR 1      | Included in same PR (small change) |

## Phase 1: Backend & Shared Data

- [x] 1.1 CORS — `apps/backend/src/app.ts:16-23`: Insert dev localhost origin check before existing origin logic (4 lines). Guard: `config.isDevelopment && origin && /^https?:\/\/localhost(:\d+)?$/.test(origin)`.
- [x] 1.2 Seed data — `packages/shared/src/mocks/product-data.ts`: Add `zzz_image_url: "https://images.unsplash.com/...?w=400"` to 13 products (IDs 1-8, 10-13, 17). Use Unsplash food/regional images matching each product.

## Phase 2: Mobile Rendering & Error Feedback

- [x] 2.1 Web rendering — `apps/mobile/src/components/catalog/ServiceCard.tsx:45`: Add `objectFit: "cover"` to Image style prop. Single change: `style={{ width: "100%", height: "100%", objectFit: "cover" }}`.
- [x] 2.2 Error feedback — `apps/mobile/src/stores/product.store.ts`: Replace 3 `logger.error` calls (lines ~60, ~72, ~84) to include structured error detail: `{ error: err instanceof Error ? err.message : String(err) }`.

## Phase 3: Testing & Verification

- [x] 3.1 CORS unit test — `apps/backend/src/app.test.ts`: Add test for dev mode with localhost origin (e.g. `Origin: http://localhost:8082`) verifying `Access-Control-Allow-Origin` header is echoed back. Use `ENVIRONMENT: "development"` and `ALLOWED_ORIGINS: ""` bindings.
- [x] 3.2 Verify `make check` passes — Run lint, type-check, and all existing tests. No existing test should regress.
- [ ] 3.3 Reseed database — Run `make seed-db` to apply seed image URLs to DB products table.
- [ ] 3.4 Manual verify — Start backend + web app in API mode, confirm all 18 products show images. Switch to mock mode, confirm no regression.
