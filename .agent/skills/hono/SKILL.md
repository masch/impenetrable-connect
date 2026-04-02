---
name: hono
description: >
  Routing, middleware (jwt, cors, zValidator), RPC client, app.request() testing.
  Trigger: When writing Hono API endpoints, middleware or backend routes.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Writing REST API controllers
- Adding auth/cors middleware
- Connecting Zod schemas with zValidator

## Critical Patterns

- Return JSON responses strictly matching API spec with consistent Error shapes.
- Rely on `zValidator` to auto-inject typed `c.req.valid('json')`.
- Ensure routes use Hono RPC client compatibility for the mobile app.

## Code Examples

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

app.post(
  '/post',
  zValidator('json', z.object({ title: z.string() })),
  (c) => {
    const data = c.req.valid('json')
    return c.json({ success: true, title: data.title })
  }
)
```
