# Exploration: dead-code-cleanup

**Date**: 2026-05-16
**Project**: impenetrable-connect
**Artifact Store**: hybrid

## Current State

React Doctor detected **39 dead code issues** in `apps/mobile`:

```
Dead Code 39 issues
  ⚠ Exports ×32 - Unused export: getDefaultMockUserId (and more)
  ⚠ Types ×4    - Unused type: Order
  ⚠ Files ×2    - Unused file
```

## Dead Code Items (Filtered - Dead Code Only)

### Unused Exports (32 items)

| File                             | Line | Item                                |
| -------------------------------- | ---- | ----------------------------------- |
| src/mocks/users.ts               | 38   | `getDefaultMockUserId()`            |
| src/config/env.ts                | 6,15 | `env` (named + default - duplicate) |
| src/mocks/orders.ts              | -    | Multiple re-exports                 |
| src/services/status.service.ts   | -    | Unused exports                      |
| src/services/venture.service.ts  | -    | Unused exports                      |
| src/services/catalog.service.ts  | -    | Unused exports                      |
| src/mocks/catalog.ts             | -    | Unused re-exports                   |
| src/hooks/useProjectSelectors.ts | -    | Unused exports                      |
| src/services/auth-state.ts       | -    | Unused exports                      |
| src/mocks/venture-members.ts     | -    | Unused re-exports                   |
| src/mocks/agenda.ts              | -    | Unused re-exports                   |

### Unused Types (4 items)

| File                            | Line | Type    |
| ------------------------------- | ---- | ------- |
| src/services/catalog.service.ts | -    | `Order` |
| src/logic/order-actions.ts      | -    | `Order` |

### Unused Files (2 items)

| File                        | Reason                                           |
| --------------------------- | ------------------------------------------------ |
| src/config/local.example.ts | Example file - copy-to-use pattern, not imported |
| src/mocks/expo-router.tsx   | Test mock file - not used by any test            |

## Root Causes

1. **Orphan functions** - `getDefaultMockUserId()` was used in early dev but replaced by `getMockUserId()` - never cleaned up
2. **Duplicate exports** - `env.ts` exports both `export const env` and `export default env` creating redundancy
3. **Mock files not cleaned** - `expo-router.tsx` mock was created but tests use different approach
4. **Example templates** - `local.example.ts` is intentionally not imported (copy-to-use pattern)
5. **Shadowed types** - Local `Order` type definitions shadow the `@repo/shared` imports, making them redundant
6. **Re-export patterns** - Mock files re-export from `@repo/shared` but consumers import directly instead

## Prior Work

- **2026-05-13**: Previous cleanup removed 34 items (73 → 39, 47% reduction)
- Deleted: CatalogImage.tsx, ConfirmModal.tsx, SectionHeader.tsx, roles.ts
- Removed: getMomentIcon export, LogLevel type (unexported)
- Created: knip.config.js

## Current 39 Items vs Previous

The current 39 items appear to be a different set from what existed before the previous cleanup, suggesting new dead code accumulated or some items were missed.

## Approaches

| Approach                | Pros                  | Cons                      | Effort |
| ----------------------- | --------------------- | ------------------------- | ------ |
| Manual cleanup per file | Precise, low risk     | Time-consuming, 32+ items | High   |
| Auto-remove with knip   | Fast, comprehensive   | False positives risk      | Low    |
| Category-based cleanup  | Organized, systematic | Requires grouping         | Medium |

## Recommendation

**Category-based cleanup** with manual verification:

1. First delete the 2 unused files (safe)
2. Remove `getDefaultMockUserId()` from users.ts (orphan)
3. Fix duplicate export in env.ts (keep named export only)
4. For remaining exports: verify with grep before removal

## Risks

- False positives from react-doctor - always verify before deletion
- Some "unused" exports may be used dynamically (e.g., by Expo Router)
- Type-only exports might be imported for type inference only

## Ready for Proposal

**Yes** - Clear scope with 39 items across 3 categories. The change already exists in the SDD pipeline (proposal, tasks, verify-report from 2026-05-13). This exploration provides updated analysis.
