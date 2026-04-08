# Proposal: tourist-catalog-screen

## Intent

Implement a tourist services catalog screen that allows tourists to browse and reserve gastronomic activities and adventures. The current issue is that the screen is empty (only has "Catalog" text), preventing tourists from browsing and reserving services from the mobile app.

## Scope

### In Scope

- `tourist/catalog` screen with Gastronomy and Adventures sections
- `ServiceCard` component to display services with image, badge, title, description, and price
- `SectionHeader` component for section headers
- `ReservationModal` with day moment selector (Breakfast/Lunch/Afternoon/Dinner) and quantity
- Mock data for 3 services (Guiso de Monte $15, Parrillada Regional $28.50, River Excursion $42)
- Tab navigation configured for TOURIST role

### Out of Scope

- Real backend connection (API /catalog)
- Reservation persistence in database
- Complete orders flow (only modal, no POST to backend)
- Tourist authentication (already exists)

## Capabilities

### New Capabilities

- `tourist-catalog-browse`: Catalog screen with services grouped by category (Gastronomy, Adventures)
- `tourist-service-reserve`: Reservation modal with day moment and quantity

### Modified Capabilities

- None (new feature)

## Approach

Reusable components based on the existing design system:

- Use `Screen` and `ScreenContent` as container
- NativeWind for styles (HTML tokens: primary #6e2717, secondary #47664b)
- `ServiceCard`: Image with overlapping badge, truncated text, price in currency format
- `ReservationModal`: Local state with Zustand or useState, moment selector (segmented control), stepper for quantity
- Mock data in separate file for easy API replacement

## Affected Areas

| Area                                              | Impact   | Description                                                                             |
| ------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `apps/mobile/src/app/(tabs)/tourist/catalog.tsx`  | Modified | Implement complete catalog UI                                                           |
| `apps/mobile/src/components/ServiceCard.tsx`      | New      | Service card component                                                                  |
| `apps/mobile/src/components/SectionHeader.tsx`    | New      | Section header component                                                                |
| `apps/mobile/src/components/ReservationModal.tsx` | New      | Reservation modal with moments and quantity                                             |
| `apps/mobile/src/mocks/catalog.ts`                | New      | Mock data for services                                                                  |
| `apps/mobile/src/i18n/locales/es.json`            | Modified | Add translations: catalog.title, catalog.gastronomy, catalog.excursions, reservation.\* |
| `apps/mobile/src/i18n/locales/en.json`            | Modified | Add English translations for the same keys                                              |
| `apps/mobile/tailwind.config.js`                  | Modified | Add primary token (#6e2717) if it doesn't exist                                         |

## Risks

| Risk                   | Likelihood | Mitigation                                           |
| ---------------------- | ---------- | ---------------------------------------------------- |
| Modal state management | Medium     | Use dedicated Zustand store or useState with Context |
| Images in React Native | Medium     | Use expo-image with placeholder fallback             |
| Responsive design      | Low        | Test on multiple screen sizes                        |
| Missing i18n keys      | Medium     | Validate all strings use t() function                |

## Rollback Plan

1. Delete created files: `ServiceCard.tsx`, `SectionHeader.tsx`, `ReservationModal.tsx`, `catalog.ts` (mocks)
2. Restore `catalog.tsx` to original placeholder version
3. Delete added keys in `es.json` and `en.json`
4. Revert changes in `tailwind.config.js` if new tokens were added

## Dependencies

- `expo-image`: For optimized image handling
- `react-native-safe-area-context`: For safe area handling in modal
- Existing design system (Screen, Button, NativeWind tokens)

## Success Criteria

- [ ] The screen displays two sections: Gastronomy and Adventures
- [ ] Each service card shows image, category badge, title, truncated description, and price
- [ ] Pressing a card opens the ReservationModal
- [ ] The modal allows selecting day moment (4 options)
- [ ] The modal allows selecting quantity (1-10)
- [ ] The Confirm button shows a toast/visual feedback
- [ ] The UI uses the HTML design colors (primary #6e2717)
- [ ] All visible strings use i18n (t())
