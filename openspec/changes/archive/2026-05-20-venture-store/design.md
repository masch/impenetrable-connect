# Design: Venture Store

## Technical Approach

Create a Zustand store mirroring `project.store.ts` to centralize venture CRUD operations. Update `venture.service.ts` to align with backend REST endpoints (GET, POST, PUT, DELETE). Migrate `venture-config.tsx` to consume store instead of direct service calls.

## Architecture Decisions

### Decision: Store Interface Mirror

**Choice**: Clone `project.store.ts` structure exactly — same state shape and action signatures.
**Alternatives considered**: Custom shape with venture-specific methods (e.g., `fetchVentureByUserId`)
**Rationale**: Consistency enables developer predictability across all stores. Venture-specific fetch can be added later without breaking pattern.

### Decision: Service Method Alignment

**Choice**: Add all CRUD methods to `VentureServiceInterface` matching backend routes.
**Alternatives considered**: Keep service minimal, add methods only as needed per component
**Rationale**: Backend already has full CRUD. Adding all methods ensures store has everything it needs and avoids future service churn.

### Decision: PATCH → PUT

**Choice**: Change `RestVentureService.updateVenture` from PATCH to PUT.
**Alternatives considered**: Keep PATCH and accept inconsistency
**Rationale**: Backend uses PUT. Mismatch causes silent failures or wrong HTTP semantics.

## Data Flow

```
venture-config.tsx
       │
       ▼ (useVentureStore)
venture.store.ts ◄── venture.service.ts
       │                    │
       └── isLoading/saving  └── REST / MOCK
```

## File Changes

| File                                                         | Action | Description                                                        |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------------ |
| `apps/mobile/src/stores/venture.store.ts`                    | Create | Zustand store with CRUD actions                                    |
| `apps/mobile/src/stores/__tests__/venture.store.test.ts`     | Create | Unit tests for store                                               |
| `apps/mobile/src/services/venture.service.ts`                | Modify | Add getVentures, createVenture, deleteVenture; change PATCH to PUT |
| `apps/mobile/src/app/entrepreneur/venture-config.tsx`        | Modify | Use store instead of VentureService directly                       |
| `apps/mobile/src/services/__tests__/venture.service.test.ts` | Modify | Add tests for new CRUD methods                                     |

## Interfaces / Contracts

```typescript
interface VentureState {
  ventures: Venture[];
  selectedVenture: Venture | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchVentures: () => Promise<void>;
  selectVenture: (id: number) => Promise<void>;
  createVenture: (venture: Omit<Venture, "id">) => Promise<Venture | null>;
  updateVenture: (id: number, venture: Partial<Venture>) => Promise<Venture | null>;
  deleteVenture: (id: number) => Promise<boolean>;
  setSelectedVenture: (venture: Venture | null) => void;
}
```

## Testing Strategy

| Layer | What          | Approach                                         |
| ----- | ------------- | ------------------------------------------------ |
| Unit  | Store actions | Mock service, verify state transitions           |
| Unit  | Service CRUD  | Mock fetch, verify correct HTTP methods and URLs |

## Migration / Rollout

No migration required. Changes are additive. `venture-config.tsx` is the only consumer; migration is straightforward (replace `VentureService` calls with store selectors).

## Open Questions

- [ ] Should `fetchVentures` support pagination? (Not in scope for now, but worth tracking)
- [ ] Do we need `venture-config.tsx` to load ventures on mount, or just the user's venture via `getVentureByUserId`? (Keep current behavior: load user's venture only)
