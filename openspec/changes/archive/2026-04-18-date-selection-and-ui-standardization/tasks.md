# Tasks: Could Add a Control for Date Selection on Order?

## Phase 1: Foundation

- [ ] 1.1 Install `@react-native-community/datetimepicker` package in `apps/mobile`
- [ ] 1.2 Verify Expo native module configuration (pod install if needed)

## Phase 2: DatePicker Component

- [ ] 2.1 Create `apps/mobile/src/components/DatePicker.tsx` wrapper component
- [ ] 2.2 Apply NativeWind styling via className prop
- [ ] 2.3 Implement minimumDate/maximumDate constraints
- [ ] 2.4 Add locale handling (es-AR formatting)

## Phase 3: ReservationModal Integration

- [ ] 3.1 Add controlled date state to ReservationModal
- [ ] 3.2 Create Today/Tomorrow quick-select chips UI
- [ ] 3.3 Wire DatePicker component with modal state
- [ ] 3.4 Pass selectedDate to onConfirm callback

## Phase 4: Testing

- [ ] 4.1 Write unit tests for DatePicker component
- [ ] 4.2 Write integration tests for chip selection flow
- [ ] 4.3 Test date passed to onConfirm callback

## Phase 5: Cleanup

- [ ] 5.1 Verify all 7 spec scenarios pass
- [ ] 5.2 Test edge cases (past dates, beyond 30 days)
