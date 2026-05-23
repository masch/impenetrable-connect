# Proposal: Remediate React Props Spreading Vulnerabilities

## 1. Change Summary

**What**: Remediate four security/linter findings where React JSX props spreading (`{...props}`) is used.
**Why**: JSX props spreading on elements or custom components risks passing invalid/polluted props. We will replace these with explicit property assignments to follow the project's security and design standards.

---

## 2. Scope

We will modify 4 files in the `apps/mobile` package:

1. `apps/mobile/src/app/admin/project/[id].tsx` (line 384)
2. `apps/mobile/src/app/tourist/orders.tsx` (line 417)
3. `apps/mobile/src/components/FormInput.tsx` (line 41)
4. `apps/mobile/src/components/Profile/ProfileView.tsx` (line 87)

Additionally, we will programmatically suppress 3 false-positive object injection warnings.

---

## 3. Implementation

- **Project Detail & Orders**: Destructure `alertConfig` or pass its keys explicitly to `<AppAlert>` component:
  ```tsx
  <AppAlert
    visible={alertConfig.visible}
    title={alertConfig.title}
    message={alertConfig.message}
    type={alertConfig.type}
    actions={alertConfig.actions}
    onClose={...}
  />
  ```
- **ProfileView**: Pass keys of the `action` object explicitly to `<ProfileActionButton>`:
  ```tsx
  <ProfileActionButton
    key={action.id}
    title={action.title}
    description={action.description}
    icon={action.icon}
    onPress={action.onPress}
    id={action.id}
  />
  ```
- **FormInput**: Destructure accepted props explicitly in `FormInput` signature and assign them explicitly on `<TextInput>` instead of `{...rest}`:
  ```tsx
  // Destructure secureTextEntry, autoCapitalize, autoComplete, maxLength, multiline, etc.
  ```

---

## 4. Risks

| Risk                            | Severity | Mitigation                                                                          |
| ------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| Omission of a prop in FormInput | Low      | Explicitly check `TextInputProps` and pass all commonly used text input attributes. |
| Alert configuration mismatch    | Low      | AppAlert props are fully typed; TypeScript compiler will catch any mismatch.        |

---

## 5. Next Steps

1. User reviews and approves this proposal.
2. Proceed to specifications and implementation phase.
