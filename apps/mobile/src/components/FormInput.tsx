import { Text, TextInput, View, TextInputProps } from "react-native";

interface FormInputProps extends Omit<TextInputProps, "className"> {
  label: string;
  error?: string;
  helperText?: string;
}

export function FormInput({
  label,
  error,
  helperText,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  ...rest
}: FormInputProps) {
  return (
    <View className="mb-5">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      <TextInput
        className={`bg-white border p-3 rounded-lg ${error ? "border-red-500" : "border-gray-300"}`}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        {...rest}
      />
      {helperText && <Text className="text-xs text-gray-500 mt-1">{helperText}</Text>}
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
