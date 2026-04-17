import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface ButtonVariantStyle {
  container: string;
  text: string;
  pressed: string;
}

interface ButtonProps {
  title?: string;
  subtitle?: string;
  variant?: "primary" | "secondary" | "danger" | "outline";
  onPress: () => void;
  disabled?: boolean;
  icon?: string; // Standard string/emoji icon
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap; // Vector icon
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap; // Vector icon
  iconColor?: string; // Custom color for icons
  className?: string;
  accessibilityLabel?: string;
  size?: "default" | "sm";
  children?: React.ReactNode;
}

// Section 5: Sharp, angular (0 border-radius) - Section 6: Min touch targets 48x48dp, ideally 64dp+
const variantStyles: Record<string, ButtonVariantStyle> = {
  primary: {
    container: "bg-primary-container",
    text: "text-on-primary",
    pressed: "text-on-primary opacity-80",
  },
  secondary: {
    container: "bg-surface-container-highest",
    text: "text-on-surface",
    pressed: "text-on-surface opacity-70",
  },
  danger: {
    container: "bg-error-container",
    text: "text-on-error-container",
    pressed: "text-on-error-container opacity-80",
  },
  outline: {
    container: "border-2 border-dashed border-tertiary-container/30 bg-transparent",
    text: "text-tertiary-container",
    pressed: "text-tertiary-container opacity-70",
  },
};

export function Button({
  title,
  subtitle,
  variant = "primary",
  onPress,
  disabled = false,
  icon,
  leftIcon,
  rightIcon,
  iconColor,
  className = "",
  accessibilityLabel,
  size = "default",
  children,
}: ButtonProps) {
  const styles = variantStyles[variant];

  // If it's an outline variant, we use the text color for the icon by default
  // Otherwise we use white or the provided iconColor
  const resolvedIconColor: string | undefined =
    iconColor || (variant === "outline" ? undefined : "white");

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel || title || "button"}
      accessibilityRole="button"
      className={`
        ${size === "sm" ? "min-h-[44px] py-1" : "min-h-button"} rounded-lg 
        items-center justify-center flex-row gap-2 ${title || children ? "px-4" : "px-2"}
        ${styles.container}
        ${disabled ? "opacity-50" : ""}
        ${className}
      `}
      onPress={onPress}
      disabled={disabled}
    >
      {({ pressed }) => (
        <>
          {children ? (
            children
          ) : (
            <>
              {leftIcon && (
                <MaterialCommunityIcons
                  name={leftIcon}
                  size={20}
                  color={(pressed ? "on-surface-variant" : resolvedIconColor) as string}
                  className={variant === "outline" ? "text-tertiary-container" : ""}
                />
              )}
              {icon && <Text className="text-lg">{icon}</Text>}

              {title && (
                <View className={`${rightIcon ? "flex-1" : ""} flex-col justify-center`}>
                  <Text
                    className={`
                      font-bold ${!rightIcon ? "text-center" : ""}
                      ${pressed ? styles.pressed : styles.text}
                    `}
                  >
                    {title}
                  </Text>
                  {subtitle && (
                    <Text
                      className={`text-xs text-on-surface opacity-50 ${!rightIcon ? "text-center" : ""}`}
                    >
                      {subtitle}
                    </Text>
                  )}
                </View>
              )}

              {rightIcon && (
                <MaterialCommunityIcons
                  name={rightIcon}
                  size={20}
                  color={(pressed ? "on-surface-variant" : resolvedIconColor) as string}
                  className={variant === "outline" ? "text-tertiary-container" : ""}
                />
              )}
            </>
          )}
        </>
      )}
    </Pressable>
  );
}
