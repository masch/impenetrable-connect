# Code Quality: React Doctor Architecture Fixes

## Purpose

Ensure codebase meets React Compiler compatibility standards and follows NativeWind best practices by fixing 34 code quality issues (17 destructure method + 17 redundant size axes) with zero behavioral impact.

## Requirements

### Requirement: React Compiler Destructure Method Fixes

The codebase **MUST** replace all direct router method calls with destructured methods to satisfy React Compiler recommendations.

#### Files Affected

| File                              | Instances                            |
| --------------------------------- | ------------------------------------ |
| `src/app/auth/login.tsx`          | 4 (lines 34, 36, 38, 116)            |
| `src/app/tourist/booking.tsx`     | 6 (lines 71, 76, 203, 310, 560, 637) |
| `src/app/tourist/index.tsx`       | 2 (lines 81, 165)                    |
| `src/app/tourist/orders.tsx`      | 1 (line 89)                          |
| `src/app/tourist/login.tsx`       | 1 (line 61)                          |
| `src/app/admin/project/index.tsx` | 1 (line 85)                          |
| `src/app/admin/project/[id].tsx`  | 2 (lines 146, 347)                   |

#### Scenario: Component uses router.push() multiple times

- GIVEN a component calls `router.push()` 3+ times
- WHEN the implementer extracts `const { push } = router` at component level
- THEN all `router.push()` calls **MUST** be replaced with `push()`
- AND navigation behavior **MUST** remain unchanged

#### Scenario: Component mixes router.push() with router.replace()

- GIVEN a component uses both `router.push()` and `router.replace()`
- WHEN destructuring is applied
- THEN **MUST** extract `const { push, replace } = router`
- AND all direct calls **MUST** be replaced with destructured versions

#### Scenario: Component uses router.back()

- GIVEN a component calls `router.back()` for navigation
- WHEN destructuring is applied
- THEN **MUST** extract `const { back } = useRouter()`
- AND `back()` **MUST** replace all `router.back()` calls

### Requirement: Redundant Size Axes Fixes

The codebase **MUST** replace all `w-N h-N` class patterns with the equivalent `size-N` NativeWind shorthand.

#### Files Affected

- `src/app/tourist/booking.tsx` (lines 314, 474)
- `src/app/tourist/index.tsx` (lines 214, 232, 286)
- `src/app/entrepreneur/request.tsx` (lines 101, 213)
- `src/components/catalog/ReservationModal.tsx` (lines 73, 116, 141)
- `src/components/VentureStatusSection.tsx` (line 50)
- `src/components/VentureCapacitySection.tsx` (lines 26, 43, 77)
- `src/components/DatePicker.tsx` (lines 145, 156)
- `src/components/Profile/ProfileView.tsx` (line 103)
- `src/components/AppAlert.tsx` (line 79)
- `src/app/system-status.tsx` (lines 36, 76)
- `src/app/index.tsx` (line 163)

#### Scenario: Icon uses w-N h-N for consistent sizing

- GIVEN a component renders an icon with `className="w-8 h-8"`
- WHEN the fix is applied
- THEN **MUST** replace with `className="size-8"`
- AND visual rendering **MUST** remain unchanged

#### Scenario: Mixed size classes on same element

- GIVEN an element has `w-6 h-6` plus other classes like `text-red-500`
- WHEN the fix is applied
- THEN **MUST** replace `w-6 h-6` with `size-6` while preserving other classes

#### Scenario: w-N h-N with different N values

- GIVEN any usage of `w-N h-N` where N matches
- WHEN the replacement is applied
- THEN **MUST** convert to `size-N` with the same N value

### Requirement: Verification After Fixes

The system **MUST** pass all verification checks after applying fixes.

#### Scenario: Run react-doctor verification

- GIVEN all destructure and size fixes have been applied
- WHEN `npx react-doctor` is executed
- THEN the output **MUST** show 0 "React compiler destructure method" issues
- AND **MUST** show 0 "redundant size axes" issues

#### Scenario: Run test suite

- GIVEN all code changes have been applied
- WHEN `make test` is executed
- THEN all tests **MUST** pass without regression

#### Scenario: Build verification

- GIVEN all changes are applied
- WHEN the app build is triggered
- THEN the build **MUST** succeed without errors

## Out of Scope (Deferred)

- 4 "Giant component" issues (300+ lines)
- 2 "No render in render" issues
- 1 "Non-generic handler names" issue

These are marked for follow-up work and do not block this change.
