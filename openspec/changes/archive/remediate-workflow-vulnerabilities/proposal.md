# Proposal: Secure CI/CD Workflows against Supply-Chain Attacks

## Goal Description

Pin all remaining third-party GitHub Actions across the project's workflows to immutable 40-character commit SHAs. This mitigates the risk of supply-chain attacks via mutable tags or branch references that can be silently repointed by the action authors or malicious actors.

## Security Threat Model

### Component Overview

The CI/CD workflows (`deploy-backend.yml`, `deploy-web.yml`, `react-doctor.yml`) handle automated validation and deployments of the backend and frontend mobile/web applications.

### Entry Points and Untrusted Inputs

| Entry Point              | Type                 | Trusted? | Validation                               |
| ------------------------ | -------------------- | -------- | ---------------------------------------- |
| workflow_dispatch inputs | Action Inputs        | Yes/No   | Restricted to pre-defined choice options |
| GitHub secrets           | Workflow credentials | Yes      | Handled securely by GitHub runner        |
| Pull Request branches    | Code source          | No       | Runs millionco/react-doctor on the code  |

### Trust Boundaries and Auth Assumptions

- **Authentication**: Triggered by push/PR events or workflow dispatch authorization.
- **Authorization**: Workflows require access to high-privilege deployment tokens (`CLOUDFLARE_API_TOKEN`, `EXPO_TOKEN`, `GITHUB_TOKEN`).
- **Implicit trust**: The runners trust third-party actions downloaded during execution.

### Sensitive Data Paths

| Data Type            | Source             | Destination        | Protection                                   |
| -------------------- | ------------------ | ------------------ | -------------------------------------------- |
| Cloudflare API Token | Repository Secrets | deploy-backend.yml | Bound to production/development environments |
| Expo API Token       | Repository Secrets | deploy-web.yml     | Passed as env var during deployment          |
| GitHub Token         | Automated secret   | react-doctor.yml   | Automatically scoped to repo                 |

### Privileged Actions

| Action                | Location                 | Guard                       |
| --------------------- | ------------------------ | --------------------------- |
| Checkout repository   | Multiple                 | actions/checkout step       |
| Setup Node.js         | deploy-backend.yml:54    | actions/setup-node step     |
| Setup Bun environment | Multiple                 | oven-sh/setup-bun step      |
| Million React Doctor  | react-doctor.yml:18      | millionco/react-doctor step |
| Cloudflare deployment | deploy-backend.yml:70-72 | Executed via CF API Token   |
| Expo EAS deployment   | deploy-web.yml:41,60     | Executed via EXPO_TOKEN     |

### Priority Review Areas

1. **Third-party Action References**: Upstream compromises of these actions can result in compromise of the deployment secrets or main-branch deployment injection.

### Finding Dispositions

| Finding                                                                  | Severity | Disposition   | Rationale                                                                                 |
| ------------------------------------------------------------------------ | -------- | ------------- | ----------------------------------------------------------------------------------------- |
| Mutable checkout tag at `deploy-backend.yml:40`                          | High     | True Positive | Needs pinning to prevent runner takeover.                                                 |
| Mutable checkout tag at `deploy-web.yml:30,49`                           | High     | True Positive | Needs pinning to prevent runner takeover.                                                 |
| Mutable checkout tag at `react-doctor.yml:14`                            | High     | True Positive | Needs pinning to prevent runner takeover.                                                 |
| Mutable setup-node tag at `deploy-backend.yml:54`                        | Medium   | True Positive | Needs pinning to prevent runner takeover.                                                 |
| Mutable setup-bun tag at `deploy-backend.yml:59`, `deploy-web.yml:33,52` | Medium   | True Positive | Needs pinning to prevent runner takeover.                                                 |
| Mutable millionco/react-doctor@main tag at `react-doctor.yml:18`         | High     | True Positive | Using branch name `@main` is extremely risky as it pulls unverified changes on every run. |

---

## User Review Required

> [!WARNING]
> Since `millionco/react-doctor` does not use standard release tags and undergoes rapid updates, pinning it to a specific SHA will prevent new audit checks from automatically running. Future updates must be manually reviewed and pinned.

---

## Proposed Changes

### CI/CD Workflows

#### [MODIFY] [deploy-backend.yml](file:///home/masch/dev/js/impenetrable-connect/.github/workflows/deploy-backend.yml)

- Pin `actions/checkout@v6` to `actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` (v6.0.2)
- Pin `actions/setup-node@v4` to `actions/setup-node@1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a` (v4.2.0)
- Pin `oven-sh/setup-bun@v2` to `oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6` (v2.2.0)

#### [MODIFY] [deploy-web.yml](file:///home/masch/dev/js/impenetrable-connect/.github/workflows/deploy-web.yml)

- Pin both `actions/checkout@v6` to `actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` (v6.0.2)
- Pin both `oven-sh/setup-bun@v2` to `oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6` (v2.2.0)

#### [MODIFY] [react-doctor.yml](file:///home/masch/dev/js/impenetrable-connect/.github/workflows/react-doctor.yml)

- Pin `actions/checkout@v5` to `actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` (v6.0.2)
- Pin `millionco/react-doctor@main` to `millionco/react-doctor@241444d35287f1b4551cca921a65fb2fa67949b6`

---

## Verification Plan

### Automated Tests

- Run `make check` to verify linting and formatting.
- Execute SecureCoder scanner endpoints on the three modified files:
  - `deploy-backend.yml`
  - `deploy-web.yml`
  - `react-doctor.yml`
