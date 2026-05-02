# Exploration: backend-cloud-deployment

## Context

Deploy the Hono-based backend to Cloudflare Workers while maintaining the current Bun monorepo structure and connecting to a Neon PostgreSQL database.

## Technical Investigation

### 1. Cloudflare Workers + Bun Monorepo

Cloudflare Workers (Wrangler) has built-in support for Bun, but we need to ensure the monorepo structure is handled correctly (importing from `@repo/shared`).

- **Entry Point**: `apps/backend/src/index.ts`.
- **Adapter**: Hono handles the Cloudflare adapter automatically or via `hono/cloudflare-workers`.
- **Wrangler**: Need a `wrangler.toml` in `apps/backend/`.

### 2. Neon DB + Drizzle in Serverless

Neon requires the `@neondatabase/serverless` driver for HTTP-based connections in edge environments like Workers.

- **Dependencies**: Already have `@neondatabase/serverless` in `apps/backend/package.json`.
- **Driver Choice**: Use `drizzle-orm/neon-http` for non-pooling HTTP connections.
- **Connection String**: MUST use the pooled connection string from Neon if using WebSockets, but HTTP is preferred for Workers to avoid connection limits.

### 3. Environment Variables & Secrets

Wrangler manages secrets via `wrangler secret put`.

- `DATABASE_URL`: Neon connection string.
- `JWT_SECRET`: For authentication.

### 4. Makefile Integration

Add targets to deploy to Cloudflare:

- `make backend-deploy`: Triggers `wrangler deploy`.

## Proposed Architecture

- **Runtime**: Cloudflare Workers.
- **API Framework**: Hono.
- **Database**: Neon (Postgres).
- **ORM**: Drizzle.

## Risks & Considerations

- **Cold Starts**: Neon HTTP driver is fast, but we should monitor latency.
- **CORS**: Ensure Cloudflare handles CORS correctly for the mobile app.
- **Monorepo Bundling**: Wrangler must correctly resolve the `@repo/shared` workspace dependency.
- **Bun API Incompatibility**: The `Bun.password` API used in `AuthService` is NOT available in Cloudflare Workers. We must switch to a Web Crypto compatible hashing method (e.g., `scrypt` or a polyfill).

## Trade-off Analysis: Why Cloudflare Workers?

### Advantages (Pros)

- **Edge Performance**: Code runs at the network edge, minimizing latency for mobile users regardless of their location.
- **Cost Efficiency**: Generous free tier and pay-as-you-go model that is significantly cheaper than traditional VMs for sporadic or low-traffic APIs.
- **Hono Synergy**: Built-in compatibility with Hono's minimalist design results in extremely fast execution and tiny bundle sizes.
- **Auto-scaling**: Zero-config scaling from 0 to millions of requests.

### Disadvantages (Cons)

- **Runtime Limitations**: It doesn't run a full Node.js environment. Some NPM packages that rely on Node internals (FS, Buffer, etc.) might require polyfills or fail to run.
- **CPU Time Limits**: Each request has a strict CPU time limit (e.g., 10ms-50ms on free/bundled plans), making it unsuitable for heavy computations.
- **Database Connection Pooling**: Traditional TCP connections are problematic in serverless environments. This necessitates using HTTP-based drivers like Neon's.
- **Vendor Lock-in**: While Hono is portable, leveraging Cloudflare-specific features (KV, Durable Objects, D1) makes it harder to migrate away later.

## Decision Summary

Proceed with Cloudflare Workers using the HTTP driver for Neon. The performance gains for a mobile API and the synergy with Hono outweigh the runtime constraints, which are manageable for our current business logic.
