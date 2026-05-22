# Archive Report: es2023-tosorted-migration

**Change**: es2023-tosorted-migration
**Archived**: 2026-05-19
**PR**: #196 merged
**Mode**: engram-only (no openspec artifacts required - simple syntax migration)

## Summary

Replaced 2 occurrences of `[...projects].sort()` with ES2023's native `toSorted()` method in `apps/mobile/src/hooks/useProjectSelectors.ts`. This modernizes the codebase while maintaining identical runtime behavior.

## Changes

| File                                           | Change                                          |
| ---------------------------------------------- | ----------------------------------------------- |
| `apps/mobile/src/hooks/useProjectSelectors.ts` | Line 14: `sortProjectsByActiveFirst` → toSorted |
| `apps/mobile/src/hooks/useProjectSelectors.ts` | Line 26: `sortProjectsByName` → toSorted        |

## Verification

- ✅ `make check` passes
- ✅ `make test` passes
- ✅ PR #196 merged

## Notes

- No spec or design artifacts created — simple syntax migration
- No new tests required — existing behavior verified
- ES2023 `toSorted()` is supported by TypeScript target (ESNext), Bun runtime, and React Native 0.83.4
