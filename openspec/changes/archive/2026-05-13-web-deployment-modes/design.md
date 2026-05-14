# Design: Web Deployment Modes

## Technical Approach

Implement dual EAS web deployment modes (mock and API) using compile-time environment variable injection via `.env` file swapping before `expo export`. Each mode builds with distinct configuration embedded at build time, producing separate deployments with different runtime behavior.

This approach leverages the existing `.env.mock` and `.env.api` patterns already used for local development, extended with production API URL for the API mode.

## Architecture Decisions

### Decision: Environment Variable Injection Strategy

**Choice**: Copy `.env.mock` or `.env.api` to `.env.local` before running `expo export`, with API mode overriding `EXPO_PUBLIC_API_URL` to production URL.

**Alternatives considered**:

- Pass environment variables directly via command line: complex with many variables, harder to maintain
- Use EAS secrets: requires EAS project configuration, not available in free tier effectively for web
- Runtime environment detection: contradicts requirement for compile-time embedding

**Rationale**: Follows existing project pattern (see `mobile-mock`, `mobile-api` targets) where `.env.local` is copied before running. Simple, consistent, and works with Expo's build system.

### Decision: GitHub Actions Workflow Mode Selection

**Choice**: Add `workflow_dispatch` inputs with `mode` parameter (mock | api), defaulting to mock for automatic runs on main merge.

**Alternatives considered**:

- Separate workflow files: doubles maintenance, harder to share steps
- Branch-based: complicates CI logic, main branch already has path filters

**Rationale**: Single workflow file maintains DRY principle. Default to mock preserves current behavior (automatic deploy on main merge uses mock). Manual dispatch allows API mode when needed.

### Decision: EAS Channel/Project Strategy

**Choice**: Use separate EAS channels within a single EAS project (`production-mock`, `production-api`) rather than separate EAS projects.

**Alternatives considered**:

- Separate EAS projects: requires additional project setup, more complex credentials
- Single channel with different deployment URLs: not possible with EAS hosting

**Rationale**: Simpler setup, single set of credentials, uses free tier effectively. Both channels deploy to different URLs within same project.

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Developer / CI                             │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
    make eas-export-web-mock            make eas-export-web-api
            │                                   │
            ▼                                   ▼
    Copy .env.mock → .env.local       Copy .env.api → .env.local
                                          │
                                          ▼
                               Override EXPO_PUBLIC_API_URL
                               to production backend URL
            │                                   │
            ▼                                   ▼
    expo export -p web                   expo export -p web
    (bundles EXPO_PUBLIC_USE_MOCKS=true) (bundles USE_MOCKS=false + prod URL)
            │                                   │
            ▼                                   ▼
    make eas-deploy-web-mock            make eas-deploy-web-api
            │                                   │
            ▼                                   ▼
    Deploy to EAS channel:              Deploy to EAS channel:
    production-mock                      production-api
            │                                   │
            ▼                                   ▼
    https://impenetrable-web-mock.expo.app  https://impenetrable-web-api.expo.app
```

## File Changes

| File                               | Action | Description                                                          |
| ---------------------------------- | ------ | -------------------------------------------------------------------- |
| `Makefile`                         | Modify | Add PHONY entries and targets for web-mock and web-api deployment    |
| `.github/workflows/deploy-web.yml` | Modify | Add `workflow_dispatch` inputs for mode selection, conditional steps |

### Makefile Changes

1. Add to `.PHONY`: `eas-export-web-mock eas-deploy-web-mock eas-export-web-api eas-deploy-web-api`
2. Add help section entries for new targets
3. Add new targets:
   - `eas-export-web-mock`: Copy `.env.mock`, run `expo export -p web`
   - `eas-deploy-web-mock`: Depends on export, deploy to production-mock channel
   - `eas-export-web-api`: Copy `.env.api` with production URL override, run `expo export -p web`
   - `eas-deploy-web-api`: Depends on export, deploy to production-api channel

### GitHub Actions Changes

1. Add `inputs` to `workflow_dispatch`:
   ```yaml
   mode:
     description: "Deployment mode"
     required: true
     default: "mock"
     type: choice
     options: ["mock", "api"]
   ```
2. Add `env` block with `DEPLOY_MODE` from `github.inputs.mode`
3. Conditional step execution based on `DEPLOY_MODE`

## Interfaces / Contracts

### Makefile Targets

```makefile
# Export targets (build without deploy)
eas-export-web-mock:
    # Builds web with EXPO_PUBLIC_USE_MOCKS=true
    cp $(MOBILE_DIR)/.env.mock $(MOBILE_DIR)/.env.local
    cd $(MOBILE_DIR) && bunx expo export -p web

eas-export-web-api:
    # Builds web with USE_MOCKS=false + production API URL
    cp $(MOBILE_DIR)/.env.api $(MOBILE_DIR)/.env.local
    cd $(MOBILE_DIR) && \
        EXPO_PUBLIC_API_URL=$(BACKEND_PROD_URL) bunx expo export -p web

# Deploy targets (export + deploy)
eas-deploy-web-mock: eas-export-web-mock
    cd $(MOBILE_DIR) && bunx eas-cli@$(EAS_CLI_VERSION) deploy --channel production-mock

eas-deploy-web-api: eas-export-web-api
    cd $(MOBILE_DIR) && bunx eas-cli@$(EAS_CLI_VERSION) deploy --channel production-api
```

### GitHub Actions Workflow Inputs

```yaml
workflow_dispatch:
  inputs:
    mode:
      type: choice
      options: [mock, api]
      default: mock
```

## Testing Strategy

| Layer | What to Test                                            | Approach                                                                |
| ----- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| Local | `make eas-export-web-mock` produces bundle with mocks   | Run target, verify `.env.local` copied, check output contains mock flag |
| Local | `make eas-export-web-api` produces bundle with prod URL | Run target, verify output embeds production API URL                     |
| CI    | Mock mode runs on main merge                            | Verify workflow triggers on push to main                                |
| CI    | API mode runs on manual dispatch                        | Trigger workflow_dispatch with mode=api, verify deploy to API channel   |

**Note**: Full EAS deployment testing requires EAS credentials and is performed manually or in CI with secrets configured.

## Migration / Rollback

No migration required. This change adds new functionality without modifying existing behavior:

- Existing `eas-export-web` and `eas-deploy-web` targets remain unchanged
- Existing `deploy-web.yml` workflow behavior preserved (default mock on main merge)

**Rollback**: If issues occur, revert to previous Makefile/workflow versions. Both deployments are independent — a rollback to mock or API does not affect the other.

## Open Questions

- [ ] Should `eas-deploy-web` (without suffix) continue to default to mock, or be deprecated?
  - Recommendation: Keep as-is for backward compatibility, document as "legacy mock target"
- [ ] Do we need to pre-create EAS channels `production-mock` and `production-api`, or does `eas deploy --channel` auto-create?
  - Based on EAS CLI behavior, channels are auto-created on first deploy
