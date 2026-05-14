# Web Publishing Specification

> **NOTE**: This specification was updated after implementation to reflect the actual approach used.
> **Key Finding**: EAS Build does NOT support web platform - only `android`, `ios`, `all`.

## 1. Functional Requirements

### 1.1 Web Build Capability

The system MUST provide the ability to build the Expo application for web platform using EAS (Expo Application Services).

### 1.2 Web Deployment Capability

The system MUST provide the ability to deploy the built web application to Expo's web hosting service.

### 1.3 Build Approach

> **IMPORTANT**: EAS Build does NOT support web platform. Instead, use:
>
> - `bunx expo export --platform web` - Creates static bundle
> - `eas deploy` - Deploys to EAS Hosting

The Makefile provides targets for this:

- `make eas-export-web` - Export web bundle
- `make eas-deploy-web` - Deploy preview
- `make eas-deploy-web-prod` - Deploy production

### 1.4 Automated Workflow

The system MUST provide a GitHub Actions workflow that automatically builds and deploys the web version on pushes to the main branch.

### 1.5 Manual Deployment Support

The system MUST support manual web build and deployment via EAS CLI commands.

## 2. Non-Functional Requirements

### 2.1 Performance

- Web builds MUST complete within EAS free tier build time limits (typically 30 minutes)
- Deployed web application MUST load within 3 seconds on standard broadband connections

### 2.2 Reliability

- Automated workflows MUST retry failed steps up to 3 times before marking as failed
- Web deployment MUST maintain atomic updates (either fully deployed or rolled back to previous version)

### 2.3 Constraints (Free Tier Limitations)

- Web builds consume EAS build minutes from the free tier allocation
- Web hosting has bandwidth and storage limits according to Expo's free tier policy
- Free tier builds may have concurrency limits (typically 1 concurrent build)
- Free tier hosting may display Expo branding

### 2.4 Maintainability

- Configuration changes MUST be localized to eas.json and workflow files
- Documentation MUST be kept in sync with configuration changes
- All YAML and JSON files MUST be valid and lint-free

## 3. Specific Changes

### 3.1 eas.json

> **No web profiles added** - EAS Build doesn't support web platform. Keep eas.json clean:

```json
{
  "cli": {
    "version": ">= 18.6.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": { ... },
    "ios-simulator": { ... },
    "preview": { ... },
    "production": { ... }
  },
  "submit": {
    "production": {}
  }
}
```

### 3.2 Makefile Targets (NEW)

Add to Makefile:

```makefile
eas-export-web:
	cd apps/mobile && bun run export -- --platform web

eas-deploy-web:
	cd apps/mobile && eas deploy

eas-deploy-web-prod:
	cd apps/mobile && eas deploy --prod
```

### 3.2 .eas/workflows/deploy-web.yml

New file created:

```yaml
name: Deploy Web

on:
  push:
    branches: [main]
    paths:
      - "apps/mobile/**"
      - "packages/shared/**"
      - "apps/backend/**"
      - "!apps/mobile/assets/**"
      - "!apps/mobile/**/*.md"

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install Dependencies
        run: bun install

      - name: Export Web Build
        run: make eas-export-web

      - name: Deploy to EAS Hosting
        run: make eas-deploy-web-prod
```

### 3.3 Documentation Updates

Add to README.md under a new "Web Deployment" section:

````markdown
## Web Deployment

The Impenetrable Connect application can be deployed to the web using Expo's EAS Hosting service.

### Manual Web Build and Deploy

To manually build and deploy the web version:

```bash
# Export web bundle
make eas-export-web

# Deploy (preview)
make eas-deploy-web

# Deploy (production)
make eas-deploy-web-prod
```
````

### Automated Web Deployment

Web builds and deployments are automatically triggered on pushes to the `main` branch via GitHub Actions workflow (`.eas/workflows/deploy-web.yml`).

### Free Tier Limitations

When using Expo's free tier for EAS Hosting:

- **Requests**: 100,000/month (then $2/1M)
- **Bandwidth**: 100 GiB/month (then $0.10/GiB)
- **Storage**: 20 GiB (then $0.05/GiB)
- **Custom domain**: Only on paid plans

Monitor your usage in the Expo dashboard.

