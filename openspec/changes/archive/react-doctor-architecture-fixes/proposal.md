# Proposal: React Doctor Architecture Fixes

## Intent

Improve code quality and React Compiler compatibility by fixing the 41 architecture warnings reported by `npx react-doctor@latest`. The changes are purely mechanical refactors with zero behavioral impact—replacing `router.push()` calls with destructured methods and standardizing Tailwind size classes.

## Scope

### In Scope

- Fix 17 "React compiler destructure method" issues (extract `push` from `router` object)
- Fix 17 "redundant size axes" issues (`w-N h-N` → `size-N` shorthand)
- Verify all existing tests pass (`make test`)
- Verify app builds successfully

### Out of Scope

- 4 "Giant component" issues (300+ lines) — defer to follow-up
- 2 "No render in render" issues — defer to follow-up
- 1 "Non-generic handler names" issue — defer to follow-up

## Capabilities

### New Capabilities

None — this is a mechanical refactor with no new behavior.

### Modified Capabilities

None — no spec-level requirements change.

## Approach

1. **Destructure fixes**: Use find/replace to extract methods from router object:
   - `router.push()` → `const { push } = router; push(...)`
   - Pattern applies to `router.push`, `router.replace`, `router.back`

2. **Size axis fixes**: Replace Tailwind duplicate classes with shorthand:
   - `w-4 h-4` → `size-4`
   - `w-6 h-6` → `size-6`
   - Etc.

3. **Verification**: Run `npx react-doctor` to confirm zero destructure and size warnings.

## Affected Areas

| Area                             | Impact   | Description                        |
| -------------------------------- | -------- | ---------------------------------- |
| `src/app/auth/login.tsx`         | Modified | 4 destructure fixes                |
| `src/app/tourist/booking.tsx`    | Modified | 6 destructure + size fixes         |
| `src/app/tourist/index.tsx`      | Modified | 2 destructure + size fixes         |
| `src/app/tourist/orders.tsx`     | Modified | 1 destructure + size fixes         |
| `src/app/admin/project/[id].tsx` | Modified | 2 destructure + size fixes         |
| Multiple files                   | Modified | ~21 instances of `w-N h-N` pattern |

## Risks

| Risk                       | Likelihood | Mitigation                                                            |
| -------------------------- | ---------- | --------------------------------------------------------------------- |
| Navigation behavior breaks | Low        | Destructured router behaves identically; verify manually after change |
| Tailwind size-N mismatch   | Low        | Tailwind `size-N` is documented shorthand for `w-N h-N`               |
| Test regression            | Low        | Run `make test` before/after; revert if failures                      |

## Rollback Plan

1. Run `git diff` to capture pre-change state
2. If issues arise: `git checkout -- .` restores all files
3. Re-run `make test` and `npx react-doctor` to confirm rollback

## Dependencies

- None — no external dependencies required

## Success Criteria

- [ ] `npx react-doctor` shows 0 "React compiler destructure method" issues
- [ ] `npx react-doctor` shows 0 "redundant size axes" issues
- [ ] `make test` passes
- [ ] App builds without errors (`npm run build` or Expo build)
