# Skill Registry - rewilding-connect

## Project Standards

### Global Context

- **Language Policy**: ALL technical metadata, including code comments, docstrings, and Git metadata (Commit messages, PR descriptions), MUST be written in **English**. The project's "Technical Esperanto" is English, regardless of the conversation language.
- **Command Policy: Make-First**: ALWAYS use `make <command>` for ANY development execution. Direct use of `bun`, `npm`, or `yarn` is STRICTLY PROHIBITED. If a required command is missing from the `Makefile`, ASK the user to add it first.

### TypeScript

- **Strict Typing**: No `any` types. Use proper types or `unknown` with narrowing.
- **Immutability**: Use `const` over `let` wherever possible.
- **Contract Definition**: Prefer `interface` over `type` for objects and service definitions.

### React & React Native

- **Functional Components**: Use functional components with hooks only.
- **Imports**: No legacy `import * as React`. Use named imports (e.g., `import { useState }`).
- **Button Standardization**: ALWAYS use the centralized `Button` component (`src/components/Button.tsx`) for any actionable button. Manual use of `TouchableOpacity` or `Pressable` for standard action buttons is STRICTLY PROHIBITED.
- **Accessibility**: All images must have descriptive `alt` text (web) or `accessibilityLabel` (native).
- **Performance**: Use dynamic components with `FlashList` for long lists and avoid heavy JS-side animations.
- **Localization (i18n)**:
  - **No defaultValue**: NEVER use the `defaultValue` option in `t()` calls. Missing keys MUST remain visible (showing the key name) to ensure they are detected and fixed during development.
  - **Pluralization**: Use standard i18n pluralization keys (e.g., `one`, `other`) instead of manual ternary operators or conditional strings in the code.
  - **Variables**: Always pass context variables (count, name, etc.) to the translation function instead of hardcoding formatted strings.
  - **No Post-Processing transformations**: NEVER apply transformations like `.toUpperCase()` or `.toLowerCase()` directly to the result of `t()`. Use CSS utilities (e.g., `uppercase`) for styling. This ensures that missing keys remain clearly visible as `[missing_key]` and are not disguised by case changes.
- **Loading State Standard**: Every screen that fetches async data MUST use the centralized `LoadingView` component (`src/components/LoadingView.tsx`). Manual use of `ActivityIndicator` for screen-level loading is STRICTLY PROHIBITED. The component handles both the spinner and the `t('loading')` label by default.
- **JSX Ternary Hygiene**: For large conditional blocks (e.g., wrapping a `ScrollView`), maintain clear indentation and use comments like `} // isLoading` at the end of complex ternary blocks to prevent "Adjacent JSX elements" syntax errors.

### Styling (NativeWind v4 + Tailwind v3)

- **Utilities First**: Use NativeWind CSS utilities only. No inline `style={...}`.
- **Design Tokens**: NEVER use hardcoded color strings (e.g., "#fff", "red"). ALWAYS use the established design system tokens from `COLORS` in `@repo/shared`.
- **Mobile Footer Density**: For sticky footers in mobile views, prioritize a **compact single-row layout**. Avoid multi-row footers that consume excessive vertical screen real estate, especially on devices with small aspect ratios or web browsers.
- **Native Context**: Be aware of NativeWind v4 limitations vs v5/v6.

### UI/UX & Interaction Patterns

- **Loading vs. Empty States**: Never show an empty screen or list while data is fetching. Always prioritize a branded `LoadingView` over blank space to maintain perceived performance and user trust.
- **Role Parity**: The Entrepreneur (internal) experience must match the Tourist (external) experience in terms of UI polish, feedback, and loading patterns.
- **Brand Continuity**: Always use branded tokens (`COLORS.primary`) via standardized components like `LoadingView` or `Button`. Direct use of `ActivityIndicator` is allowed only for micro-interactions where `LoadingView` is too heavy (e.g., inside a button or header).
- **Manual Overrides**: ALWAYS provide a standard `RefreshControl` in scrollable lists to give the user a sense of control over data freshness.

### Architecture & Monorepo

- **Single Source of Truth**: Shared types and validators must live in `@repo/shared`.
- **Vertical Slicing**: Keep backend routes logic in services, not in the route handler.
- **Error Handling**: Use Zod for all input validations on both sides of the bridge.
- **Mock Data SSoT**: NEVER duplicate mock data across multiple files. Centralize shared entity mocks (Orders, Users, Catalog) in `src/mocks/*.data.ts` to ensure consistency across different user roles (Tourist vs. Entrepreneur).

### Testing

- **TDD First**: Follow the strict TDD protocol when implementing new features.
- **Coverage**: Verify critical paths with `@testing-library/react-native`.
- **Resilient Matchers**: Use **RegExp with case-insensitivity** for text matching (e.g., `findByText(/3[.,]000/i)`) to handle locale differences, dynamic spacing, and currency formatting.
- **Zustand Mocking**: When mocking Zustand stores (especially with `useShallow`), use a **selector-aware mock implementation**: `(sel) => (sel ? sel(state) : state)`. This ensures that both direct destructuring and selector-based hooks receive the correct state.

### Git & Workflow

- **No Direct Push**: NEVER push directly to `main` or `master`. No exceptions.
- **Issue First**: Every change MUST be linked to a GitHub issue. If no issue exists, create one BEFORE starting the work (use `issue-creation` skill).
- **Pre-Commit Validation**: ALWAYS run `make check` and ensure it passes BEFORE committing. No commit should be created with failing checks.
- **Branching**: Always create a descriptive feature branch (e.g., `issue-#/short-description`).
- **Pull Requests**: Every change must be submitted via a PR linked to the issue.
- **Commits**: Use conventional commits only. No AI attribution in commit messages.
- **Pull Request Standards**:
  - **MANDATORY**: Every PR body MUST include a "Test Summary" following this exact format: `✅ PASS: X total tests, make check successful`.
  - **Template**: ALWAYS use the provided template in `.github/PULL_REQUEST_TEMPLATE.md`.
  - Descriptions must not paste full logs; use the summary format instead.
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
