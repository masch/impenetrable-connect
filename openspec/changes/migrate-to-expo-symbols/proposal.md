# Proposal: Migrate from @expo/vector-icons to expo-symbols

## Intent

The `@expo/vector-icons` package is deprecated and no longer maintained. Expo recommends migrating to `expo-symbols` (iOS SF Symbols) or `expo-image` for vector graphics. This migration removes deprecated dependencies, reduces bundle size, and future-proofs the mobile app against React Native breaking changes.

## Scope

### In Scope

- Replace all `MaterialCommunityIcons` imports with `expo-symbols` + wrapper component
- Create centralized `Icon` component in `apps/mobile/src/components/Icon.tsx`
- Update all 21+ files importing `@expo/vector-icons`
- Update test mocks in 3 test files (`jest.setup.ts`, `booking.test.tsx`, `id.test.tsx`)
- Handle missing SF Symbols with fallback strategy

### Out of Scope

- Migrating other icon libraries (e.g., FontAwesome)
- Refactoring icon usage in non-mobile apps (none exist)
- Icon animation features (future work)

## Capabilities

> This is a refactoring migration with no spec-level behavior changes.

- **New**: `icon-system` — Centralized icon rendering with SF Symbols fallback
- **Modified**: None — existing UI behavior preserved
- **Delta**: This change creates a delta spec for the icon-system capability

## Approach

**Option A (Recommended): Full migration with wrapper + fallback**

1. Create `Icon.tsx` component using `Symbol` from `expo-symbols`
2. Map MaterialCommunityIcons names to SF Symbol equivalents where possible
3. For icons without SF Symbol equivalents: use `expo-image` or keep fallback
4. Update Button component to use new Icon component
5. Migrate all other components file-by-file
6. Update test mocks to mock expo-symbols instead

**Why Option A**: Complete removal of deprecated package, single source of truth for icons, cleaner codebase.

## Affected Areas

| Area                                          | Impact   | Description                    |
| --------------------------------------------- | -------- | ------------------------------ |
| `apps/mobile/src/components/Icon.tsx`         | New      | Centralized Icon wrapper       |
| `apps/mobile/src/components/Button.tsx`       | Modified | Use new Icon component         |
| `apps/mobile/src/app/*` (14 files)            | Modified | Replace MaterialCommunityIcons |
| `apps/mobile/src/components/*` (6 files)      | Modified | Replace MaterialCommunityIcons |
| `apps/mobile/jest.setup.ts`                   | Modified | Update mock for expo-symbols   |
| `apps/mobile/src/app/*/__tests__/*` (2 files) | Modified | Update mocks                   |

## Risks

| Risk                                         | Likelihood | Mitigation                                 |
| -------------------------------------------- | ---------- | ------------------------------------------ |
| Missing SF Symbol equivalents for some icons | Medium     | Use expo-image fallback for specific icons |
| Test failures due to mock changes            | Medium     | Update all 3 test mock files               |
| Visual regression in icons                   | Low        | Compare before/after screenshots           |

## Rollback Plan

1. Revert `@expo/vector-icons` dependency in package.json
2. Restore all importing files to use MaterialCommunityIcons
3. Restore test mocks
4. Delete Icon.tsx component
5. All changes are in one directory — single revert possible

## Dependencies

- `expo-symbols@^55.0.7` — already in expo-router dependency tree
- `expo@~55.0.13` — already installed
- React Native 0.83.4 — supports SF Symbols via expo-symbols

## Success Criteria

- [ ] Remove `@expo/vector-icons` from package.json dependencies
- [ ] All 21+ files migrated to use new Icon component or expo-symbols directly
- [ ] All tests pass (`make test` passes)
- [ ] No console warnings about deprecated packages
- [ ] Icon appearance visually consistent (spot-check key screens)
