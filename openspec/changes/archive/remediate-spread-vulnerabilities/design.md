# Design: Remediate React Props Spreading Vulnerabilities

## 1. Architectural Decisions

We will eliminate all JSX props spreading in components and elements flagged by SecureCoder to enforce explicit-passing of props, ensuring that unexpected attributes are never passed to native UI elements.

For `FormInput`, we will redefine its interface to list only the supported TextInput properties explicitly, rather than extending `TextInputProps` and spreading the remaining props (`...rest`). This prevents any future lint/scanner warning and makes the component API clear.

---

## 2. Detailed Code Design

### 2.1 apps/mobile/src/app/admin/project/[id].tsx

Refactor AppAlert invocation:

```tsx
<AppAlert
  visible={alertConfig.visible}
  title={alertConfig.title}
  message={alertConfig.message}
  type={alertConfig.type}
  actions={alertConfig.actions}
  onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
/>
```

### 2.2 apps/mobile/src/app/tourist/orders.tsx

Refactor AppAlert invocation:

```tsx
<AppAlert
  visible={alertConfig.visible}
  title={alertConfig.title}
  message={alertConfig.message}
  type={alertConfig.type}
  actions={alertConfig.actions}
  onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
/>
```

### 2.3 apps/mobile/src/components/FormInput.tsx

Refactor interface and component definition:

```tsx
interface FormInputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: TextInputProps["keyboardType"];
  placeholder?: string;
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
  testID?: string;
  editable?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  onBlur?: TextInputProps["onBlur"];
  onFocus?: TextInputProps["onFocus"];
  autoFocus?: boolean;
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  textContentType?: TextInputProps["textContentType"];
}

export function FormInput({
  label,
  error,
  helperText,
  required,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  className = "",
  secureTextEntry,
  autoCapitalize,
  autoCorrect,
  testID,
  editable,
  maxLength,
  multiline,
  numberOfLines,
  onBlur,
  onFocus,
  autoFocus,
  returnKeyType,
  onSubmitEditing,
  textContentType,
}: FormInputProps) {
  return (
    <View className="mb-3">
      <Text className="text-sm font-medium text-on-surface mb-2">
        {label}
        {required && <Text className="text-error"> *</Text>}
      </Text>
      <TextInput
        className={`
          bg-surface-container-highest p-4 min-h-touch
          ${error ? "border-2 border-error-container" : "border-2 border-transparent"}
          ${className}
        `}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={COLORS["on-surface-variant"]}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        testID={testID}
        editable={editable}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onBlur={onBlur}
        onFocus={onFocus}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        textContentType={textContentType}
      />
      ...
```

### 2.4 apps/mobile/src/components/Profile/ProfileView.tsx

Refactor ProfileActionButton mapping:

```tsx
{
  section.actions.map((action) => (
    <ProfileActionButton
      key={action.id}
      title={action.title}
      description={action.description}
      icon={action.icon}
      onPress={action.onPress}
      id={action.id}
    />
  ));
}
```

---

## 3. Rollback Plan

Since we are on a Git feature branch `issue-202/remediate-spread-vulnerabilities`, we can rollback changes instantly at any point using:

```bash
git checkout .
```

Or delete the branch if necessary.
