# Change Proposal: UI Test Home Family Gomez

**Status**: PROPOSED
**Author**: Antigravity (Senior Architect)
**Topic Key**: `sdd/ui-test-home-family-gomez/proposal`

## 1. Intent

Implement a dedicated UI test suite for the tourist entry flow, specifically for the "Familia Gómez" demo user. This ensures that the first point of contact for many users (the role selector) remains functional and navigates correctly to the catalog.

## 2. Scope

- Create a new test file: `apps/mobile/src/__tests__/tourist-entry-flow.test.tsx`.
- Test the `RoleSelectorScreen` logic.
- Verify state updates in `useAuthStore`.
- Verify navigation via `expo-router`.

## 3. Approach

- Use `jest` and `@testing-library/react-native`.
- Mock `useAuthStore` to spy on `login` and `setUserRole`.
- Mock `router` from `expo-router`.
- Use the existing `Familia Gómez` mock data from `src/mocks/users.ts`.

## 4. Risks & Mitigations

- **Ambiguous Selectors**: If multiple elements have the same text, we will use `testID` or more specific queries.
- **Store Side Effects**: Ensure `jest.clearAllMocks()` is called between tests.
