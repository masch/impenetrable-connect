# Proposal: Date Selection Control in Order Flow

## Intent

Allow users (tourists) to select a service date when making a reservation, rather than being forced to use today's date. This enables advance bookings and improves the user experience for planning meals/activities ahead of time.

## Scope

### In Scope

- Date picker UI component with NativeWind styling in ReservationModal
- Quick-select chips (Today/Tomorrow) for common selections
- Full date picker for custom date selection
- Wire date state from UI to `onConfirm` callback

### Out of Scope

- Backend schema changes (service_date field already exists)
- Calendar view for entrepreneurs
- Multiple date selection

## Capabilities

### New Capabilities

- `date-selection`: User can select service_date when placing an order via ReservationModal

### Modified Capabilities

- `reservation-flow`: Now includes date selection step alongside moment of day and quantity

## Approach

Use `@react-native-community/datetimepicker` wrapped with NativeWind CSS classes. Provide quick-select chips (Today/Tomorrow) as primary UI for common cases, with expandable date picker for custom dates.

## Affected Areas

| Area                                              | Impact   | Description                          |
| ------------------------------------------------- | -------- | ------------------------------------ |
| `apps/mobile/src/components/ReservationModal.tsx` | Modified | Add date picker UI section           |
| `apps/mobile/src/components/DatePicker.tsx`       | New      | Wrapper component for datetimepicker |

## Risks

| Risk                               | Likelihood | Mitigation                                 |
| ---------------------------------- | ---------- | ------------------------------------------ |
| Date picker requires native module | Medium     | Use community package compatible with Expo |
| Modal height overflow              | Low        | Use ScrollView and test on small screens   |

## Rollback Plan

Remove date picker component and state from ReservationModal. Revert to implicit `new Date()` in the date constant.

## Dependencies

- `@react-native-community/datetimepicker` package installed
- Expo-compatible native module handling

## Success Criteria

- [ ] User can select Today or Tomorrow via quick chips
- [ ] User can open date picker for custom date
- [ ] Selected date is passed to onConfirm callback
- [ ] Date respects business validations (>= today, <= 30 days)
