# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

## Project-Level Skills

| Trigger                                                                    | Skill                        | Path                                                |
| -------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------- |
| When writing Hono API endpoints, middleware or backend routes              | `hono`                       | `.agent/skills/hono/SKILL.md`                       |
| When creating/modifying database schemas, queries or database transactions | `drizzle-orm`                | `.agent/skills/drizzle-orm/SKILL.md`                |
| When designing or generating UIs, screens, or visual layouts               | `frontend-design`            | `.agent/skills/frontend-design/SKILL.md`            |
| When building deep React Native features or tuning performance             | `vercel-react-native-skills` | `.agent/skills/vercel-react-native-skills/SKILL.md` |
| When styling mobile components or configuring UI elements                  | `expo-tailwind-setup`        | `.agent/skills/expo-tailwind-setup/SKILL.md`        |
| When configuring GitHub actions for deployment or EAS builds               | `expo-deployment`            | `.agent/skills/expo-deployment/SKILL.md`            |
| When adding native dependencies that require rebuilds outside Expo Go      | `expo-dev-client`            | `.agent/skills/expo-dev-client/SKILL.md`            |
| When auditing or finalizing a UI view                                      | `web-design-guidelines`      | `.agent/skills/web-design-guidelines/SKILL.md`      |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### hono

- Return JSON responses strictly matching API spec with consistent Error shapes
- Rely on `zValidator` to auto-inject typed `c.req.valid('json')`
- Ensure routes use Hono RPC client compatibility for the mobile app

### drizzle-orm

- Always use the precise PostgreSQL data types
- Ensure strict type safety by exporting `typeof` for insertion and selection schemas
- Use explicit foreign keys
- Write queries utilizing the Drizzle syntax without raw SQL strings where possible

### frontend-design

- REJECT generic Bootstrap/Tailwind standard colors (e.g., pure blue, red). Use tailored, harmonious HSL palettes
- Apply subtle glassmorphism and modern gradient overlays
- Emphasize rich animations to give life to dynamic data
- MUST create UIs that feel "Premium" and highly polished

### vercel-react-native-skills

- Use `@shopify/flash-list` INSTEAD of FlatList/ScrollView for mapped items
- Always prefer `Pressable` over `TouchableOpacity`
- Avoid deeply nesting Views; keep DOM shallow
- Use Reanimated for complex GPU-bound animations

### expo-tailwind-setup

- Always use NativeWind utility classes (`className`) over StyleSheet.create()
- Do not use generic string classes; rely on standard Tailwind aliases
- Follow the bold, modern UI guidelines (avoid generic colors)

### expo-deployment

- Pin EXPO SDK versions tightly
- Use EAS Workflows for E2E CI/CD from branch push to app store

### expo-dev-client

- Always rely on continuous EAS builds instead of local prebuilds to prevent git pollution in `ios/` and `android/`

### web-design-guidelines

- Always include `accessibilityLabel` and `accessibilityHint` on interactive elements
- Verify touch targets are at least 44x44 minimum

## Project Conventions

| File                   | Path                     | Notes                                |
| ---------------------- | ------------------------ | ------------------------------------ |
| AGENTS.md              | ./AGENTS.md              | Code review rules and skill registry |
| .atl/skill-registry.md | ./.atl/skill-registry.md | This registry                        |

Last updated: 2026-04-12
