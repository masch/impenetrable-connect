# Proposal: Dead Code Cleanup

## Intent

Remove 38 dead code items (32 unused exports, 4 unused types, 1 unused file) discovered via `npx react-doctor@latest` to reduce bundle size, improve maintainability, and eliminate compile-time noise.

## Scope

### In Scope

- Remove `src/config/local.example.ts` — template file never imported
- Remove 4 unused type definitions:
  - `Order` type in `src/services/catalog.service.ts`
  - `Order` type in `src/logic/order-actions.ts`
  - 2 more types (verify in exploration)
- Remove 32 verified unused exports after grep verification:
  - `getDefaultMockUserId()` in `src/mocks/users.ts`
  - `env` duplicate export in `src/config/env.ts`
  - Unused mock re-exports across `src/mocks/*.ts`
  - Unused service exports in `src/services/*.ts`

### Out of Scope

- Architecture refactoring (Tailwind redundancies, component sizes)
- React Native migrations (vector-icons → expo-symbols)
- Correctness fixes (hydration, array keys)
- Performance optimizations (functional setState, sort)

## Capabilities

### New Capabilities

None — pure refactor/cleanup, no new behavior.

### Modified Capabilities

None — dead code removal doesn't change requirements.

## Approach

1. **Verify each export/type** — run `grep` to confirm no imports exist before removal
2. **Delete unused file** — remove `local.example.ts` after verifying no imports
3. **Run tests** — execute `npm test` before and after to ensure no regressions
4. **Commit as single unit** — dead code removal is low-risk, single PR acceptable

## Affected Areas

| Area                              | Impact   | Description                            |
| --------------------------------- | -------- | -------------------------------------- |
| `src/config/local.example.ts`     | Removed  | Unused template file                   |
| `src/config/env.ts`               | Modified | Remove duplicate `env` export          |
| `src/mocks/users.ts`              | Modified | Remove orphan `getDefaultMockUserId()` |
| `src/mocks/*.ts`                  | Modified | Remove unused re-exports               |
| `src/services/catalog.service.ts` | Modified | Remove unused `Order` type             |
| `src/logic/order-actions.ts`      | Modified | Remove unused `Order` type             |

## Risks

| Risk                          | Likelihood | Mitigation                                               |
| ----------------------------- | ---------- | -------------------------------------------------------- |
| Dynamic imports break         | Low        | Verify via grep for any `import.*local.example` patterns |
| Accidentally remove used code | Low        | Grep-verify each item before deletion; run tests after   |

## Rollback Plan

1. `git checkout -- .` to restore all deleted files
2. Revert to previous commit if tests fail post-cleanup

## Dependencies

- None — purely local code cleanup

## Success Criteria

- [ ] All 38 dead code items removed
- [ ] `npm test` passes before and after cleanup
- [ ] No regression in app functionality
- [ ] React-doctor score improves or stays same
