# Technical Design: UI Test Home Family Gomez

**Change Name**: `ui-test-home-family-gomez`
**Status**: DRAFT
**Topic Key**: `sdd/ui-test-home-family-gomez/design`

## 1. Architecture Decisions

### 1.1 Test Isolation

We will mock `useAuthStore` using `jest.mock`. This allows us to verify that actions are called without actually affecting the global state or requiring a full store setup.

### 1.2 Router Mocking

We will use the existing mock for `expo-router` (already provided in the project's test setup) to intercept and verify `router.push` calls.

### 1.3 Selector Strategy

We will use `screen.getByText` for initial verification. If performance issues or ambiguity arise, we will add `testID` to the components.

## 2. Implementation Plan

### 2.1 Mocks

- Mock `../stores/auth.store`.
- Mock `expo-router`.

### 2.2 Test Structure

1. `describe("Tourist Entry Flow")`
2. `beforeEach`: Clear all mocks and setup the store mock implementation.
3. `it("should navigate to catalog when Familia Gómez is selected")`

## 3. Tooling

- **Framework**: Jest + React Native Testing Library.
- **Utils**: Using `apps/mobile/src/__tests__/utils/test-utils.tsx`.
