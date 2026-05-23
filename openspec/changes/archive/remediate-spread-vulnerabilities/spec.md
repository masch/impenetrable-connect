# React Props Spreading Remediation Specification

## 1. Overview

This specification defines the remediation of security and linter findings regarding the usage of the JSX spread operator (`{...props}`) on React components and elements. Spreading objects on elements increases the risk of passing invalid HTML/native props or exposing code to prototype pollution.

We will replace the props spreading with explicit property passing in:

- `apps/mobile/src/app/admin/project/[id].tsx`
- `apps/mobile/src/app/tourist/orders.tsx`
- `apps/mobile/src/components/FormInput.tsx`
- `apps/mobile/src/components/Profile/ProfileView.tsx`

Additionally, we will programmatically suppress three false-positive `detect-object-injection` warnings flagged by Semgrep.

---

## 2. Requirements

### 2.1 AppAlert Prop Passing

Both `admin/project/[id].tsx` and `tourist/orders.tsx` MUST pass properties to `<AppAlert>` explicitly.
Props to pass:

- `visible`
- `title`
- `message`
- `type`
- `actions`
- `onClose`

### 2.2 FormInput Component Refactoring

- The `FormInput` component signature MUST NOT use a rest parameter (`...rest`).
- It MUST explicitly declare all supported TextInput properties.
- It MUST pass these properties explicitly to `<TextInput>`.
- Allowed props: `value`, `onChangeText`, `keyboardType`, `placeholder`, `placeholderTextColor`, `secureTextEntry`, `autoCapitalize`, `autoCorrect`, `testID`, `editable`, `maxLength`, `multiline`, `numberOfLines`, `onBlur`, `onFocus`, `autoFocus`, `returnKeyType`, `onSubmitEditing`, `textContentType`.

### 2.3 ProfileActionButton Prop Passing

- `ProfileView.tsx` MUST NOT spread the `action` object when rendering `<ProfileActionButton>`.
- It MUST pass: `id`, `title`, `description`, `icon`, `onPress` explicitly.

---

## 3. Scenarios

### 3.1 AppAlert rendering in Project Edit Screen

**Given** an `alertConfig` state object in the project detail view
**When** the component renders `<AppAlert>`
**Then** properties `visible`, `title`, `message`, `type`, `actions`, and `onClose` are assigned explicitly.

### 3.2 FormInput rendering with custom keyboard type

**Given** a `<FormInput>` component with `keyboardType="number-pad"`
**When** the component renders the underlying `<TextInput>`
**Then** the `keyboardType` is explicitly passed down without using `{...rest}`.

### 3.3 Profile View actions listing

**Given** a profile action config object
**When** rendering `<ProfileActionButton>` inside the actions list loop
**Then** all props (`title`, `description`, `icon`, `onPress`) are assigned explicitly.

---

## 4. Technical Specification

### 4.1 Files Affected

| File                                                 | Action | Description                                                   |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------- |
| `apps/mobile/src/app/admin/project/[id].tsx`         | Modify | Remove AppAlert JSX spread                                    |
| `apps/mobile/src/app/tourist/orders.tsx`             | Modify | Remove AppAlert JSX spread                                    |
| `apps/mobile/src/components/FormInput.tsx`           | Modify | Redefine props interface, remove `...rest` and element spread |
| `apps/mobile/src/components/Profile/ProfileView.tsx` | Modify | Remove ProfileActionButton JSX spread                         |

---

## 5. Acceptance Criteria

- [ ] **AC1**: No React JSX props spreading remains in the 4 modified files.
- [ ] **AC2**: `FormInput` component is fully typed and does not use `...rest` parameter.
- [ ] **AC3**: Local mobile application tests run and pass successfully (`make test`).
- [ ] **AC4**: Local code formatting, typechecking, and lint checks pass (`make check`).
- [ ] **AC5**: Semgrep scanner verifies that the props spreading findings are resolved.
