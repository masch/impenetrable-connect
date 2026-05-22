# Tasks: ES2023 toSorted() Migration

## Review Workload Forecast

| Field                   | Value       |
| ----------------------- | ----------- |
| Estimated changed lines | 2           |
| 400-line budget risk    | Low         |
| Chained PRs recommended | No          |
| Delivery strategy       | ask-on-risk |
| Chain strategy          | N/A         |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal                                                      | Likely PR | Notes                      |
| ---- | --------------------------------------------------------- | --------- | -------------------------- |
| 1    | Replace `[...projects].sort()` with `projects.toSorted()` | PR 1      | Single file, 2 occurrences |

## Phase 1: Implementation

- [x] 1.1 Replace `[...projects].sort(` with `projects.toSorted(` on line 14 of `apps/mobile/src/hooks/useProjectSelectors.ts`
- [x] 1.2 Replace `[...projects].sort(` with `projects.toSorted(` on line 26 of `apps/mobile/src/hooks/useProjectSelectors.ts`

## Notes

- This is a 1:1 semantic equivalent change — ES2023's `toSorted()` mutates a copy instead of mutating the original array
- No tests required — verified in exploration phase
- No spec or design needed — pure syntax migration
- TypeScript will automatically infer the correct return type from `toSorted()`
