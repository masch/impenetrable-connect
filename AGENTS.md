# Agent Hub - impenetrable-connect

## Centralized References

- **Project Standards**: This file (AGENTS.md)
- **Agent Skills**: [.atl/skill-registry.md](.atl/skill-registry.md)

---

## Project Standards (AI-OPTIMIZED)

### Global Context

- **Project Name**: ALWAYS use `impenetrable-connect`.
- **AI Review**: START every review with `STATUS: PASSED` or `STATUS: FAILED` on the first line.
- **Language**: ALL code comments, docstrings, commits, and PR descriptions in **English**.
- **Commands**: USE `make <command>` for ANY development. NEVER use `bun`, `npm`, or `yarn` directly.
- **PR Merge Checklist**:
  1. ALL files manually reviewed
  2. ALL CI checks pass
  3. Issue linked with `status:approved`
  4. PR has exactly one `type:*` label
  5. User commented 🥦 emoji
  6. SDD Archive exists (`openspec/changes/archive/`)
- **Prettier**: Tab: 2 spaces, Quotes: `"`, Semicolons: `true`, Trailing commas: `all`.

### TypeScript

- **No `any`**: NEVER use `any` in production or tests. Use `Record<string, unknown>` or `unknown` with type guards.
- **Store Mocks**: Use `Partial<StoreState>` or mock interfaces.
- **Immutability**: ALWAYS use `const` over `let`.
- **Interfaces**: Use `interface` for object definitions. NEVER use `type` for simple objects. `type` ONLY for Unions/Intersections/Primitives.
- **Enums**: Use `SCREAMING_SNAKE_CASE` for members (e.g., `USER_ROLE.ADMIN`). NEVER use lowercase.
- **No Magic Numbers**: NEVER use hardcoded numbers inline in ANY code (production, tests, utilities). Use named constants that describe behavior.
  - **DO**: `const MAX_RETRIES = 3; const API_TIMEOUT_MS = 5000;`
  - **DON'T**: `if (attempts > 3) fetch(url, { timeout: 5000 })`
  - Exception: numbers 0, 1 used as identity/boolean logic (`index + 1`, `count === 0`) are allowed.
  - Group related constants: `const PAGINATION = { PAGE_SIZE: 20, MAX_PAGES: 10 }`

### React & React Native

- **Functional Components**: ONLY functional components with hooks. NO class components.
- **Imports**: NEVER use `import * as`. ALWAYS use named imports.
- **Buttons**:
  - EXCEPTION: `apps/mobile/src/components/FormSwitch.tsx` may use `Pressable`.
  - ALL other interactive elements MUST use the centralized `Button` component.
- **Accessibility**:
  - Images: `alt` (web) or `accessibilityLabel` (native).
  - Icons in Buttons: MUST have `accessibilityLabel`.
- **Lists**: Use `FlashList` for long lists. NEVER use regular FlatList.
- **i18n**:
  - NEVER use `defaultValue` in `t()` calls.
  - NEVER use `.toUpperCase()`, `.toLocaleString()`, `.toLocaleDateString()` in components.
  - Display: Use CSS/Tailwind (e.g., `uppercase`).
  - Formatting: Use centralized formatters (`formatCurrency`, `formatDate`).
  - Dates: Use `getRelativeDateLabel` for near-term context ("TODAY", "TOMORROW").
- **Loading**: ALWAYS use `LoadingView` component. NEVER use `ActivityIndicator` for screens/sections.
- **Modals**: MUST use `AppAlert` for confirmations. NEVER use `Alert.alert`.
- **testID**: ALL interactive components MUST expose `testID` prop. Tests MUST use `testID` over text matching.
- **Toggle Safety**: For critical toggles (Activation, Shutdown, Deletion):
  - Display impact explanation below toggle.
  - Trigger `AppAlert` confirmation before state change.

### Styling (NativeWind v4 + Tailwind v3)

- **Utilities Only**: NEVER use inline `style={...}`.
  - **Exception — CatalogImage component**: `apps/mobile/src/components/catalog/CatalogImage.tsx` MAY use `style` prop. Style MUST be a named module-level constant (`const STYLE = {...} as const`), never inline.
