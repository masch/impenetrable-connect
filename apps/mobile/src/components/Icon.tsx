import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// TODO: Migrate to expo-symbols when it exits beta and supports web
// See: https://github.com/masch/impenetrable-connect/issues/191
// - expo-symbols only works on iOS native builds (not web)
// - When stable: use SymbolView on iOS, fallback to MaterialCommunityIcons on Android/Web
// - Current approach: use MaterialCommunityIcons on all platforms (works but shows deprecation warning)

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  testID?: string;
  style?: object;
  accessibilityLabel?: string;
  className?: string;
}

/**
 * Centralized Icon component wrapping MaterialCommunityIcons
 * from @expo/vector-icons (works on iOS, Android, Web).
 */
export function Icon({
  name,
  size = 24,
  color,
  testID,
  style,
  accessibilityLabel,
  className,
}: IconProps): React.ReactElement {
  return (
    <MaterialCommunityIcons
      name={name as never}
      size={size}
      color={color}
      testID={testID}
      style={style}
      accessibilityLabel={accessibilityLabel}
      className={className}
    />
  );
}
