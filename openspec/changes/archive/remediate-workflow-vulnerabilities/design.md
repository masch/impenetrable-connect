# Design: Pinning CI/CD Actions to Commit SHAs

## Strategy

To secure the GitHub Actions workflow environment while preserving maintainability, we will replace tag references (like `@v4` or `@main`) with the exact 40-character commit SHA of the audited release.

To maintain human readability and enable tools like Dependabot to detect updates, we append the original tag version as a comment on the same line.

## Mapping Table

| Action                   | Old Reference | Pinned SHA Reference                        | Target Version    |
| ------------------------ | ------------- | ------------------------------------------- | ----------------- |
| `actions/checkout`       | `@v6` / `@v5` | `@de0fac2e4500dabe0009e67214ff5f5447ce83dd` | v6.0.2            |
| `actions/setup-node`     | `@v4`         | `@7f8c1b2c8fb0920412802db167476e197c55d38a` | v4.2.0            |
| `oven-sh/setup-bun`      | `@v2`         | `@0c5077e685f02c6136a53f0907e59c253d717ec2` | v2.2.0            |
| `millionco/react-doctor` | `@main`       | `@241444d35287f1b4551cca921a65fb2fa67949b6` | HEAD (2026-05-23) |

## Rollback Plan

If any step fails or has issues loading the pinned actions:

1. Revert the workflow files to the previous commit.
2. Verify local runner execution.
