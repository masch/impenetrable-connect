---
name: expo-dev-client
description: >
  Development builds for TestFlight (only when custom native code needed).
  Trigger: When adding native dependencies that require rebuilds outside Expo Go.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Leaving Expo Go due to custom native libraries.
- Compiling iOS Dev Client for Testflight.

## Critical Patterns

- Always rely on continuous EAS builds instead of local prebuilds to prevent git pollution in `ios/` and `android/`.
