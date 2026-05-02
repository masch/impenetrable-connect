# Proposal: backend-cloud-deployment

## Intent

Migrate the backend API from local-only execution to a production-ready cloud environment using Cloudflare Workers and Neon DB.

## Scope

- **Backend Configuration**: Add `wrangler.toml` and configure for Cloudflare Workers.
- **Database Connection**: Update Drizzle initialization to support both local (node-postgres/bun) and cloud (neon-http) environments.
- **Infrastructure**: Setup environment variables and secrets management.
- **Automation**: Add deployment targets to the root `Makefile`.

## Approach

1. **Initialize Wrangler**: Create `apps/backend/wrangler.toml` with the necessary compatibility flags.
2. **Abstract DB Connection**: Create a database client factory that switches between local and cloud drivers based on the presence of `ENVIRONMENT=production`.
3. **Secret Management**: Document the required secrets for Neon and JWT.
4. **Deploy Target**: Implement `make backend-deploy` in the root Makefile using `wrangler`.

## Rollback Plan

- The local environment (`make backend`) will remain functional using the existing local database/docker setup.
- If the cloud deployment fails, the mobile app can continue to point to the local or a staging instance by changing `EXPO_PUBLIC_API_URL`.

## Affected Modules

- `apps/backend/**`
- `Makefile` (root)
- `apps/mobile/.env.*` (updates to API URL)