```

## 4. Scenarios/Use Cases

### 4.1 Manual Web Build and Deploy

**Given** a developer has access to the repository and Expo account
**When** they run `make eas-export-web`
**Then** `expo export --platform web` creates the static bundle in `dist/`
**And** the build completes successfully
**When** they run `make eas-deploy-web-prod`
**Then** EAS uploads the bundle and deploys to hosting
**And** the application becomes available at the Expo web URL

### 4.2 Automated Deployment on Push to Main

**Given** the GitHub Actions workflow is configured
**When** a push occurs to the `main` branch that affects source code
**Then** the workflow triggers automatically
**And** checks out the repository
**And** sets up Bun
**And** installs dependencies
**And** exports web bundle using (`make eas-export-web`)
**And** deploys to EAS Hosting (`make eas-deploy-web-prod`)
**Then** the web application is updated with the latest code
**And** deployment status is visible in the GitHub Actions tab

### 4.3 Monitoring Free Tier Usage

**Given** a project owner wants to monitor resource consumption
**When** they visit the Expo dashboard
**Then** they can view:
- Requests used (100k/month free)
- Bandwidth used (100 GiB/month free)
- Storage used (20 GiB free)

### 4.4 Free Tier Limits

- **Requests**: 100,000/month (then $2/1M)
- **Bandwidth**: 100 GiB/month (then $0.10/GiB)
- **Storage**: 20 GiB (then $0.05/GiB)
- **Custom domain**: Only on paid plans

## 5. Dual Deployment Modes (Mock/API)

> **Added**: 2026-05-13 — Enables both Mock and API mode deployments via dual EAS channels.

### 5.1 Makefile Targets for Web Mock Mode

The system MUST provide Makefile targets that export and deploy the web app with mock data enabled.

#### Scenario: Manual Mock Deployment

- GIVEN developer runs `make eas-export-web-mock`
- WHEN build completes successfully
- THEN exported web bundle contains `EXPO_PUBLIC_USE_MOCKS=true` embedded
- AND deploys to `impenetrable-web-mock.expo.app` URL

#### Scenario: Manual Mock Deploy

- GIVEN developer runs `make eas-deploy-web-mock`
- WHEN EAS deploys successfully
- THEN mock web app is live at `impenetrable-web-mock.expo.app`

### 5.2 Makefile Targets for Web API Mode

The system MUST provide Makefile targets that export and deploy the web app connected to production backend.

#### Scenario: Manual API Deployment

- GIVEN developer runs `make eas-export-web-api`
- WHEN build completes successfully
- THEN exported web bundle contains `EXPO_PUBLIC_USE_MOCKS=false` and production API URL
- AND deploys to `impenetrable-web-api.expo.app` URL

#### Scenario: Manual API Deploy

- GIVEN developer runs `make eas-deploy-web-api`
- WHEN EAS deploys successfully
- THEN API-connected web app is live at `impenetrable-web-api.expo.app`

### 5.3 Environment Variable Configuration

The system MUST configure distinct environment variables for each deployment mode.

#### Scenario: Mock Mode Variables

- GIVEN `make eas-export-web-mock` is invoked
- THEN environment contains `EXPO_PUBLIC_USE_MOCKS=true`
- AND `EXPO_PUBLIC_API_URL` is unset or empty

#### Scenario: API Mode Variables

- GIVEN `make eas-export-web-api` is invoked
- THEN environment contains `EXPO_PUBLIC_USE_MOCKS=false`
- AND `EXPO_PUBLIC_API_URL` set to `https://impenetrable-backend.impenetrable-connect.workers.dev`

### 5.4 GitHub Actions Workflow Mode Selection

The CI workflow MUST support both automatic mock deployment on merge and manual API deployment dispatch.

#### Scenario: Automatic Mock Deploy on Main Merge

- GIVEN commit pushed to `main` branch with changes in `apps/mobile/**`, `packages/shared/**`, or `apps/backend/**`
- WHEN workflow completes successfully
- THEN web-mock version deployed to `impenetrable-web-mock.expo.app`

#### Scenario: Manual API Deployment via Dispatch

- GIVEN developer triggers workflow via `workflow_dispatch` with mode `api`
- WHEN workflow completes successfully
- THEN web-api version deployed to `impenetrable-web-api.expo.app`

### 5.5 Makefile Help Documentation

The system MUST document all web deployment targets in the help output.

#### Scenario: Help Displays Web Mode Targets

- GIVEN developer runs `make help`
- THEN output includes `eas-export-web-mock`, `eas-deploy-web-mock`, `eas-export-web-api`, `eas-deploy-web-api` with descriptions

### 5.6 Edge Cases

#### EAS Build Failure

- GIVEN EAS build fails during `make eas-deploy-web-mock` or `make eas-deploy-web-api`
- THEN make target exits with non-zero code
- AND developer must check Expo dashboard for error details

#### Rollback Strategy

- GIVEN a deployed version needs rollback
- THEN run previous target (e.g., `make eas-deploy-web-mock` to redeploy known-good version)
- OR use Expo dashboard to restore previous deployment from history
```
