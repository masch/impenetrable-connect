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
  const horizontalPadding = Platform.OS === "web" || Platform.OS === "android" ? "px-4" : "";

  return (
    <SafeAreaView className={`flex-1 bg-surface ${horizontalPadding} ${className}`}>
      {children}
    </SafeAreaView>
  );
}

interface ScreenContentProps {
  children: ReactNode;
  className?: string;
}

export function ScreenContent({ children, className = "" }: ScreenContentProps) {
  return <View className={`flex-1 w-full max-w-md mx-auto ${className}`}>{children}</View>;
}
