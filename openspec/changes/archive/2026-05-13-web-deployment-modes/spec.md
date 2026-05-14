# Delta: Web Publishing — Dual Deployment Modes

## Purpose

Enable dual web deployment modes (mock and API) on the free tier. Each mode builds with distinct environment variables, producing separate deployments with different behavior.

## ADDED Requirements

### Requirement: Makefile Targets for Web Mock Mode

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

---

### Requirement: Makefile Targets for Web API Mode

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

---

### Requirement: Environment Variable Configuration

The system MUST configure distinct environment variables for each deployment mode.

#### Scenario: Mock Mode Variables

- GIVEN `make eas-export-web-mock` is invoked
- THEN environment contains `EXPO_PUBLIC_USE_MOCKS=true`
- AND `EXPO_PUBLIC_API_URL` is unset or empty

#### Scenario: API Mode Variables

- GIVEN `make eas-export-web-api` is invoked
- THEN environment contains `EXPO_PUBLIC_USE_MOCKS=false`
- AND `EXPO_PUBLIC_API_URL` set to `https://impenetrable-backend.impenetrable-connect.workers.dev`

---

### Requirement: GitHub Actions Workflow Mode Selection

The CI workflow MUST support both automatic mock deployment on merge and manual API deployment dispatch.

#### Scenario: Automatic Mock Deploy on Main Merge

- GIVEN commit pushed to `main` branch with changes in `apps/mobile/**`, `packages/shared/**`, or `apps/backend/**`
- WHEN workflow completes successfully
- THEN web-mock version deployed to `impenetrable-web-mock.expo.app`

#### Scenario: Manual API Deployment via Dispatch

- GIVEN developer triggers workflow via `workflow_dispatch` with mode `api`
- WHEN workflow completes successfully
- THEN web-api version deployed to `impenetrable-web-api.expo.app`

---

### Requirement: Makefile Help Documentation

The system MUST document all web deployment targets in the help output.

#### Scenario: Help Displays Web Mode Targets

- GIVEN developer runs `make help`
- THEN output includes `eas-export-web-mock`, `eas-deploy-web-mock`, `eas-export-web-api`, `eas-deploy-web-api` with descriptions

---

## Edge Cases

### EAS Build Failure

- GIVEN EAS build fails during `make eas-deploy-web-mock` or `make eas-deploy-web-api`
- THEN make target exits with non-zero code
- AND developer must check Expo dashboard for error details

### Rollback Strategy

- GIVEN a deployed version needs rollback
- THEN run previous target (e.g., `make eas-deploy-web-mock` to redeploy known-good version)
- OR use Expo dashboard to restore previous deployment from history