- **Design Tokens**: NEVER hardcode colors/spacing.
- **Mobile Footer**: Use compact single-row layout.
- **Image Overflow**: When using `require()` in fixed-height container, add `overflow-hidden` to container.

### UI/UX

- **Loading State**: ALWAYS show `LoadingView` while fetching. NEVER show empty screen during load.
- **Refresh**: ALWAYS provide `RefreshControl` in scrollable lists.
- **Empty vs Loading**: NEVER show empty screen while data is fetching.

### Architecture & Monorepo

- **Shared Types**: MUST live in `@repo/shared`.
- **Backend Routes**: Logic in services, NOT in route handlers.
- **Validation**: Use Zod on BOTH client and server.
- **Logging**:
  - NEVER use `console.log`, `console.warn`, `console.error`.
  - Backend: Use `apps/backend/src/services/logger.service.ts`.
  - Mobile: Use `apps/mobile/src/services/logger.service.ts`.
- **Mock Data**: NEVER duplicate. Centralize in `apps/mobile/src/mocks/*.data.ts`.

### Backend Security

- **Env Access**: NEVER access `c.env` or `process.env` directly in middlewares/services.
- **Config Helper**: ALWAYS use `getAppConfig(c)` from `apps/backend/src/config/env.ts`.
- **Priority**: `c.env` (Cloudflare Bindings) over `process.env`.
- **Types**: Use `Environment` and `LogLevel` literal types from `env.ts`. NEVER use generic strings.
- **Semantic Flags**: Use `config.isProduction` instead of `config.environment === 'production'`.
- **Service Init**: Global services with env dependencies MUST NOT initialize at module level. Use `init(config)` method.
- **Middleware**: NEVER instantiate middleware factory inside another middleware. Use low-level primitives (e.g., `verify` from `hono/jwt`).
- **Fail-Fast**: Critical keys (`JWT_SECRET`, `DATABASE_URL`) MUST NOT have hardcoded fallbacks in production.
- **Health Route**: MUST be protected with `X-Health-Key` header auth.

### Testing

- **TDD**: Follow strict TDD protocol for new features.
- **Hono Tests**: Inject env vars using 3rd argument: `app.request(path, options, bindings)`.
- **Database Mocking**: Mock `dbFactory.createDb` instead of connecting to real DB.
- **Matchers**: Use case-insensitive RegExp (e.g., `/3[.,]000/i`).
- **Zustand Mocking**: Use selector-aware mock: `(sel) => (sel ? sel(state) : state)`.

### Git & Workflow

- **No Direct Push**: NEVER push to `main`/`master` directly.
- **Issue First**: ALL changes MUST be linked to a GitHub issue. Create one before starting if needed.
- **Pre-Commit**: ALWAYS run `make check` BEFORE committing. NEVER commit with failing checks.
- **NO --no-verify**: NEVER use `--no-verify` or any bypass mechanism. If quality gate fails, HALT and escalate to human.
- **Branching**:
  1. Switch to `main`
  2. `git pull origin main`
  3. Create feature branch (`issue-#/short-description`)
- **Commits**: Use conventional commits. NO AI attribution.
- **NO --amend**: NEVER use `--amend`. Always create new commits to preserve audit trail.
- **GPG Signing**: ALWAYS use `git commit -S`. NEVER commit without signing.
  1. Complete work + run `make check`
  2. `git add` files
  3. Execute `git commit -S` directly — the GPG agent prompts the user for the key password via pinentry if not cached. The AI runs the command, the user types the password in the pinentry popup.
- **PR Body**: MUST include `✅ PASS: X total tests, make check successful`.
- **PR Template**: MUST read `.github/PULL_REQUEST_TEMPLATE.md` before creating PR.
- **Labels**: Run `gh label list` to verify project-specific naming (e.g., `type:feature` vs `type:feat`).
- **Post-Merge** ("mergeado"):
  1. Confirm PR and issue closed
  2. Switch to `main`
  3. `git pull origin main`
  4. `git branch -d branch-name`
