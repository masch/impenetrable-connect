import {
  Pressable,
  Text,
  View,
  AccessibilityRole,
  AccessibilityState,
  StyleProp,
  ViewStyle,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface ButtonVariantStyle {
  container: string;
  text: string;
  pressed: string;
}

interface ButtonProps {
  title?: string;
  subtitle?: string;
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  className?: string;
  textClassName?: string;
  accessibilityLabel?: string;
  size?: "default" | "sm";
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<string, ButtonVariantStyle> = {
  primary: {
    container: "bg-primary-container",
    text: "text-on-primary",
    pressed: "text-on-primary opacity-80",
  },
  secondary: {
    container: "bg-secondary/10 border border-secondary",
    text: "text-secondary",
    pressed: "text-secondary opacity-70",
  },
  danger: {
    container: "bg-error-container",
    text: "text-on-error-container",
    pressed: "text-on-error-container opacity-80",
  },
  outline: {
    container: "border-2 border-tertiary-container/30 bg-transparent",
    text: "text-tertiary-container",
    pressed: "text-tertiary-container opacity-70",
  },
  ghost: {
    container: "",
    text: "text-on-surface",
    pressed: "opacity-70",
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
  accessibilityRole,
  accessibilityState,
  children,
  textClassName = "",
  style,
}: ButtonProps) {
  const styles = variantStyles[variant];

  const resolvedIconColor: string | undefined =
    iconColor || (variant === "primary" ? "white" : undefined);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel || title || "button"}
      accessibilityRole={accessibilityRole || "button"}
      accessibilityState={accessibilityState}
      className={`
        ${size === "sm" ? "min-h-[44px] py-1" : "min-h-button"} rounded-lg 
        items-center justify-center flex-row gap-2 ${title || children ? "px-4" : "px-2"}
        ${styles.container}
        ${disabled ? "opacity-50" : ""}
        ${className}
      `}
      onPress={onPress}
      disabled={disabled}
      style={style}
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
                    numberOfLines={1}
                    className={`
                      font-bold ${!rightIcon ? "text-center" : ""}
                      ${pressed ? styles.pressed : styles.text}
                      ${textClassName}
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
