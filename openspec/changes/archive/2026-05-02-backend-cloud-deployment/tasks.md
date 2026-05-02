# Tasks: backend-cloud-deployment

## Phase 0: Cloudflare Onboarding

- [x] 0.1. Create a [Cloudflare account](https://dash.cloudflare.com/sign-up) if you don't have one.
- [x] 0.2. Run `make backend-login` (waiting for user).
- [x] 0.3. Identify the `account_id` from the Cloudflare dashboard for the `wrangler.toml`.

## Phase 1: Infrastructure Setup

- [x] 1.1. Install Wrangler CLI as a dev dependency in `apps/backend`.
- [x] 1.2. Create `apps/backend/wrangler.toml` with production configuration.
- [x] 1.3. Document required secrets (`DATABASE_URL`, `JWT_SECRET`) and how to set them.

## Phase 2: Database Layer Refactoring

- [x] 2.1. Refactor `apps/backend/src/db/index.ts` to implement the `getDb()` factory.
- [x] 2.2. Ensure the factory switches between `postgres` (local) and `neon-http` (production) based on `ENVIRONMENT`.
- [x] 2.3. Update all DB consumers to use the new factory pattern.

## Phase 3: Application & Environment

- [x] 3.1. Update `apps/backend/src/index.ts` to handle Cloudflare Workers environment bindings.
- [x] 3.2. Enhance the `/health` endpoint to return the current environment and status.
- [x] 3.3. Refactor `AuthService` to remove `Bun.password` dependency and support passed-in `db`/`jwtSecret`.

## Phase 4: Automation & Deployment

- [x] 4.1. Add `backend-deploy` target to root `Makefile`.
- [x] 4.2. Add `backend-logs` and `backend-secret-set` targets to root `Makefile`.
- [x] 4.3. Update `apps/mobile/.env.api` with production URL.

## Phase 5: Verification

- [x] 5.1. Run `make backend-deploy` and verify successful bundling.
- [x] 5.2. Verify the `/health` endpoint returns `200 OK` and `"env": "production"`.
- [x] 5.3. Perform a basic data fetch test to confirm Neon connectivity from the cloud.
