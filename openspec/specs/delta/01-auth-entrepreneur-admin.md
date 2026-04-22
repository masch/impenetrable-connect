# Delta Spec: Entrepreneur and Admin Authentication

**Status:** 🟡 DRAFT
**Date:** 2026-04-21
**Change:** `entrepreneur-admin-auth`

## 1. Context
The system currently lacks an authentication mechanism for administrative or entrepreneur roles. Only a theoretical flow for tourists exists. This change implements traditional email and password login for the roles managing the platform.

## 2. Requirements
- **REQ-1**: Users must be able to authenticate using email and password.
- **REQ-2**: The system must support roles: `ADMIN` and `ENTREPRENEUR`.
- **REQ-3**: Passwords must be stored securely using Argon2id.
- **REQ-4**: The system must issue Access Tokens (JWT) and Refresh Tokens (UUID).
- **REQ-5**: An Entrepreneur can be linked to multiple Ventures.

## 3. Scenarios (Acceptance Criteria)

### Scenario 1: Successful Login
- **Given** an existing user with email `test@example.com` and role `ADMIN`.
- **When** sending `POST /v1/auth/login` with correct credentials.
- **Then** it receives status `200 OK`.
- **And** the body contains `accessToken`, `refreshToken`, and `user` (without password_hash).

### Scenario 2: Failed Login (Credentials)
- **Given** an existing user.
- **When** sending incorrect credentials.
- **Then** it receives status `401 Unauthorized`.
- **And** the error message is generic for security reasons.

### Scenario 3: Role Authorization
- **Given** a user with the `ENTREPRENEUR` role.
- **When** trying to access a route protected with `roleGuard(['ADMIN'])`.
- **Then** it receives status `403 Forbidden`.

## 4. Security
- Hashing algorithm: **Argon2id** (via Bun.password).
- Access Token duration: 15 minutes.
- Refresh Token duration: 7 days.
- Transport: JWT in the body for mobile, compatible with SecureStore persistence.
