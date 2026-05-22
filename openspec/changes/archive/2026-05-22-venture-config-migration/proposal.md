# Proposal: venture-config-migration

## Intent

Migrate `venture-config.tsx` from direct `VentureService` calls to `useVentureStore`, adding proper multi-venture support: auto-select when user has 1 venture, show selector when >1.

## Scope

### In Scope

- Migrate `venture-config.tsx` to use `useVentureStore`
- Add `fetchVenturesByUserId(userId)` to store + service
- Venture selector UI (inline, shown only when user has >1 ventures)
- Handle 0 ventures state
- Use new `GET /v1/ventures/user/:userId` backend endpoint

### Out of Scope

- Venture member management (add/remove members)
- Role-based permissions
- Full venture list screen

## Capabilities

### New Capabilities

- `venture-selector`: UI for selecting a venture when user has multiple

### Modified Capabilities

- `venture-state`: Add `fetchVenturesByUserId` action

## Approach

1. Add `getVenturesByUserId` to `VentureServiceInterface`, Mock, and Rest
2. Add `fetchVenturesByUserId` + `userVentures` + `hasMultipleVentures` to store
3. Migrate `venture-config.tsx` to use store actions
4. Add inline venture selector when >1 ventures

## Affected Areas

| Area                                  | Impact                                           |
| ------------------------------------- | ------------------------------------------------ |
| `services/venture.service.ts`         | Modified (+getVenturesByUserId)                  |
| `stores/venture.store.ts`             | Modified (+fetchVenturesByUserId, +userVentures) |
| `app/entrepreneur/venture-config.tsx` | Modified (full migration)                        |

## Risks

| Risk                             | Likelihood | Mitigation                        |
| -------------------------------- | ---------- | --------------------------------- |
| Breaking existing venture-config | Low        | Incremental; save logic unchanged |

## Rollback Plan

Revert changes to `venture-config.tsx`, store, and service.

## Success Criteria

- [ ] `make test` passes
- [ ] venture-config loads user's ventures from store
- [ ] Selector appears when mock has >1 ventures assigned
