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
```
