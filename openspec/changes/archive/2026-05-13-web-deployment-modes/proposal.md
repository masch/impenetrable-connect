# Proposal: Web Deployment Modes

## Intent

Enable both Mock and API modes for web deployment on the free tier. Currently, the web build uses a compile-time ternary (`env.USE_MOCKS ? MockX : RestX`) with no environment variable injection during build, preventing users from testing both modes via separate deployments.

## Scope

### In Scope

- Add Makefile targets for mock and API mode builds
- Create separate EAS projects/channels for mock and API variants
- Update GitHub Actions workflow for mode selection
- Document deployment commands for each mode

### Out of Scope

- Refactoring services to support runtime mode switching (single build)
- Modifying the existing mobile app build configuration
- Creating custom domains (paid feature)

## Capabilities

### Modified Capabilities

- `web-publishing`: Extend to support dual deployment modes (mock/API) instead of single compile-time behavior

## Approach

**Option A (Selected): Dual EAS Projects**

Create two separate EAS projects with distinct URLs:

- Mock: `impenetrable-web-mock.expo.app` — builds with `EXPO_PUBLIC_USE_MOCKS=true`
- API: `impenetrable-web-api.expo.app` — builds with `EXPO_PUBLIC_USE_MOCKS=false` + production API URL

1. **Makefile changes**: Add targets for each mode
   - `eas-export-web-mock` — exports with mock mode
   - `eas-deploy-web-mock` — deploys mock to EAS
   - `eas-export-web-api` — exports with API mode
   - `eas-deploy-web-api` — deploys API to EAS

2. **EAS projects**: Use separate EAS projects or channels (production-mock, production-api)

3. **GitHub Actions**: Update workflow to support mode selection via `workflow_dispatch` or separate jobs

## Affected Areas

| Area                               | Impact   | Description                                    |
| ---------------------------------- | -------- | ---------------------------------------------- |
| `Makefile`                         | Modified | Add web-mock and web-api targets               |
| `.github/workflows/deploy-web.yml` | Modified | Add mode selection (dispatch or separate jobs) |
| `docs/`                            | Modified | Update web deployment documentation            |

## Risks

| Risk                                   | Likelihood | Mitigation                                       |
| -------------------------------------- | ---------- | ------------------------------------------------ |
| EAS free tier build limits             | Medium     | Mock and API share quota; monitor usage          |
| Duplicate EAS project setup complexity | Low        | Use channels within single project if sufficient |

## Rollback Plan

- Revert Makefile targets to original single web deployment
- Remove or disable added GitHub Actions jobs
- Document single deployment approach in README

## Dependencies

- EAS account access to create additional project/channel
- Expo dashboard access for URL management

## Success Criteria

- [ ] Mock mode deploys to separate URL (e.g., `impenetrable-web-mock.expo.app`)
- [ ] API mode deploys to separate URL (e.g., `impenetrable-web-api.expo.app`)
- [ ] Both modes are reachable and functional
- [ ] GitHub Actions workflow supports mode selection
- [ ] Documentation updated with new commands
