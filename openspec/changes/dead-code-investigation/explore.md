# Exploration: Dead Code Investigation

## React-Doctor Results

Running `npx react-doctor@latest` found **14 dead code issues**:

| Issue | Count | Description |
|-------|-------|-------------|
| Unused export: `isDev` | ×11 | Exported but never imported |
| Unused type: `BookingInput` | ×3 | Exported but never imported elsewhere |

## Current State

### 1. Unused Export: `isDev`

**Location:** `apps/mobile/src/config/env.ts:18`

```typescript
export const isDev = process.env.NODE_ENV !== "production";
```

**Why it's dead:** The `isDev` constant is exported but never imported anywhere in the codebase. All service files import `env` as default, not `isDev`.

**Likely cause:** In commit `157b491` ("chore(mobile): remove dead code (4 items)"), the `env` export was converted from a named export to a default export:
- `export const env` → `const env` + `export default env`

During this refactor, `isDev` was left behind as a leftover. It was probably added for debugging or conditional behavior that was later refactored away.

---

### 2. Unused Type: `BookingInput`

**Location:** `apps/mobile/src/services/catalog.service.ts:39`

```typescript
export type BookingInput = z.infer<typeof BookingInputSchema>;
```

**Why it's dead:** The type is exported from `catalog.service.ts` and used internally (lines 56, 149, 261), but no other file in the codebase imports it.

**Likely cause:** This appears to be a "leaky abstraction" — the type was exported for potential external use, but no consumer ever needed it. It's only used internally for the `updateOrder` method's input type.

---

## Why Dead Code Appeared

1. **Incomplete cleanup in previous session**: Commit `157b491` cleaned up `env` but missed `isDev`
2. **Leaky exports**: `BookingInput` was exported "just in case" but never consumed
3. **No static analysis running**: TypeScript doesn't catch unused exports (only unused variables/imports), so these slip through

## Files Affected

| File | Issue | Action |
|------|-------|--------|
| `apps/mobile/src/config/env.ts` | `isDev` unused | Remove export |
| `apps/mobile/src/services/catalog.service.ts` | `BookingInput` unused externally | Remove export (keep internal usage) |

## Recommendation

**Fix approach:** Simple removal of unused exports:

1. **For `isDev`**: Remove line 18 from `env.ts` entirely
2. **For `BookingInput`**: Change `export type BookingInput` to `type BookingInput` (keep internal usage)

**Effort:** Low — both are one-line changes with no cascading effects.

---

## Ready for Proposal

**Yes** — This is a straightforward cleanup task. The orchestrator should create an SDD change to remove these two unused exports.