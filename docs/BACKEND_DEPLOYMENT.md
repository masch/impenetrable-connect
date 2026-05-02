# Backend Deployment: Cloudflare Workers + Neon

This document explains how to configure and deploy the Hono backend for the **Impenetrable Connect** project.

## 🏗️ Architecture Overview

The backend is designed to run in two distinct environments without code changes:

1.  **Development (Local)**: Runs on **Bun** using the `postgres-js` driver to connect to a local PostgreSQL container (via Podman/Docker).
2.  **Production (Cloud)**: Runs on **Cloudflare Workers** using the `@neondatabase/serverless` HTTP driver to connect to **Neon PostgreSQL**.

### The Database Factory

We use a factory pattern in `apps/backend/src/db/index.ts` that detects the environment and instantiates the correct driver:

- If the URL contains `neon.tech` → Use HTTP driver (Optimized for Edge).
- Otherwise → Use TCP driver (Standard for Local).

---

## 🔑 Secret Management

Cloudflare Workers do not use `.env` files for production secrets. Instead, they are stored securely in the Cloudflare infrastructure.

### Required Secrets

| Secret Name       | Source                                                             | Description                                                                                                         |
| :---------------- | :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`    | [Neon Console](https://neon.tech)                                  | Connection string (pooled or direct). Must include `sslmode=require`.                                               |
| `JWT_SECRET`      | User Defined                                                       | A long, random string (seed) used to sign and verify authentication tokens.                                         |
| `ALLOWED_ORIGINS` | User Defined                                                       | **REQUIRED.** Comma-separated list of allowed domains for CORS (e.g., `https://myapp.com,https://admin.myapp.com`). |
| `GITHUB_TOKEN`    | [GitHub Personal Access Token](https://github.com/settings/tokens) | [Optional] Token with `repo` scope to fetch workflow status for the health check.                                   |
| `GITHUB_REPO`     | User Defined                                                       | The repository path (e.g., `owner/repo`) to monitor in the health check.                                            |
| `HEALTH_TOKEN`    | User Defined                                                       | [Optional] A secret key required to view detailed diagnostics in `/health` via the `X-Health-Key` header.           |

### How to Configure Keys

Use the provided `Makefile` command to set secrets securely without exposing them in your terminal history:

```bash
make backend-secret-set
```

1.  Enter `DATABASE_URL` when prompted for the name and paste the Neon URL.
2.  Repeat for `JWT_SECRET` with your custom seed.
3.  Repeat for `ALLOWED_ORIGINS` to specify which domains can access your API.
4.  (Optional) Repeat for `GITHUB_TOKEN` and `GITHUB_REPO` for health check diagnostics.

---

## 🚀 Deployment Workflow

### 1. Authentication

First-time setup requires logging into Cloudflare:

```bash
make backend-login
```

### 2. Deploying Changes

To bundle and upload the backend to the Edge:

```bash
make backend-deploy
```

### 3. Monitoring Logs

To see real-time logs from the production Worker:

```bash
make backend-logs
```

---

## ⚠️ Important Considerations (Gotchas)

### Compatibility Date

In `wrangler.toml`, the `compatibility_date` MUST be set to `2024-09-23` or later. This ensures Cloudflare enables the necessary Node.js polyfills (like `fs`, `path`, `stream`) required by libraries such as `pino`.

### JWT Configuration

Hono's JWT middleware requires an explicit algorithm. We use **`HS256`** for shared-secret authentication. If omitted, the server will return a 500 error.

### Password Hashing

- **Local (Bun)**: Uses `Bun.password` (Argon2id) for maximum performance.
- **Production (Edge)**: Uses `bcryptjs` (Bcrypt) since `Bun.password` is not available in the Workers runtime.
- **Verification**: The `AuthService` automatically handles both formats to ensure a smooth transition.

### Shared Dependencies

Wrangler is configured to use `bun` as the bundler to correctly resolve workspace dependencies like `@repo/shared`.

---

## 🛠️ Troubleshooting & Debugging

### 500 Internal Server Error

If the API returns a 500 error, it is usually due to one of the following:

1.  **Missing Secret**: A required secret (like `DATABASE_URL` or `JWT_SECRET`) is not set in Cloudflare.
2.  **Missing Binding**: The secret is set in Cloudflare but NOT defined in the `Env` interface in `apps/backend/src/app.ts`.
3.  **CORS Security**: `ALLOWED_ORIGINS` is missing in production. Our policy enforces a hard-fail (500) if no origins are defined to prevent accidental insecure deployments.

**To find the root cause, run:**

```bash
make backend-logs
```

### CORS Issues

If a browser blocks your requests:

- Ensure `ALLOWED_ORIGINS` includes the full protocol (e.g., `https://domain.com`).
- Check that there are no trailing slashes in the origin unless explicitly required.

---

## 📡 Health Check

Always verify the deployment status at:
`https://impenetrable-backend.impenetrable-connect.workers.dev/health`
