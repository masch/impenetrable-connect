# Design: Backend Application Initialization

**Change Name:** `backend-init-health-check`

## 1. Project Configuration

### apps/backend/package.json

- Name: `@repo/backend`
- Type: `module`
- Main: `src/index.ts`
- Dependencies: `hono`
- DevDependencies: `@repo/shared` (workspace link), `bun-types`

### apps/backend/tsconfig.json

- Extends: `../../tsconfig.base.json`
- Includes: `src/**/*`

## 2. File Structure & Responsibilities

### `src/index.ts`

- Responsibility: Execution environment.
- Logic:
  ```typescript
  import app from "./app";
  const port = process.env.PORT || 3000;
  export default {
    port,
    fetch: app.fetch,
  };
  ```

### `src/app.ts`

- Responsibility: App definition, Middleware, and Routing.
- Logic: Initialize Hono instance, attach routes (health).

### `src/routes/health.ts`

- Responsibility: Health check logic.
- Logic: Return status, timestamp, and process uptime.

### `src/app.test.ts`

- Responsibility: Integration testing.
- Logic: Use `app.request()` to verify `/health` endpoint.

## 3. Architecture Decisions

### Decision 1: Hono as Framework

Hono is ultra-lightweight and runs natively on Bun. It matches the project's performance requirements for low-end mobile device support (even if this is the backend, consistency in performance philosophy matters).

### Decision 2: Separating App from Server

By exporting the Hono instance in `app.ts` and serving it in `index.ts`, we can import `app` in our tests and use `app.request()` without binding to a network port. This is faster and more reliable for CI.

### Decision 3: Bun as Runtime

Consistent with the monorepo setup. Provides built-in testing and TypeScript support.
