# Delta Spec: Product Images in Dev Web API Mode

## Business Context

In API mode (`USE_MOCKS=false` on web), product images don't load: only 5/18 products have image URLs in seed data, CORS blocks if Expo web uses a port other than 8081, web images stretch instead of covering. Mock mode is stable and must not regress.

---

## 1. catalog-images-api-mode (New Capability)

### Purpose

All catalog items display images when fetched from `/v1/services` in API mode, matching the mock mode experience on both web and native.

### Requirements

#### Requirement: Complete Image Coverage

All 18 catalog items MUST have a resolvable `zzz_image_url` when returned by `/v1/services`, regardless of mode (mock or API).

##### Scenario: All products have image URLs

- GIVEN the catalog data source (mock data or database seed)
- WHEN enumerating all 18 products
- THEN each product MUST have a non-null `zzz_image_url` pointing to a real Unsplash image

##### Scenario: Mock mode regression prevention

- GIVEN the app is running in mock mode (`USE_MOCKS=true`)
- WHEN the product store fetches services
- THEN all 18 products MUST display images (zzz_image_url unchanged from before this change)
- AND no mock patch override of zzz_image_url SHALL be required

#### Requirement: Web Image Rendering

On the web platform (dev-web-api), product images in the ServiceCard MUST render with `object-fit: cover` to maintain aspect ratio without distortion.

##### Scenario: Web image aspect ratio

- GIVEN a ServiceCard is rendered on the web platform
- WHEN the product has a valid `zzz_image_url`
- THEN the Image component MUST apply `objectFit: "cover"` styling
- AND the image MUST fill its container without stretching

##### Scenario: Native unaffected

- GIVEN a ServiceCard is rendered on native (iOS/Android)
- WHEN the product has a valid `zzz_image_url`
- THEN the Image styling MUST NOT be affected by the web-only `objectFit` change

#### Requirement: Error Detail Feedback

When the API call to fetch products fails, the store's error state MUST include the actual error details rather than a generic message.

##### Scenario: Network error with detail

- GIVEN the app is in API mode
- WHEN the API request to `/v1/services` fails (e.g., network timeout, server error)
- THEN the store's `error` state MUST include the error's `.message`
- AND the error string MUST be more descriptive than "Failed to fetch services"

---

## 2. backend-api (Modified Capability)

No existing spec for `backend-api` exists — this is a full spec documenting the modified behavior.

### ADDED Requirements

#### Requirement: Dev CORS Flexibility

In non-production environments, the backend MUST accept cross-origin requests from any Expo web dev server on ports 8080-8089. Production behavior MUST remain unchanged (strict `ALLOWED_ORIGINS` list).

##### Scenario: Dev web on port 8082

- GIVEN the backend is not in production (`environment !== "production"`)
- WHEN a request arrives with `Origin: http://localhost:8082`
- THEN the CORS middleware MUST return the origin in `Access-Control-Allow-Origin`
- AND the preflight (OPTIONS) request MUST return a 204 with the same header

##### Scenario: Production blocks unknown origin

- GIVEN the backend is in production (`environment === "production"`)
- WHEN a request arrives from an origin NOT in `ALLOWED_ORIGINS`
- THEN the CORS middleware MUST NOT set `Access-Control-Allow-Origin`
- AND the request MUST be rejected

##### Scenario: Non-localhost origin rejected in dev

- GIVEN the backend is not in production
- WHEN a request arrives with `Origin: https://external-site.com`
- THEN the origin MUST NOT be echoed in `Access-Control-Allow-Origin`
- AND the request MUST be rejected

#### Requirement: Full Seed Image Coverage

All 18 products in the seed data MUST have a `zzz_image_url` pointing to a real Unsplash image. The DB seed script (`apps/backend/src/db/seed.ts`) SHALL handle these URLs generically without special-casing.

##### Scenario: All seeded products have images

- GIVEN the database has been seeded via `make seed-db`
- WHEN querying all 18 products
- THEN every product row MUST have a non-null `zzz_image_url`
- AND each URL MUST resolve to a valid Unsplash image

---

## Non-Functional Requirements

### Security

- CORS in production MUST remain strict — only origins in `ALLOWED_ORIGINS` are accepted
- The dev-mode localhost regex (`/^http:\/\/localhost:808\d$/`) MUST NOT apply in production
- Fail-secure: if `ALLOWED_ORIGINS` is empty in production, the server MUST reject all cross-origin requests

### Compatibility

- Web-only `objectFit` change MUST NOT affect native rendering (React Native ignores the `style` object property on web — no `Platform.OS` check needed)
- Mock mode MUST display identical images before and after — no mock code changes SHALL be made
- Existing backend tests MUST continue passing

### Data Integrity

- Seed image URLs MUST point to real Unsplash resources (not placeholder URLs)
- Each product MUST have a semantically appropriate image (e.g., empanadas get empanada-related photos)

---

## Acceptance Criteria

- [ ] API mode: all 18 products show images, not placeholders
- [ ] Mock mode: all 18 products show images (no regression)
- [ ] Expo web on port 8082 (or any 808X): no CORS errors, images load
- [ ] Web images render with `object-fit: cover`
- [ ] API error surfaces detail: e.g., "Network request failed" not "Failed to fetch services"
- [ ] `make check` passes (lint, type-check, tests)
