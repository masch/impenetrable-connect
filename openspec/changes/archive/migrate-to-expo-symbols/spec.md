# Delta for Icon-System

> Migration spec: Replace deprecated `@expo/vector-icons` with `expo-symbols` wrapper.

## ADDED Requirements

### Requirement: Centralized Icon Component

The system MUST provide a centralized `Icon` component in `apps/mobile/src/components/Icon.tsx` that wraps `expo-symbols` `Symbol` component for iOS and provides fallback for Android/Web.

The component MUST accept a `name` prop mapping to SF Symbol names and support `size`, `color`, and `weight` props for consistency with existing MaterialCommunityIcons usage.

#### Scenario: Rendering icons on iOS

- GIVEN an Icon component is rendered with a valid SF Symbol name
- WHEN the platform is iOS
- THEN the component displays the SF Symbol using the `Symbol` component from `expo-symbols`
- AND the icon respects size, color, and weight props

#### Scenario: Rendering icons on Android/Web fallback

- GIVEN an Icon component is rendered with any SF Symbol name
- WHEN the platform is Android or Web
- THEN the component displays a fallback icon representation
- AND the fallback maintains visual consistency with iOS rendering

#### Scenario: Icon without SF Symbol equivalent

- GIVEN an Icon component is rendered with a name that has no SF Symbol mapping
- THEN the system MUST either display a closest equivalent SF Symbol OR render a text placeholder indicating the missing icon
- AND log a warning to the development console for debugging

### Requirement: Button Icon Integration

The Button component MUST continue to support `leftIcon` and `rightIcon` props using the new Icon component.

The type definitions for these props MUST be updated from `keyof typeof MaterialCommunityIcons.glyphMap` to a compatible icon name type that supports both SF Symbol names and legacy MaterialCommunityIcons names during migration.

#### Scenario: Button renders left icon

- GIVEN a Button component has `leftIcon="arrow-left"` prop
- WHEN rendered on iOS
- THEN the left icon displays using SF Symbol "arrow.left"
- AND the icon color matches the Button's variant styling

### Requirement: Test Mock Updates

All test mock configurations in `jest.setup.ts` and component test files MUST mock `expo-symbols` instead of `@expo/vector-icons`.

#### Scenario: Test suite runs with new mocks

- GIVEN all test files have been updated to mock expo-symbols
- WHEN `make test` is executed
- THEN all tests pass without console warnings about missing mocks
- AND component snapshots remain valid

### Requirement: Backward Compatibility During Transition

The migration MUST maintain backward compatibility for icon prop values during the transition period.

The Icon component SHOULD accept both SF Symbol names (e.g., "arrow.left") and legacy MaterialCommunityIcons names (e.g., "arrow-left") and resolve them to appropriate display elements.

#### Scenario: Legacy icon name in existing component

- GIVEN a component passes legacy icon name "check-circle" to Icon component
- WHEN the Icon component processes this name
- THEN it maps "check-circle" to closest SF Symbol "checkmark.circle"
- OR uses fallback display if no equivalent exists

## MODIFIED Requirements

### Requirement: Remove Deprecated @expo/vector-icons

(Previously: Component imports and renders MaterialCommunityIcons directly)

The system MUST remove all direct imports of `@expo/vector-icons/MaterialCommunityIcons` from source files.

All 21+ files currently importing `@expo/vector-icons` MUST be updated to use either:

- The centralized Icon component for most cases
- Direct `Symbol` import from `expo-symbols` for specialized icon usage

#### Scenario: File migration complete

- GIVEN all source files have been migrated
- WHEN checking imports across the codebase
- THEN no file imports from `@expo/vector-icons`
- AND `@expo/vector-icons` is removed from package.json dependencies

## REMOVED Requirements

### Requirement: MaterialCommunityIcons Direct Import

(Reason: The @expo/vector-icons package is deprecated and no longer maintained)

Direct imports of MaterialCommunityIcons from `@expo/vector-icons` are no longer supported.

---

## Acceptance Criteria

| Criterion                    | Verification                                                         |
| ---------------------------- | -------------------------------------------------------------------- |
| All 21 source files migrated | `grep -r "@expo/vector-icons" apps/mobile/src/` returns zero matches |
| Test mocks updated           | 3 files updated: jest.setup.ts, booking.test.tsx, id.test.tsx        |
| `make test` passes           | CI pipeline green                                                    |
| No deprecation warnings      | Build output contains zero warnings about @expo/vector-icons         |
| Package.json updated         | @expo/vector-icons removed from dependencies                         |

## Edge Cases

| Edge Case                                                       | Handling                                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| SF Symbol doesn't exist for icon name                           | Map to closest equivalent; fallback to text placeholder if none found    |
| Icon name differs between MaterialCommunityIcons and SF Symbols | Create mapping table in Icon component                                   |
| Android/Web platform                                            | Use fallback rendering (Text component or platform-specific alternative) |
| Icon with custom weight                                         | Pass weight prop to SF Symbol; ignore on fallback                        |

## File Inventory

| Category    | Count | Example Files                                                  |
| ----------- | ----- | -------------------------------------------------------------- |
| App screens | 14    | tourist/index.tsx, entrepreneur/agenda.tsx, admin/\_layout.tsx |
| Components  | 6     | Button.tsx, DatePicker.tsx, AppAlert.tsx                       |
| Test mocks  | 3     | jest.setup.ts, booking.test.tsx, id.test.tsx                   |
| Total       | 23    | All must be updated                                            |
