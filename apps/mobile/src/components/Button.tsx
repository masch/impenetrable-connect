import { Pressable, Text } from "react-native";

interface ButtonVariant {
  container: string;
  text: string;
}

interface ButtonProps {
  title: string;
  variant?: "primary" | "secondary" | "danger";
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
}

const variantStyles: Record<string, ButtonVariant> = {
  primary: {
    container: "bg-green-600",
    text: "text-white",
  },
  secondary: {
    container: "bg-white border border-gray-300",
    text: "text-gray-700",
  },
  danger: {
    container: "bg-red-600",
    text: "text-white",
  },
};

export function Button({
  title,
  variant = "primary",
  onPress,
  disabled = false,
  icon,
}: ButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = disabled;

  return (
    <Pressable
      className={`py-3 px-4 rounded-lg items-center justify-center flex-row gap-2 ${styles.container} ${isDisabled ? "opacity-50" : ""}`}
      onPress={onPress}
      disabled={isDisabled}
    >
      {icon && <Text className="text-lg">{icon}</Text>}
      <Text className={`font-semibold text-center ${styles.text}`}>{title}</Text>
    </Pressable>
  );
}
