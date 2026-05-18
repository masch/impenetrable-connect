# Proposal: Fix empanada images not loading in web target

## Intent

Empanada images in the catalog don't display correctly in Expo's web target. The ServiceCard component uses React Native's `Image` with `resizeMode="cover"`, but in web target this translates to HTML `<img>` where `resizeMode` doesn't map to CSS `object-fit: cover`. Users see stretched, oversized, or missing images on the web version.

## Scope

### In Scope

- Fix ServiceCard image rendering for web target
- Verify fix works on mobile target (no regression)

### Out of Scope

- Other Image components in the app (future work)
- Backend image URL validation

## Capabilities

### New Capabilities

- `<catalog-image-web-fix>`: ServiceCard images render correctly in both mobile and web targets

### Modified Capabilities

- None (this is a bugfix without spec-level behavior changes)

## Approach

Add explicit Tailwind class `object-cover` to the Image component in ServiceCard.tsx. This ensures CSS `object-fit: cover` is applied in the web target regardless of React Native's prop translation.

**Current code (line 45-47):**

```tsx
<Image className="absolute w-full h-full" resizeMode="cover" />
```

**Fixed code:**

```tsx
<Image className="absolute w-full h-full object-cover" resizeMode="cover" />
```

The `resizeMode="cover"` remains for mobile native rendering, while `object-cover` adds web CSS support.

## Affected Areas

| Area                                                 | Impact   | Description                       |
| ---------------------------------------------------- | -------- | --------------------------------- |
| `apps/mobile/src/components/catalog/ServiceCard.tsx` | Modified | Add `object-cover` class to Image |

## Risks

| Risk                                             | Likelihood | Mitigation                                                 |
| ------------------------------------------------ | ---------- | ---------------------------------------------------------- |
| Tailwind not configured for object-fit utilities | Low        | Check nativewind/tailwind config; fallback to inline style |
| No visible change on mobile                      | Low        | Verify visually on device after fix                        |

## Rollback Plan

Revert the `object-cover` addition from ServiceCard.tsx line 45. The change is a single class addition with no side effects.

## Dependencies

- None (pure frontend change)

## Success Criteria

- [ ] Web target shows images with correct aspect ratio (cover fit)
- [ ] Mobile target shows images unchanged (no regression)
- [ ] `make check` passes
