---
name: expo-deployment
description: >
  EAS Build, Submit, Workflows for CI/CD.
  Trigger: When configuring GitHub actions for deployment or EAS builds.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Creating `eas.json` profiles
- Running `eas build`
- Configuring CI workflows

## Critical Patterns

- Pin EXPO SDK versions tightly.
- Use EAS Workflows for E2E CI/CD from branch push to app store.
