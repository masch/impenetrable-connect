# Tasks: Entrepreneur and Admin Authentication

**Change:** `entrepreneur-admin-auth`

- [ ] **Data Infrastructure**
    - [ ] Define Drizzle schemas in `apps/backend/src/db/schema/`
    - [ ] Export schemas in `index.ts`
    - [ ] Generate migration (`bun run drizzle-kit generate`)
    - [ ] Apply migration (`bun run drizzle-kit push`)

- [ ] **Contracts and Validation (@repo/shared)**
    - [ ] Define `UserRole` enum
    - [ ] Create `LoginInputSchema` and `AuthResponseSchema`

- [ ] **Business Logic (Backend)**
    - [ ] Implement `AuthService` using `Bun.password`
    - [ ] Create auth controller/routes in `apps/backend/src/routes/auth.ts`

- [ ] **Security and Middleware**
    - [ ] Implement `authMiddleware` using `@hono/jwt`
    - [ ] Implement `roleGuard` for route protection

- [ ] **Verification**
    - [ ] Write integration tests for successful and failed login
    - [ ] Verify an Entrepreneur cannot access Admin routes
