# Specification: backend-cloud-deployment

## Goal

Establish a reliable, scalable, and secure deployment pipeline for the Hono backend on Cloudflare Workers, ensuring consistent connectivity to the Neon PostgreSQL database.

## Scenarios

### Scenario 1: Production Environment Detection

**Given** the backend is running on Cloudflare Workers
**When** the application starts
**Then** it MUST detect the production environment via the `NODE_ENV` or a custom `ENVIRONMENT` variable
**And** it MUST initialize the `@neondatabase/serverless` HTTP driver instead of the local `postgres` driver.

### Scenario 2: Successful Deployment

**Given** the developer runs `make backend-deploy`
**When** Wrangler authenticates and bundles the code
**Then** the Hono API MUST be accessible via the assigned Cloudflare Workers URL
**And** it MUST correctly resolve shared dependencies from the `@repo/shared` package.

### Scenario 3: Secure Neon Connectivity

**Given** the backend is deployed in production
**When** a request requires database access
**Then** it MUST use the `DATABASE_URL` secret stored in Cloudflare
**And** the connection MUST be encrypted (SSL/TLS) as enforced by Neon.

### Scenario 4: Local Fallback Development

**Given** a developer is working locally with `make backend`
**When** no Cloudflare environment is detected
**Then** the backend MUST fall back to the local Podman/Docker database connection
**And** it MUST use the local `.env` file for configuration.

### Scenario 5: Healthcheck Verification

**Given** the backend is successfully deployed to Cloudflare
**When** a GET request is sent to the `/health` endpoint
**Then** it MUST return a `200 OK` status code
**And** it MUST return a JSON response with `status: "ok"`
**And** it SHOULD include the environment name (e.g., `"env": "production"`) to confirm the configuration.
