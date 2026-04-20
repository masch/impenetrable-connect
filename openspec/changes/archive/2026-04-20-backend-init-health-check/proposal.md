# Proposal: Initialize Backend and Health Check

**Change Name:** `backend-init-health-check`
**Status:** PROPOSED
**Author:** Antigravity

## 1. Intent

Initialize the backend application within the monorepo structure and implement the first functional endpoint (`/health`) to verify the setup and testing pipeline.

## 2. Context

The `rewilding-connect` project is a Bun-based monorepo. While the mobile app and shared packages are present, the backend infrastructure (Hono + Drizzle) is not yet initialized.

## 3. Goals

- Create `apps/backend` with a proper `package.json` and `tsconfig.json`.
- Implement a Hono application instance.
- Create a `GET /health` endpoint returning basic system status.
- Configure `bun:test` for backend integration testing.
- Ensure `@repo/shared` is correctly linked.

## 4. Approach

1. **Workspace Setup**: Create `apps/backend` directory and initialize `package.json`.
2. **Configuration**: Inherit `tsconfig.base.json` and configure Bun runtime.
3. **Core Logic**:
   - `src/app.ts`: Main Hono instance.
   - `src/routes/health.ts`: Health check handler.
   - `src/index.ts`: Server entry point using `Bun.serve`.
4. **Testing**: `src/app.test.ts` to verify the health check response using `app.request()`.

## 5. Risk Assessment

- **Low Risk**: This is a foundation-level change with no breaking impact on existing mobile code.

## 6. Strict TDD Compliance

- The implementation will follow the red-green-refactor cycle.
- First task: Create the test for `/health`.
- Second task: Implement the endpoint to make the test pass.
