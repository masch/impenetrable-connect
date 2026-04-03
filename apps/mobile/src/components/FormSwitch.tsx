import { Text, View, Switch, SwitchProps } from "react-native";

interface FormSwitchProps extends Omit<SwitchProps, "className"> {
  label: string;
}

export function FormSwitch({ label, value, onValueChange, ...rest }: FormSwitchProps) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-sm text-gray-700">{label}</Text>
      <Switch value={value} onValueChange={onValueChange} {...rest} />
    </View>
  );
}
