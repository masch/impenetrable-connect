# Skill Registry - impenetrable-connect

## Project Standards

### Global Context

- **AI Review Formatting (gga)**: MANDATORY: Every automated review MUST start with `STATUS: PASSED` or `STATUS: FAILED` on the **VERY FIRST LINE** of the output. No exceptions. Detailed analysis must follow ONLY after this status line.

- **Language Policy**: ALL technical metadata, including code comments, docstrings, and Git metadata (Commit messages, PR descriptions), MUST be written in **English**. The project's "Technical Esperanto" is English, regardless of the conversation language.
- **Command Policy: Make-First**: ALWAYS use `make <command>` for ANY development execution. Direct use of `bun`, `npm`, or `yarn` is STRICTLY PROHIBITED. If a required command is missing from the `Makefile`, ASK the user to add it first.
- **Code Quality & Formatting (Prettier-First Policy)**: ALL code files MUST strictly adhere to the project's `.prettierrc` configuration.
  - **Tab Width**: 2 spaces.
  - **Quotes**: Double quotes (`"`) for strings.
  - **Semicolons**: Always required (`true`).
  - **Trailing Commas**: Always required for all members (`all`).

### TypeScript

- **Strict Typing (Zero-Any Policy)**: The use of `any` is strictly prohibited in BOTH production and test code (including mocks and helpers).
  - "It's just a test" is NOT a valid justification for `any`.
  - Use `Record<string, unknown>` for generic objects or `unknown` with type guards/narrowing.
  - For store mocks, use `Partial<StoreState>` or specialized mock interfaces.
- **Immutability**: Use `const` over `let` wherever possible.
- **Contract Definition (Interface-First Policy)**: ALWAYS use `interface` for object definitions, component props, and service contracts. The use of `type` for simple object definitions is STRICTLY PROHIBITED. `type` is ONLY permitted for Unions, Intersections, Primitives, or Utility Types (e.g., `Omit`, `Pick`) where an `interface` is technically impossible. When using a `type` for a Union of props, all constituent members MUST be defined as `interface` first to maintain extensibility and declaration merging capabilities.
- **Enum Standardization (Screaming Case Policy)**: ALL Enum members and constant keys intended for logical mapping or comparison MUST use `SCREAMING_SNAKE_CASE`. This ensures direct compatibility with translation keys and consistency across the monorepo.
  - **Naming**: Enum names should be `PascalCase` (e.g., `UserRole`).
  - **Members**: Members must be `SCREAMING_SNAKE_CASE` (e.g., `TOURIST`, `SERVICE_MOMENT`).
  - **Rationale**: This eliminates the need for string transformations (like `.toUpperCase()`) during comparisons or i18n key construction, supporting the Zero-Transformation Policy.

### React & React Native

- **Functional Components**: Use functional components with hooks only.
- **Imports**: No legacy `import * as Library`. Use named imports (e.g., `import { useState }`, `import { impactAsync }`). This rule is **UNIVERSAL** for all libraries (React, Expo, etc.) to ensure consistency and support effective tree-shaking.
- **Button Standardization (Zero-Pressable Policy)**: Manual use of `TouchableOpacity` or `Pressable` is STRICTLY PROHIBITED across the entire mobile application, NO EXCEPTIONS. **[EXCEPTION: `src/components/FormSwitch.tsx` is permitted to use `Pressable` to maintain high-precision toggle animations and custom layout density that conflict with standard Button padding/ripple behaviors]**. For ANY other interactive element—including standard buttons, custom Cards, Date Selectors, or List Items—you MUST use the centralized `Button` component (`src/components/Button.tsx`). Even if you only need a touchable wrapper for a complex layout, use the `children` prop of the `Button` component (with `variant="ghost"` if no styling is needed). This ensures consistent touch feedback, accessibility roles, and centralized interaction management. Using `Pressable` elsewhere is considered a critical architectural failure.
- **Accessibility**: All images must have descriptive `alt` text (web) or `accessibilityLabel` (native).
- **Performance**: Use dynamic components with `FlashList` for long lists and avoid heavy JS-side animations.
- **Localization (i18n)**:
  - **No defaultValue**: NEVER use the `defaultValue` option in `t()` calls. Missing keys MUST remain visible (showing the key name) to ensure they are detected and fixed during development.
  - **Pluralization**: Use standard i18n pluralization keys (e.g., `one`, `other`) instead of manual ternary operators or conditional strings in the code.
  - **Variables**: Always pass context variables (count, name, etc.) to the translation function instead of hardcoding formatted strings.
    - **Localization & Data (Zero-Transformation Policy)**: ALL data formatting and text transformations are STRICTLY PROHIBITED via native JavaScript methods (`.toUpperCase()`, `.toLocaleString()`, `.toLocaleDateString()`, etc.) directly within components.
    - **For Display**: ALWAYS use CSS/Tailwind utilities (e.g., `uppercase`, `capitalize`) for text styling.
    - **For Formatting**: ALWAYS use centralized utility functions (e.g., `formatCurrency`, `formatDate` from `src/logic/formatters.ts`). This ensures a Single Source of Truth (SSoT) for project-wide formatting standards and facilitates future locale changes.
    - **For Logic**: Data MUST be normalized at the source (API/Store/Enums). Using transformations to compare values is considered an architectural failure.
    - **Observability**: This ensures translation keys (e.g., `[missing_key]`) remain raw and identifiable in the UI, avoiding "disguised" keys that hinder development.
