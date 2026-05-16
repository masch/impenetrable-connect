# Tasks: Dead Code Cleanup

## Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Verify Baseline

- [x] 1.1 Run `make test` in apps/mobile to confirm baseline (tests passing)
- [x] 1.2 Grep-verify each item below is truly unused before removal

## Phase 2: Remove Unused File

- [x] 2.1 Delete `apps/mobile/src/config/local.example.ts` — template never imported

## Phase 3: Remove Unused Exports

- [x] 3.1 Edit `apps/mobile/src/mocks/users.ts` — remove `getDefaultMockUserId()` export (line 38)
- [x] 3.2 Edit `apps/mobile/src/config/env.ts` — remove duplicate named `env` export (keep default only, line 6)
- [x] 3.3 Verify and remove any other unused mock re-exports

## Phase 4: Remove Unused Type Re-exports

- [x] 4.1 Edit `apps/mobile/src/services/catalog.service.ts` — remove `export type { Order }` (line 29)
- [x] 4.2 Verify `Order` type in `apps/mobile/src/logic/order-actions.ts` — imported from @repo/shared, not a local type to remove

## Phase 5: Verification

- [ ] 5.1 Run `make test` — verify all tests still pass
- [ ] 5.2 Run `git status` to review changes
- [ ] 5.3 Verify no regressions in app functionality

## Phase 6: Commit

- [ ] 6.1 Stage all changes: `git add -A`
- [ ] 6.2 Commit: `git commit -m "chore(mobile): remove dead code (X items)"`

---

## Verified Unused Items

| Item                   | File                                        | Verification                   |
| ---------------------- | ------------------------------------------- | ------------------------------ |
| local.example.ts       | apps/mobile/src/config/                     | grep shows only self-reference |
| getDefaultMockUserId() | apps/mobile/src/mocks/users.ts              | grep shows only definition     |
| env (named export)     | apps/mobile/src/config/env.ts               | duplicate of default export    |
| Order type re-export   | apps/mobile/src/services/catalog.service.ts | no imports found               |

## Notes

- This is a LOW-RISK refactor — code removal only, no behavior changes
- Run tests before and after to confirm no regressions
- Total items verified: ~4 items (file, exports, types)
