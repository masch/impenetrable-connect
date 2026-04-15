# Delta Spec: UI Test Home Family Gomez

**Change Name**: `ui-test-home-family-gomez`
**Status**: DRAFT
**Topic Key**: `sdd/ui-test-home-family-gomez/spec`

## 1. Requirements

### 1.1 Home Screen Initialization

- The `RoleSelectorScreen` must render without crashing.
- The title `role_selector.welcome` (localized) must be visible.

### 1.2 Family Selection

- An option for "Familia Gómez" must be present in the Tourist section.
- Tapping on "Familia Gómez" must trigger the login flow.

### 1.3 State & Navigation

- The `login` action must be called with:
  - `user_type`: "TOURIST"
  - `alias`: "Familia Gómez"
- The `setUserRole` action must be called with "TOURIST".
- The application must navigate to `/tourist/catalog`.

## 2. Scenarios

### Scenario 1: Successful Gomez Family Login

**Given** the user is on the Role Selector screen
**When** the user taps on the "Familia Gómez" button
**Then** the `auth-store` should be updated with the Gomez family data
**And** the user should be redirected to the Tourist Catalog screen