- **Loading State Standard**: Every screen OR **independent section** that fetches async data MUST use the centralized `LoadingView` component (`src/components/LoadingView.tsx`). Manual use of `ActivityIndicator` for screen-level or section-level loading is STRICTLY PROHIBITED. The component handles both the spinner and the `t('loading')` label by default.
- **Current Value Reference (UX Pattern)**: For editable fields or configuration counters, ALWAYS display the "current value" (labeled e.g., `current_value`) as a secondary reference near the input/control. This prevents user memory overload during adjustments.
- **Icon Accessibility (a11y)**: ALL `MaterialCommunityIcons` (or any icon components) that are **interactive** (e.g., inside a `Button`) or provide **semantic context** MUST include an `accessibilityLabel`. This ensures Screen Reader users understand the action (e.g., "Increase capacity", "Decrease capacity") or the section meaning (e.g., "Visitor Capacity").
- **JSX Ternary Hygiene**: For large conditional blocks (e.g., wrapping a `ScrollView`), maintain clear indentation and use comments like `} // isLoading` at the end of complex ternary blocks to prevent "Adjacent JSX elements" syntax errors.
- **AppAlert Standardization**: ALWAYS use the centralized `AppAlert` component (`src/components/AppAlert.tsx`) for any modal confirmation or alert message. Manual use of `Alert.alert` from React Native is STRICTLY PROHIBITED to maintain visual consistency and support the project's premium design system.
- **Entity-Agnostic Modals (Decoupling Pattern)**: Modal components designed for entity creation or modification MUST remain **agnostic of the parent aggregate and its identification context**.
  - **No ID Leakage**: Modals should NOT receive or return database IDs (e.g., `orderId`, `userId`).
  - **Attribute-Focused**: They must exclusively manage and return the **attributes** being edited.
  - **Closure-Based Binding**: The **Parent** component is responsible for binding the specific ID or context using functional closures in callbacks (e.g., `onConfirm={(data) => handleUpdate(data, entityId)}`).
  - **Explicit Intent**: Use a semantic `mode: 'add' | 'edit'` prop to drive UI states/labels instead of using the presence or absence of data/IDs as a proxy for intent.
- **Testability Standard (testID Policy)**: ALL interactive components (Buttons, Inputs, Switches) and key data containers (Labels, Cards, Sections) MUST expose and implement a `testID` prop. This ensures tests remain decoupled from implementation details like text content or translations (i18n), preventing fragile tests that break upon copy changes. Selectors in tests MUST prioritize `testID` over text-based matching whenever possible.
- **Safety-First Toggles (Guardrail Pattern)**: For switches controlling critical business states (e.g., Venture Activation, Project Shutdown, Data Deletion):
  - **Contextual Legend**: MUST display a clear, high-visibility explanation of the impact below the toggle. For negative impacts, use a dedicated warning box with an icon.
  - **Explicit Confirmation**: MUST trigger a mandatory confirmation dialog (`AppAlert`) detailing the specific consequences before the change is applied to the state.

### Styling (NativeWind v4 + Tailwind v3)

- **Utilities First**: Use NativeWind CSS utilities only. No inline `style={...}`.
- **Design Tokens**: Never hardcode colors/spacing. Use the established design system tokens.
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
- **Centralized Logging (Zero-Console Policy)**: Direct use of `console.log`, `console.warn`, or `console.error` is STRICTLY PROHIBITED in BOTH Backend and Mobile applications, NO EXCEPTIONS.
  - **Backend**: ALWAYS use the centralized `logger` service (`apps/backend/src/services/logger.service.ts`).
  - **Mobile**: ALWAYS use the centralized `logger` service (`apps/mobile/src/services/logger.service.ts`).
  - **Rationale**: This ensures structured logging, consistent metadata (levels, context), and professional observability. Direct console calls are considered a critical architectural failure and will be flagged as a violation.
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
- **ZERO TOLERANCE: Absolute Prohibition of `--no-verify`**: Under NO circumstances—regardless of change size, linter strictness, or audit tool (`gga`) formatting errors/ambiguity—shall an agent use `--no-verify` or any bypass mechanism. There is NO "justified bypass". If a quality gate does not return an official, unambiguous 'PASSED' status, you MUST HALT immediately and escalate to the human lead. Bypassing quality gates is a direct violation of project integrity. Shortcuts are the death of quality. NO EXCEPTIONS.
- **Branching**:
  - **Always Start from Fresh Main**: BEFORE starting any new feature (creating a branch or beginning work), MUST switch to `main`, pull the latest remote changes (`git pull origin main`), and ONLY THEN create the new feature branch. Starting from a stale state is STRICTLY PROHIBITED.
  - Always create a descriptive feature branch (e.g., `issue-#/short-description`).
- **Pull Requests**: Every change must be submitted via a PR linked to the issue.
- **Commits**: Use conventional commits only. No AI attribution in commit messages.
- **Commit Security (GPG/SSH)**: If GPG/SSH signing is enabled in the repository configuration (`commit.gpgsign=true`), the agent is **STRICTLY PROHIBITED** from using `--no-gpg-sign` to bypass it. In such cases, the agent MUST:
  1. Complete the work and run all quality checks (`make check`).
  2. Add files to the staging area (`git add`).
  3. **STOP** and request the user to execute the final `git commit` to ensure the cryptographic chain of trust is maintained. Bypassing security signatures is a direct violation of project integrity.
- **Pull Request Standards**:
  - **MANDATORY**: Every PR body MUST include a "Test Summary" following this exact format: `✅ PASS: X total tests, make check successful`.
  - **Pre-Creation Protocol**: AGENTS MUST read `.github/PULL_REQUEST_TEMPLATE.md` before executing `gh pr create` to ensure all sections are filled correctly. Relying on memory is NOT allowed.
  - **Label Verification**: ALWAYS run `gh label list` before adding labels to a PR to ensure compliance with project-specific naming (e.g., `type:feature` vs `type:feat`).
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
