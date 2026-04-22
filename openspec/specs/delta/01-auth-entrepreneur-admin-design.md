# Technical Design: Entrepreneur and Admin Authentication

**Status:** 🟡 DRAFT
**Change:** `entrepreneur-admin-auth`

## 1. Data Architecture (Drizzle)

### `users` table
- `id`: `uuid` (primary key)
- `email`: `text` (unique, indexed)
- `password_hash`: `text`
- `role`: `enum(['ADMIN', 'ENTREPRENEUR'])`
- `created_at`: `timestamp`

### `ventures` table
- `id`: `serial` (primary key)
- `name`: `text`
- `owner_id`: `uuid` (FK -> users.id)
- `is_active`: `boolean` (default true)

### `refresh_tokens` table
- `id`: `uuid` (primary key)
- `user_id`: `uuid` (FK -> users.id)
- `token_hash`: `text`
- `expires_at`: `timestamp`
- `revoked_at`: `timestamp` (null by default)

## 2. Software Components

### Backend (Hono)
- **`AuthService`**: Encapsulates logic for `Bun.password.hash/verify` and JWT generation.
- **`authMiddleware`**: Global/route-specific middleware verifying the `Authorization: Bearer <token>` header.
- **`roleGuard(roles: Role[])`**: Higher-order middleware to protect routes based on role.

### Shared (@repo/shared)
- **`validators/auth.ts`**: Zod schemas for auth input/output.
- **`constants/roles.ts`**: Role enums to avoid magic strings.

## 3. Authentication Flow
1. Client sends `email` + `password`.
2. Server looks up user in DB.
3. Server verifies password using `Bun.password.verify`.
4. If valid, generates `accessToken` (JWT with payload `{ sub, role }`).
5. Generates a random `refreshToken`, saves the hash in DB, and returns both to the client.
