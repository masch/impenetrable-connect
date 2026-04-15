# Skill Registry - rewilding-connect

## Project Standards

### Global Context

- **Language Policy**: ALL technical metadata, including code comments, docstrings, and Git metadata (Commit messages, PR descriptions), MUST be written in **English**. The project's "Technical Esperanto" is English, regardless of the conversation language.

### TypeScript

- **Strict Typing**: No `any` types. Use proper types or `unknown` with narrowing.
- **Immutability**: Use `const` over `let` wherever possible.
- **Contract Definition**: Prefer `interface` over `type` for objects and service definitions.

### React & React Native

- **Functional Components**: Use functional components with hooks only.
- **Imports**: No legacy `import * as React`. Use named imports (e.g., `import { useState }`).
- **Accessibility**: All images must have descriptive `alt` text (web) or `accessibilityLabel` (native).
- **Performance**: Use dynamic components with `FlashList` for long lists and avoid heavy JS-side animations.

### Styling (NativeWind v4 + Tailwind v3)

- **Utilities First**: Use NativeWind CSS utilities only. No inline `style={...}`.
- **Design Tokens**: Never hardcode colors/spacing. Use the established design system tokens.
- **Native Context**: Be aware of NativeWind v4 limitations vs v5/v6.

### Architecture & Monorepo

- **Single Source of Truth**: Shared types and validators must live in `@repo/shared`.
- **Vertical Slicing**: Keep backend routes logic in services, not in the route handler.
- **Error Handling**: Use Zod for all input validations on both sides of the bridge.

### Testing

- **TDD First**: Follow the strict TDD protocol when implementing new features.
- **Coverage**: Verify critical paths with `@testing-library/react-native`.

### Git & Workflow

- **No Direct Push**: NEVER push directly to `main` or `master`. No exceptions.
- **Issue First**: Every change MUST be linked to a GitHub issue. If no issue exists, create one BEFORE starting the work (use `issue-creation` skill).
- **Pre-Commit Validation**: ALWAYS run `make check` and ensure it passes BEFORE committing. No commit should be created with failing checks.
- **Command Policy: Make-First**: ALWAYS prefer `make <command>` over direct `bun` or `npm` commands. If a required command is missing from the `Makefile`, ASK the user to add it before proceeding.
- **Branching**: Always create a descriptive feature branch (e.g., `issue-#/short-description`).
- **Pull Requests**: Every change must be submitted via a PR linked to the issue.
- **Commits**: Use conventional commits only. No AI attribution in commit messages.
- **Pull Request Standards**:
  - Descriptions MUST include a concise test summary: `✅ PASS: X total tests, make check successful`.
  - NEVER paste full terminal logs in the description.
  - MUST link to an approved issue ("Closes #XX").
- **Post-Merge Cleanup**: When the user says "mergeado" (merged), the agent MUST:
  1. Confirm the PR and its linked issue are closed (`gh pr view` / `gh issue view`).
  2. Switch to `main` branch.
  3. Pull the latest remote changes (`git pull origin main`).
  4. Delete the local feature branch (`git branch -d branch-name`).

## User Skills

| Skill                      | Trigger                                    | Description                                |
| -------------------------- | ------------------------------------------ | ------------------------------------------ |
| drizzle-orm                | database, schema, migration, @repo/backend | Schema patterns, relations, transactions   |
| hono                       | backend, api, route, /v1/                  | Routing, middleware, RPC client            |
| expo-tailwind-setup        | tailwind, nativewind, global.css, styling  | NativeWind v4 + TW v3 setup                |
| expo-deployment            | eas build, submit, ci/cd, workflow         | EAS Build, Submit, CI/CD                   |
| expo-dev-client            | native, build-client, testflight           | Dev builds for custom native code          |
| frontend-design            | design, ui, screen, components             | Bold aesthetics, no generic AI stuff       |
| vercel-react-native-skills | flashlist, performance, gpu, animation     | 38 RN optimizations, low-end device tuning |
| web-design-guidelines      | audit, a11y, accessibility, qa             | UI audit against Vercel Guidelines         |
| issue-creation             | issue, report, bug, feature                | GitHub issue creation workflow             |
| branch-pr                  | pr, pull request, review                   | PR creation and review workflow            |
| judgment-day               | juzgar, review adversarial, dual review    | Parallel adversarial review protocol       |
| sdd-explore                | orchestrator explore, investigar           | Investigar ideas antes de un cambio        |
| sdd-propose                | orchestrator propose, propuesta            | Crear una propuesta de cambio              |
| sdd-spec                   | orchestrator spec, especificaciones        | Escribir especificaciones y escenarios     |
| sdd-design                 | orchestrator design, diseño técnico        | Crear diseño técnico y arquitectura        |
| sdd-tasks                  | orchestrator tasks, tareas                 | Desglose de tareas de implementación       |
| sdd-apply                  | orchestrator implement, aplicar            | Implementar cambios de código              |
| sdd-verify                 | orchestrator verify, verificar             | Validar implementación vs specs            |
| sdd-archive                | orchestrator archive, archivar             | Sincronizar y cerrar un cambio             |
| skill-registry             | update skills, skill registry              | Administrar este registro de habilidades   |
