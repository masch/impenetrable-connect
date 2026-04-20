# Tasks: Backend Initialization and Health Check

**Change Name:** `backend-init-health-check`

## Phase 1: Setup & Configuration

- [ ] **Task 1.1**: Create directory `apps/backend`.
- [ ] **Task 1.2**: Create `apps/backend/package.json` with dependencies (`hono`, `@repo/shared`).
- [ ] **Task 1.3**: Create `apps/backend/tsconfig.json` extending base config.

## Phase 2: Strict TDD - Integration Test

- [ ] **Task 2.1**: Create `apps/backend/src/app.test.ts` with a failing test for `GET /health`.
  - Assert status 200.
  - Assert JSON body with `status: "ok"`.

## Phase 3: Implementation

- [ ] **Task 3.1**: Create `apps/backend/src/app.ts` (Hono instance initialization).
- [ ] **Task 3.2**: Create `apps/backend/src/routes/health.ts` (handler logic).
- [ ] **Task 3.3**: Create `apps/backend/src/index.ts` (Bun entry point).

## Phase 4: Verification

- [ ] **Task 4.1**: Run `bun run test` in `apps/backend` and confirm success.
- [ ] **Task 4.2**: Verify monorepo linking (if applicable).
