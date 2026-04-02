---
name: drizzle-orm
description: >
  Schema patterns, relations, transactions, migration workflow for Backend Database.
  Trigger: When creating/modifying database schemas, queries or database transactions.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Creating new DB schemas
- Altering existing tables
- Defining Drizzle queries
- Setting up migrations

## Critical Patterns

- Always use the precise PostgreSQL data types.
- Ensure strict type safety by exporting `typeof` for insertion and selection schemas.
- Use explicit foreign keys.
- Write queries utilizing the Drizzle syntax without raw SQL strings where possible.

## Code Examples

```typescript
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

## Commands

```bash
bunx drizzle-kit generate:pg
```
