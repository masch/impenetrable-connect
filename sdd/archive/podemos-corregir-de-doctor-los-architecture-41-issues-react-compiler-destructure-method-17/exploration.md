# Exploration: React-Doctor Architecture 41 Issues

## Executive Summary

The change references **41 Architecture issues** reported by `react-doctor` (a React/Expo code quality tool), including **17 instances of "React compiler destructure method"** warnings. These issues are code quality recommendations, not bugs.

**"de doctor"** = "from react-doctor" — the tool that analyzes the codebase.

## Issue Breakdown

### 1. React Compiler Destructure Method (17 issues)

**Problem**: Code uses `const router = useRouter()` then calls `router.push()`, `router.replace()`, or `router.back()` without destructuring.

**Recommendation**: Destructure methods upfront:

```typescript
// Current (triggers warning)
const router = useRouter();
router.replace("/path");

// Recommended
const { replace } = useRouter();
replace("/path");
```

**Why it matters**: React Compiler (when enabled) can better memoize components when it knows exactly which router methods are used.

**Files affected**:
| File | Instances |
|------|-----------|
| `src/app/auth/login.tsx` | 4 (lines 34, 36, 38, 116) |
| `src/app/tourist/booking.tsx` | 6 (lines 71, 76, 203, 310, 560, 637) |
| `src/app/tourist/index.tsx` | 2 (lines 81, 165) |
| `src/app/tourist/orders.tsx` | 1 (line 89) |
| `src/app/tourist/login.tsx` | 1 (line 61) |
| `src/app/admin/project/index.tsx` | 1 (line 85) |
| `src/app/admin/project/[id].tsx` | 2 (lines 146, 347) |

### 2. Redundant Size Axes (17 issues)

**Problem**: Using `w-N h-N` instead of `size-N` shorthand in Tailwind CSS.

**Recommendation**: Replace `w-12 h-12` with `size-12`.

**Files affected** (21 total occurrences):

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

### 3. Giant Components (4 issues)

**Problem**: Components exceeding 300 lines.

| Component         | Lines | File                                |
| ----------------- | ----- | ----------------------------------- |
| BookingScreen     | 622   | `src/app/tourist/booking.tsx:36`    |
| OrderSetupScreen  | 409   | `src/app/tourist/index.tsx:20`      |
| OrderScreen       | 343   | `src/app/tourist/orders.tsx:64`     |
| ProjectFormScreen | 325   | `src/app/admin/project/[id].tsx:45` |

### 4. Inline Render Functions (2 issues)

- `src/app/entrepreneur/agenda.tsx:201` - `renderDateSelector()`
- `src/app/tourist/orders.tsx:266` - unnamed inline render

### 5. Non-Descriptive Handler Names (1 issue)

- `src/components/DatePicker.tsx:261` - `handleChange` should be more specific

## Complexity Assessment

| Issue Type                             | Effort | Risk                                   |
| -------------------------------------- | ------ | -------------------------------------- |
| Destructure useRouter methods          | Low    | Low - mechanical change                |
| Redundant size axes (w-N h-N → size-N) | Low    | Low - CSS shorthand equivalent         |
| Giant components                       | High   | Medium - requires refactoring, testing |
| Inline render functions                | Medium | Medium - component extraction          |
| Handler naming                         | Low    | Low - rename only                      |

## Risks

1. **Navigation behavior change**: Destructuring useRouter methods should behave identically, but verify on device
2. **False positives**: Some "giant component" warnings may be acceptable for this app's complexity
3. **Testing burden**: Refactoring giant components requires thorough regression testing
4. **Breaking changes**: None expected - these are style/pattern recommendations

## Recommendation

**Scope this as two separate changes:**

1. **Quick Wins** (Low risk, high impact):
   - Fix all 17 "react-compiler-destructure-method" issues
   - Fix all 17 "redundant size axes" issues
   - Fix handler naming

2. **Refactoring** (Higher effort):
   - Address giant components if time permits
   - Extract inline render functions

The destructure and size-axe fixes are straightforward mechanical changes that improve code quality without behavioral changes.

## Ready for Proposal

**Yes** — This is a well-scoped cleanup task. The orchestrator should create an SDD change to address these react-doctor issues, preferably starting with the quick wins (destructure + size axes).
