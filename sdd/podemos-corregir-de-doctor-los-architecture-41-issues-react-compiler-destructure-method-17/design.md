# Design: React-Doctor 41 Issues - Destructure Method & Size Axes Fix

## Technical Approach

This is a mechanical refactor to fix code quality warnings from react-doctor:

1. **17 destructure method fixes**: Convert `const router = useRouter()` followed by `router.push()` to `const { push } = useRouter()` followed by `push()`
2. **17 redundant size axes fixes**: Convert `w-N h-N` Tailwind classes to `size-N` shorthand

No new functionality, behavioral changes, or architecture modifications.

## Architecture Decisions

| Decision            | Choice                                                         | Rationale                                                         |
| ------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| Destructure pattern | `const { push, back, replace } = useRouter()` at component top | Aligns with React Compiler recommendations for better memoization |
| Size shorthand      | Replace `w-N h-N` with `size-N`                                | Tailwind v3.4+ standard, equivalent CSS output                    |
| Processing order    | Low-risk files first (login, small components)                 | Safe rollback path if issues arise                                |
| Batch size          | Process 2-3 files then run tests                               | Balance between progress tracking and verification frequency      |

## File Changes

### Destructure Method Fixes (7 files, 17 instances)

| File                                          | Instances | Methods       |
| --------------------------------------------- | --------- | ------------- |
| `apps/mobile/src/app/auth/login.tsx`          | 4         | replace, back |
| `apps/mobile/src/app/admin/project/[id].tsx`  | 2         | replace, back |
| `apps/mobile/src/app/admin/project/index.tsx` | 1         | push          |
| `apps/mobile/src/app/tourist/booking.tsx`     | 6         | replace, push |
| `apps/mobile/src/app/tourist/index.tsx`       | 2         | back, push    |
| `apps/mobile/src/app/tourist/login.tsx`       | 1         | replace       |
| `apps/mobile/src/app/tourist/orders.tsx`      | 1         | replace       |

### Redundant Size Axes Fixes (11 files, 17 instances)

| File                                                      | Instances |
| --------------------------------------------------------- | --------- |
| `apps/mobile/src/app/tourist/booking.tsx`                 | 2         |
| `apps/mobile/src/app/tourist/index.tsx`                   | 3         |
| `apps/mobile/src/app/entrepreneur/request.tsx`            | 2         |
| `apps/mobile/src/components/catalog/ReservationModal.tsx` | 3         |
| `apps/mobile/src/components/VentureStatusSection.tsx`     | 1         |
| `apps/mobile/src/components/VentureCapacitySection.tsx`   | 3         |
| `apps/mobile/src/components/DatePicker.tsx`               | 2         |
| `apps/mobile/src/components/Profile/ProfileView.tsx`      | 1         |
| `apps/mobile/src/components/AppAlert.tsx`                 | 1         |
| `apps/mobile/src/app/index.tsx`                           | 1         |
| `apps/mobile/src/app/system-status.tsx`                   | 2         |

## Processing Order (Risk-Stratified)

1. **Phase 1 - Low Risk** (Isolated, small files):
   - `auth/login.tsx` (4 destructure)
   - `admin/project/[id].tsx` (2 destructure)

2. **Phase 2 - Low/Medium Risk** (Medium size, more usage):
   - `tourist/login.tsx` (1 destructure)
   - `admin/project/index.tsx` (1 destructure)
   - `components/catalog/ReservationModal.tsx` (3 size)
   - `components/VentureStatusSection.tsx` (1 size)

3. **Phase 3 - Medium Risk** (Larger files):
   - `tourist/orders.tsx` (1 destructure)
   - `tourist/index.tsx` (2 destructure + 3 size)
   - `entrepreneur/request.tsx` (2 size)

4. **Phase 4 - Higher Risk** (Largest file, most issues):
   - `tourist/booking.tsx` (6 destructure + 2 size)

5. **Phase 5 - Remaining Components**:
   - All remaining size-axis fixes

## Testing Strategy

| Layer        | What                        | Approach                                            |
| ------------ | --------------------------- | --------------------------------------------------- |
| Verification | react-doctor shows progress | Run after each phase, expect decreasing issue count |
| Integration  | `make test` passes          | Run after each phase                                |
| Build        | Expo build succeeds         | Final verification before PR                        |

**Verification targets**:

- `npx react-doctor` shows 0 Architecture issues for destructure and size axes
- `make test` passes
- Build succeeds (via `npx expo export` or `npx expo prebuild`)

## Migration / Rollback

No migration needed — these are mechanical refactors with no data or schema changes.

**Rollback plan**:

- `git revert <commit>` for full rollback
- Individual file reversion via `git checkout HEAD -- <file>` for isolated issues

## Open Questions

None — this is a straightforward mechanical refactor with clear patterns and verification criteria.

## Next Step

Ready for sdd-tasks to break into implementation tasks per phase.
