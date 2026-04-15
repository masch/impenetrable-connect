/**
 * SectionHeader Component
 * Displays a section title with optional subtitle and icon
 */

import { Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { COLORS } from "@repo/shared";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, icon, className = "" }: SectionHeaderProps) {
  return (
    <View className={`mb-4 ${className}`}>
      <View className="flex-row items-center gap-2">
        {icon && (
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={24}
            color={COLORS.secondary}
          />
        )}
        <Text className="text-xl font-display font-bold text-on-surface">{title}</Text>
      </View>
      {subtitle && (
        <Text className="text-sm font-body text-on-surface opacity-60 mt-1 ml-6">{subtitle}</Text>
      )}
    </View>
  );
}
