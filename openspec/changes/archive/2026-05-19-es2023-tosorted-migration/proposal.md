# Proposal: ES2023 toSorted() Migration

## Intent

Replace the spread pattern `[...projects].sort(...)` with the native ES2023 `toSorted()` method in project selector utilities. This modernizes the codebase to use cleaner, more expressive syntax while maintaining identical runtime behavior.

## Scope

### In Scope
- Replace `[...projects].sort(...)` with `projects.toSorted(...)` in `apps/mobile/src/hooks/useProjectSelectors.ts`
- Two functions affected:
  - `sortProjectsByActiveFirst()` (line 14)
  - `sortProjectsByName()` (line 26)

### Out of Scope
- Other files or packages using similar patterns
- Other ES2023 features (e.g., `toReversed()`, `toSpliced()`)

## Capabilities

### New Capabilities
None — this is a refactor with no new functionality.

### Modified Capabilities
None — existing behavior remains unchanged.

## Approach

Direct 1:1 semantic replacement:
- `[...projects].sort((a, b) => ...)` → `projects.toSorted((a, b) => ...)`
- No logic changes, only syntax modernization

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/mobile/src/hooks/useProjectSelectors.ts` | Modified | 2 functions updated from spread+sort to toSorted |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Runtime incompatibility | Low | TS target ESNext, Bun runtime, RN 0.83.4 all support toSorted |

## Rollback Plan

Revert the two function implementations to their original `[...projects].sort(...)` form. No schema or data migration needed.

## Dependencies

- None

## Success Criteria

- [ ] Both functions in useProjectSelectors.ts use `toSorted()` instead of spread+sort
- [ ] All tests pass (`make test`)
- [ ] No TypeScript errors (`make check`)
- [ ] Runtime behavior unchanged (same output order)