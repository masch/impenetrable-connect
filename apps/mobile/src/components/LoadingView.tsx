import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useTranslations } from "../hooks/useI18n";
import { COLORS } from "@repo/shared";

interface LoadingViewProps {
  /**
   * Optional message to display under the spinner.
   * If not provided and showText is true, it defaults to the 'loading' translation.
   */
  message?: string;
  /**
   * Whether to occupy the full container height with flex-1 and center content.
   * @default true
   */
  fullScreen?: boolean;
  /**
   * Whether to show the message text at all.
   * @default true
   */
  showText?: boolean;
  /**
   * Additional Tailwind/NativeWind classes for the container.
   */
  className?: string;
}

/**
 * A standardized loading indicator for screens and components.
 * Consumes the global primary color and translations.
 */
export default function LoadingView({
  message,
  fullScreen = true,
  showText = true,
  className = "",
}: LoadingViewProps) {
  const { t } = useTranslations();

  const containerClasses = [
    "items-center justify-center",
    fullScreen ? "flex-1" : "py-8",
    className,
  ].join(" ");

  return (
    <View className={containerClasses}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {showText && (
        <Text className="text-base font-body text-on-surface opacity-60 mt-4 text-center">
          {message || t("loading")}
        </Text>
      )}
    </View>
  );
}
