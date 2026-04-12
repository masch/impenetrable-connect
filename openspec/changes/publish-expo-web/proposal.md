# Proposal: Publish Expo App Web Version

## Intent

Enable free web publishing of the Expo app to provide internet access without requiring native app installation. This addresses the need for broader accessibility through web browsers while leveraging existing Expo/EAS infrastructure.

## Scope

### In Scope

- Add web build/deploy profiles to apps/mobile/eas.json
- Create .eas/workflows/deploy-web.yml for automated deployment
- Document manual deployment commands in README
- Note free tier limitations in documentation

### Out of Scope

- Custom domain configuration (requires paid tier)
- Advanced web optimization beyond Expo defaults
- Mobile-specific feature adaptations for web

## Capabilities

### New Capabilities

- `web-deployment`: Configuration and workflows for publishing Expo web builds

### Modified Capabilities

- None

## Approach

Extend existing Expo/EAS setup to support web builds by:

1. Adding web-specific build and deploy profiles to eas.json
2. Creating GitHub Actions workflow for automated web deployment
3. Documenting manual deployment process and free tier constraints

## Affected Areas

| Area                        | Impact   | Description                    |
| --------------------------- | -------- | ------------------------------ |
| apps/mobile/eas.json        | Modified | Add web build/deploy profiles  |
| apps/mobile/.eas/workflows/ | New      | Create deploy-web.yml workflow |
| README.md                   | Modified | Add deployment documentation   |

## Risks

| Risk                       | Likelihood | Mitigation                                  |
| -------------------------- | ---------- | ------------------------------------------- |
| Exceeding free tier limits | Medium     | Monitor usage, document limits clearly      |
| Web-specific bugs          | Low        | Test web build thoroughly before deployment |
| Configuration complexity   | Low        | Keep profiles simple and well-documented    |

## Rollback Plan

1. Remove web profiles from eas.json
2. Delete .eas/workflows/deploy-web.yml
3. Revert README changes
4. No impact on existing mobile builds

## Dependencies

- Expo CLI and EAS configured (already present)
- GitHub repository with write access (for workflows)

## Success Criteria

- [ ] Web build succeeds via `eas build --profile web-preview`
- [ ] Web deploy succeeds via `eas deploy --profile web-preview`
- [ ] Automated workflow deploys on push to main
- [ ] Application accessible at expo.dev subdomain
- [ ] Documentation clear on free tier limitations
