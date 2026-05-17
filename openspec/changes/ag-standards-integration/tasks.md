# Tasks: Project Standards Integration to AGENTS.md

## Review Workload Forecast

| Field                   | Value                             |
| ----------------------- | --------------------------------- |
| Estimated changed lines | ~180 (139 migrated + ~40 context) |
| 400-line budget risk    | Low                               |
| Chained PRs recommended | No                                |
| Suggested split         | Single PR                         |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

## Implementation Tasks

- [ ] 1.1 Read current `AGENTS.md` structure (already completed)
- [ ] 1.2 Read current `.atl/skill-registry.md` and locate Project Standards section (lines 3-146)
- [ ] 1.3 Update `AGENTS.md` — add Project Standards section with all rules organized by category: - Global Context (identity, AI review, language, commands, GPG, PR merge, code quality) - TypeScript (strict typing, immutability, interfaces, enums) - React & React Native (components, imports, accessibility, i18n, modals) - Styling (NativeWind utilities, design tokens, mobile patterns) - UI/UX & Interaction (loading states, brand continuity, refresh controls) - Architecture & Monorepo (shared types, logging, mocking) - Backend Security (env abstraction, middleware, fail-fast) - Testing (TDD, coverage, injection patterns) - Git & Workflow (no direct push, issue-first, commits, PR standards)
- [ ] 1.4 Update Mission Control section — change reference from `.atl/skill-registry.md` to inline standards in `AGENTS.md`
- [ ] 1.5 Update skill-registry.md — remove Project Standards section, keep only User Skills table
- [ ] 1.6 Verify skill-registry tool compatibility — confirm it reads AGENTS.md correctly

## Summary

This is a straightforward content migration (~180 lines) with no integration complexity. Single PR is appropriate.
