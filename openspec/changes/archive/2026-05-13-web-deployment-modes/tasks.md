# Tasks: Web Deployment Modes

## Review Workload Forecast

| Field                   | Value        |
| ----------------------- | ------------ |
| Estimated changed lines | 50-80        |
| 400-line budget risk    | Low          |
| Chained PRs recommended | No           |
| Suggested split         | Single PR    |
| Delivery strategy       | exception-ok |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Makefile Changes

- [x] 1.1 Add PHONY entries: `eas-export-web-mock eas-deploy-web-mock eas-export-web-api eas-deploy-web-api` (line 1-20)
- [x] 1.2 Add help section entries under "🤖 EAS" with descriptions for new targets (lines 105-108)
- [x] 1.3 Add `eas-export-web-mock` target: copy `.env.mock` to `.env.local`, run `expo export -p web`
- [x] 1.4 Add `eas-export-web-api` target: copy `.env.api` to `.env.local`, override `EXPO_PUBLIC_API_URL` to `$(BACKEND_PROD_URL)`, run `expo export -p web`
- [x] 1.5 Add `eas-deploy-web-mock` target: depends on `eas-export-web-mock`, deploy to `production-mock` channel
- [x] 1.6 Add `eas-deploy-web-api` target: depends on `eas-export-web-api`, deploy to `production-api` channel
- [x] 1.7 Update help text to mark `eas-deploy-web` and `eas-deploy-web-prod` as legacy (optional)

## Phase 2: GitHub Actions Workflow Update

- [x] 2.1 Add `workflow_dispatch` inputs with `mode` selector (mock | api), default to mock
- [x] 2.2 Add `env` block with `DEPLOY_MODE` from `github.inputs.mode`
- [x] 2.3 Update Export step: use `eas-export-web-mock` or `eas-export-web-api` based on mode
- [x] 2.4 Update Deploy step: use `eas-deploy-web-mock` or `eas-deploy-web-api` based on mode

## Phase 3: Testing/Verification

- [ ] 3.1 Verify `make eas-export-web-mock` runs locally and produces bundle with mock flag
- [ ] 3.2 Verify `make eas-export-web-api` runs locally and embeds production URL
- [ ] 3.3 Verify workflow triggers on push to main (mock mode default)
- [ ] 3.4 (Manual) Test `workflow_dispatch` with mode=api to verify deploy to API channel

## Implementation Order

Makefile changes (1.1-1.7) should be completed first since GitHub workflow depends on those targets existing. Testing can proceed after both files are updated.

## Notes

- Legacy targets `eas-deploy-web` and `eas-deploy-web-prod` remain unchanged for backward compatibility
- API mode uses existing `$(BACKEND_PROD_URL)` variable defined in Makefile
- EAS channels auto-created on first deploy
