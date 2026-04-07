import { Text, TextInput, View, TextInputProps } from "react-native";

interface FormInputProps extends Omit<TextInputProps, "className"> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
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
  ...rest
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
        `}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="text-on-surface opacity-40"
        {...rest}
      />
      {helperText && <Text className="text-xs text-on-surface opacity-60 mt-1">{helperText}</Text>}
      {error && <Text className="text-xs text-on-error-container mt-1">{error}</Text>}
    </View>
  );
}
