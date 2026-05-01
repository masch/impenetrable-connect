import React from "react";
import { View, Text } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * SectionHeader - Sticky-friendly header for catalog categories
 */
export const SectionHeader = ({ title, subtitle, className = "" }: SectionHeaderProps) => {
  return (
    <View className={`bg-surface px-4 py-3 border-b border-outline-variant/20 ${className}`}>
      <Text className="text-xl font-display font-bold text-on-surface">{title}</Text>
      {subtitle && (
        <Text className="text-xs font-body text-on-surface-variant opacity-70">{subtitle}</Text>
      )}
    </View>
  );
};
