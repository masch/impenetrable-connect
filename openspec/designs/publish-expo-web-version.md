# Technical Design: Expo App Web Publishing

## 1. Architecture Decisions

### Why EAS Hosting Over Alternatives

We chose EAS Hosting for web deployment due to:

1. **Unified Toolchain**: Single Expo Application Services (EAS) platform handles both mobile and web builds, reducing cognitive overhead and configuration complexity
2. **Seamless Integration**: Native integration with existing Expo project structure and build pipelines
3. **Free Tier Compatibility**: Leverages same EAS quota as mobile builds, avoiding additional costs
4. **Automated Workflows**: Built-in support for CI/CD workflows via EAS Workflows
5. **Environment Consistency**: Same environment variables and secrets management across mobile and web targets
6. **Profile Inheritance**: Natural extension of existing build profile system

Alternatives considered:

- **Vercel/Netlify**: Would require separate configuration, build scripts, and environment management, fragmenting the deployment process
- **GitHub Pages**: Limited to static sites, poor integration with Expo's web bundling, manual deployment steps
- **Custom Server**: Significant overhead for maintenance, scaling, and DevOps that contradicts our serverless preferences

### How Profiles Work

EAS profiles enable environment-specific configurations through inheritance:

- Base configurations defined in `eas.json` under `build` section
- Profiles can extend others using the `extends` property
- Platform specification via `web`, `ios`, `android` objects within profiles
- Environment variables injected per-profile via `env` objects
- Version auto-incrementing controlled via `autoIncrement` flag

## 2. Approach Details

The web build/deploy process integrates with existing Expo setup by:

1. **Extending Existing EAS Configuration**: Adding web-specific build and submit profiles to `eas.json`
2. **Leveraging Expo Web Support**: Using `expo start --web` and `expo export:web` commands under the hood
3. **Automated Workflows**: Creating EAS Workflow that triggers on git pushes to main branch
4. **Shared Resource Utilization**: Web builds consume same EAS compute minutes as mobile builds within free tier limits
5. **Unified Versioning**: Auto-incrementing version numbers shared across mobile and web via git-based versioning

## 3. Technical Details

### Profile Inheritance and Platform Specification

```json
{
  "build": {
    "web-preview": {
      "extends": "preview",
      "web": {
        "bundler": "metro",
        "output": "static"
      },
      "env": {
        "APP_VARIANT": "preview",
        "PLATFORM": "web"
      },
      "autoIncrement": true
    },
    "web-production": {
      "extends": "production",
      "web": {
        "bundler": "metro",
        "output": "static"
      },
      "autoIncrement": true
    }
  },
  "submit": {
    "web-production": {}
  }
}
```

Key aspects:

- `web-preview` and `web-production` inherit from existing `preview` and `production` profiles
- Platform-specific configuration under `web` object specifies Metro bundler and static output
- Environment variables distinguish web builds (`PLATFORM=web`)
- `autoIncrement` ensures version numbers increase with each build

### Workflow Triggering Conditions and Job Steps

Workflow file: `.eas/workflows/deploy-web.yml`

Trigger conditions:

- Push to `main` branch
- Manual workflow dispatch (for testing/redeploy)

Job steps:

1. **Checkout**: Repository code
2. **Setup Node.js**: Bun installation (matching project toolchain)
3. **Install Dependencies**: `bun install`
4. **Build Web**: `eas build --profile web-preview --auto-submit`
5. **Deploy**: Automatic submission to EAS Hosting via `eas submit`
6. **Notification**: Success/failure status reporting

### Environment Variables and Secrets

Required:

- `EXPO_TOKEN`: Authenticates EAS CLI for build/submit operations (stored as secret)
- `APP_VARIANT`: Distinguishes build variants (development/preview/production)
- `PLATFORM`: Explicitly set to "web" for web-specific logic

Secrets management:

- `EXPO_TOKEN` stored in EAS Secrets (not in repository)
- Other variables defined in workflow or eas.json
- No additional secrets needed beyond existing mobile setup

### AutoIncrement with Web Profiles

Auto-incrementing works through:

1. Git-based versioning (reads from git tags/commits)
2. Shared version counter across all profiles using same scm provider
3. Web profiles inherit `autoIncrement: true` from base profiles
4. Version format: `1.0.0` → `1.0.1` → `1.0.2` etc.
5. Ensures web and mobile builds stay synchronized in versioning

## 4. Diagrams

### Build → Submit → Deploy Process Flow

```
[Git Push to main]
        ↓
[EAS Workflow Triggered]
        ↓
[Checkout Repository]
        ↓
[Install Dependencies (bun)]
        ↓
[expo export:web]
        ↓
[Static Web Bundle Generated]
        ↓
[EAS Build: web-preview Profile]
        ↓
[EAS Submit: web-production Profile]
        ↓
[Deploy to EAS Hosting]
        ↓
[Live at https://project-name.expo.dev]
```

## 5. Implementation Considerations

### Resource Sharing in Free Tier

Web builds share EAS compute minutes with mobile builds:

- Same monthly free tier allocation consumed by both platforms
- Monitoring required to avoid exceeding limits
- Web builds typically faster/smaller than mobile native builds
- Consider scheduling web deployments less frequently if quota becomes concern

### Web-Specific Assets and Bundling

Handling considerations:

- Metro bundler optimizes web output differently than native
- Asset loading paths must be web-compatible (relative vs absolute)
- Image optimization may differ between platforms
- Web-specific CSS/NativeWind considerations already handled via existing setup
- `expo export:web` produces optimized static bundle

### Error Handling and Retry Logic

Workflow includes:

- Automatic failure notification via GitHub Actions integration
- Manual retry capability through workflow dispatch
- Build caching to speed up subsequent attempts
- Clear error logging in EAS dashboard
- No automatic retry in workflow (intentional for visibility)

## 6. Alternatives Considered

### Why Not Vercel/Netlify/GitHub Pages

**Vercel**:

- Pros: Excellent DX, automatic deployments, edge functions
- Cons: Separate config, duplicate environment management, additional cost at scale, fragmentation of deployment process

**Netlify**:

- Pros: Good static site handling, form processing
- Cons: Same fragmentation issues as Vercel, less optimal for Expo-specific bundling

**GitHub Pages**:

- Pros: Free, simple
- Cons: No support for SPA routing without workarounds, manual deployment, no integration with EAS, limited to static site generation

EAS Hosting wins due to integrated experience leveraging existing investment in Expo ecosystem.

## 7. Open Questions and Risks

### Open Questions

1. **Asset Optimization**: Should we implement additional web-specific asset optimization (image compression, code splitting)?
2. **Preview Deployments**: Should we create preview deployments for pull requests?
3. **Custom Domains**: When/how will we configure custom domains for the web version?
4. **Monitoring**: What metrics should we track for web performance and usage?

### Risks to Address

1. **Free Tier Exhaustion**: Web builds consuming mobile build quota
   - Mitigation: Monitor usage, consider separate tracking
2. **Build Time Increases**: Web builds adding to CI wait times
   - Mitigation: Optimize web bundling, consider selective deployment
3. **Environment Inconsistencies**: Differences between web and mobile environments
   - Mitigation: Strict environment variable management, comprehensive testing
4. **Routing Issues**: Web router behaving differently than native
   - Mitigation: Thorough testing of expo-router on web, fallback strategies
5. **Secret Leakage**: Accidental exposure of EXPO_TOKEN
   - Mitigation: Strict secret management, regular rotation policies
