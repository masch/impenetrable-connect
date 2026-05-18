# Design: Migrate from @expo/vector-icons to expo-symbols

## Technical Approach

Replace deprecated `@expo/vector-icons` with a centralized `Icon` component wrapping `expo-symbols` `Symbol`. The component provides SF Symbol rendering on iOS with platform-specific fallbacks for Android/Web. A mapping table converts legacy MaterialCommunityIcons names to SF Symbol equivalents, with graceful degradation for unmapped icons.

## Architecture Decisions

### Decision: Centralized Icon Component Location

**Choice**: `apps/mobile/src/components/Icon.tsx`
**Alternatives**: `apps/mobile/src/components/ui/Icon.tsx`, `apps/mobile/src/shared/Icon.tsx`
**Rationale**: Follows existing component pattern (`Button.tsx`, `AppAlert.tsx` in `components/`). No need for separate `ui/` subdirectory—existing structure works fine.

### Decision: Icon Name Mapping Strategy

**Choice**: Static mapping table with runtime lookup
**Alternatives**: Runtime name transformation (kebab-case to dot notation), external JSON config
**Rationale**: Static table is explicit, type-safe, and easier to maintain. Common icons map directly; less common icons fall back gracefully.

### Decision: Platform Fallback Mechanism

**Choice**: Platform.select with Text placeholder fallback
**Alternatives**: expo-image for all fallbacks, conditional rendering null
**Rationale**: Android/Web don't have SF Symbols. Using `Text` with the icon name as a fallback maintains debuggability and visual indication that an icon is missing. Can be enhanced later with custom SVG fallbacks if needed.

### Decision: TypeScript Type for Icon Names

**Choice**: Union type of SF Symbol names + legacy string literal
**Alternatives**: `keyof typeof MaterialCommunityIcons.glyphMap`, generic `string`
**Rationale**: Need to support both migration (legacy names) and forward-looking SF Symbols. Use string literal union for SF Symbols, allow `string` for legacy during transition.

## Data Flow

```
Component (leftIcon="arrow-left")
         │
         ▼
Icon Component (Icon.tsx)
         │
    ┌────┴────┐
    ▼         ▼
iOS       Android/Web
    │         │
    ▼         ▼
Symbol    Text fallback
(SF Symbol)
```

## File Changes

| File                                                          | Action | Description                              |
| ------------------------------------------------------------- | ------ | ---------------------------------------- |
| `apps/mobile/src/components/Icon.tsx`                         | Create | Centralized Icon wrapper component       |
| `apps/mobile/src/components/Button.tsx`                       | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/components/AppAlert.tsx`                     | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/components/DatePicker.tsx`                   | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/components/FormSwitch.tsx`                   | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/components/VentureStatusSection.tsx`         | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/components/VentureCapacitySection.tsx`       | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/components/catalog/ReservationModal.tsx`     | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/components/catalog/ServiceCard.tsx`          | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/components/entrepreneur/ReservationCard.tsx` | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/components/Profile/ProfileView.tsx`          | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/app/index.tsx`                               | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/app/system-status.tsx`                       | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/app/tourist/index.tsx`                       | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/app/tourist/orders.tsx`                      | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/app/tourist/booking.tsx`                     | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/app/tourist/_layout.tsx`                     | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/app/entrepreneur/_layout.tsx`                | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/app/entrepreneur/agenda.tsx`                 | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/app/entrepreneur/request.tsx`                | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/src/app/admin/_layout.tsx`                       | Modify | Replace MaterialCommunityIcons with Icon |
| `apps/mobile/jest.setup.ts`                                   | Modify | Replace mock with expo-symbols           |
| `apps/mobile/src/app/tourist/__tests__/booking.test.tsx`      | Modify | Update mock                              |
| `apps/mobile/src/app/admin/project/__tests__/id.test.tsx`     | Modify | Update mock                              |
| `apps/mobile/package.json`                                    | Modify | Remove @expo/vector-icons dependency     |

## Interfaces / Contracts

```typescript
// Icon component props
interface IconProps {
  name: string; // SF Symbol name (e.g., "arrow.left") or legacy name (e.g., "arrow-left")
  size?: number; // default: 24
  color?: string; // default: current text color
  weight?:
    | "ultralight"
    | "thin"
    | "light"
    | "regular"
    | "medium"
    | "semibold"
    | "bold"
    | "heavy"
    | "black";
  testID?: string;
}
```

```typescript
// Icon mapping table structure
const ICON_MAPPING: Record<string, string> = {
  "arrow-left": "arrow.left",
  "check-circle": "checkmark.circle",
  "check-circle-outline": "checkmark.circle",
  "close-circle-outline": "xmark.circle",
  "alert-outline": "exclamationmark.triangle",
  "information-outline": "info.circle",
  // ... more mappings
};
```

## Testing Strategy

| Layer       | What to Test                        | Approach                                        |
| ----------- | ----------------------------------- | ----------------------------------------------- |
| Unit        | Icon component renders correctly    | Test Symbol on iOS, fallback on other platforms |
| Unit        | Mapping table resolves legacy names | Test known mappings                             |
| Unit        | Unknown icons log warning           | Test console.warn                               |
| Integration | Button with leftIcon renders        | Existing Button tests should pass               |
| Integration | make test passes                    | Full test suite                                 |

## Migration / Rollout

1. **Phase 1**: Create `Icon.tsx` with mapping table and Symbol wrapper
2. **Phase 2**: Update Button.tsx to use Icon component
3. **Phase 3**: Update remaining component files (alphabetically by directory)
4. **Phase 4**: Update app screen files
5. **Phase 5**: Update test mocks
6. **Phase 6**: Remove `@expo/vector-icons` from package.json

## Open Questions

- [ ] Should we keep `expo-image` as a fallback option for custom icons? (out of scope for this migration)
- [ ] Do we need to support icon weight variation, or is "regular" sufficient for all use cases? (use default, allow override)

## Verification

Run `make test` to confirm all tests pass. The migration is complete when:

- `grep -r "@expo/vector-icons" apps/mobile/src/` returns zero matches
- `grep -r "@expo/vector-icons" apps/mobile/jest.setup.ts` returns zero matches
- `make test` exits with code 0
