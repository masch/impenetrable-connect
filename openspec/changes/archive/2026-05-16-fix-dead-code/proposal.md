# Proposal: Fix Dead Code

## Intent

Remove dead code identified by `npx react-doctor@latest` to clean up unused exports and improve code hygiene. This resolves technical debt from incomplete cleanup in previous sessions.

## Scope

### In Scope

- Remove unused `isDev` export from `apps/mobile/src/config/env.ts`
- Remove unused `BookingInput` type from `apps/mobile/src/services/catalog.service.ts`

### Out of Scope

- No refactoring of existing code behavior
- No changes to test files unless directly affected

## Capabilities

### New Capabilities

None — this is a cleanup task with no behavioral changes.

### Modified Capabilities

None — no spec-level behavior changes.

## Approach

Simple removal of unused exports:

1. Delete `export const isDev` from env.ts line 18
2. Delete `export type BookingInput` from catalog.service.ts line 39
3. Verify react-doctor passes with no dead code warnings

## Affected Areas

| Area                                          | Impact  | Description                                 |
| --------------------------------------------- | ------- | ------------------------------------------- |
| `apps/mobile/src/config/env.ts`               | Removed | Delete unused `isDev` export (line 18)      |
| `apps/mobile/src/services/catalog.service.ts` | Removed | Delete unused `BookingInput` type (line 39) |

## Risks

| Risk                            | Likelihood | Mitigation                               |
| ------------------------------- | ---------- | ---------------------------------------- |
| Accidentally removing used code | Low        | Verify with grep before/after; run tests |

## Rollback Plan

Simple git revert:

```bash
git revert <commit-hash>
```

Or manually restore the deleted lines from git history.

## Dependencies

None — no external dependencies.

## Success Criteria

- [ ] `isDev` removed from env.ts (grep finds no imports)
- [ ] `BookingInput` removed from catalog.service.ts (grep finds no external imports)
- [ ] `npx react-doctor@latest` passes with no dead code warnings
- [ ] Existing tests pass
