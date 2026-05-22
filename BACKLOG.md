# Pending

## Orders endpoints (booking flow)

Implement DB schema + routes for the complete booking flow:

- `POST /v1/orders`
- `GET /v1/orders`
- `PATCH /v1/orders/:id`
- `PATCH /v1/orders/:id/status`

No DB schema exists today. Scope: full backend (schema + routes + tests).

## Token persistence (SecureStore)

Today the access token lives only in memory (Zustand). App reload loses auth and requires re-login.

- Use `expo-secure-store` to persist access token and refresh token
- Hydrate store on app startup

## Serial → UUID migration

Currently some tables use `uuid` (users) while others use `serial` (projects, ventures, catalog, etc.).
Migrate all PKs to UUID for consistency. Large change: schemas, seeds, mocks, routes, tests, frontend.
