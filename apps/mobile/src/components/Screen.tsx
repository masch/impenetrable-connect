import { ReactNode } from "react";
import { View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  className?: string;
}

export default function Screen({ children, className = "" }: ScreenProps) {
  // Use Tailwind classes for horizontal padding based on platform
  // Android/Web: px-4 (16px), iOS: no horizontal padding (handled by safe area)
  const horizontalPadding = Platform.OS === "web" || Platform.OS === "android" ? "px-2" : "";

  return (
    <SafeAreaView edges={["top"]} className={`flex-1 bg-surface ${horizontalPadding} ${className}`}>
      {children}
    </SafeAreaView>
  );
}

interface ScreenContentProps {
  children: ReactNode;
  className?: string;
}

export function ScreenContent({ children, className = "" }: ScreenContentProps) {
  const bottomPadding = Platform.select({
    web: "",
    android: "pb-4",
    ios: "pb-20",
    default: "pb-20",
  });
  return (
    <View className={`flex-1 w-full max-w-xl mx-auto ${bottomPadding} ${className}`}>
      {children}
    </View>
  );
}
