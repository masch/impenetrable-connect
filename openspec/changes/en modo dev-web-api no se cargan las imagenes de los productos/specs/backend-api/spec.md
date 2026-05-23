# Delta for backend-api

No existing spec for `backend-api` exists. This is a full spec documenting the modified behavior.

## ADDED Requirements

### Requirement: Dev CORS Flexibility

In non-production environments, the backend MUST accept cross-origin requests from any Expo web dev server on ports 8080-8089. Production behavior MUST remain unchanged (strict `ALLOWED_ORIGINS` list).

#### Scenario: Dev web on port 8082

- GIVEN the backend is not in production (`environment !== "production"`)
- WHEN a request arrives with `Origin: http://localhost:8082`
- THEN the CORS middleware MUST return the origin in `Access-Control-Allow-Origin`
- AND the preflight (OPTIONS) request MUST return a 204 with the same header

#### Scenario: Production blocks unknown origin

- GIVEN the backend is in production (`environment === "production"`)
- WHEN a request arrives from an origin NOT in `ALLOWED_ORIGINS`
- THEN the CORS middleware MUST NOT set `Access-Control-Allow-Origin`
- AND the request MUST be rejected

#### Scenario: Non-localhost origin rejected in dev

- GIVEN the backend is not in production
- WHEN a request arrives with `Origin: https://external-site.com`
- THEN the origin MUST NOT be echoed in `Access-Control-Allow-Origin`
- AND the request MUST be rejected

### Requirement: Full Seed Image Coverage

All 18 products in the seed data MUST have a `zzz_image_url` pointing to a real Unsplash image. The DB seed script (`apps/backend/src/db/seed.ts`) SHALL handle these URLs generically without special-casing.

#### Scenario: All seeded products have images

- GIVEN the database has been seeded via `make seed-db`
- WHEN querying all 18 products
- THEN every product row MUST have a non-null `zzz_image_url`
- AND each URL MUST resolve to a valid Unsplash image
