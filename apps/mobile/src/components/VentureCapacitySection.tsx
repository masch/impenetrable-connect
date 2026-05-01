import React from "react";
import { View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../hooks/useI18n";
import { COLORS } from "@repo/shared";
import { Button } from "./Button";

interface VentureCapacitySectionProps {
  capacity: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  originalCapacity: number;
}

export default function VentureCapacitySection({
  capacity,
  onValueChange,
  disabled,
  originalCapacity,
}: VentureCapacitySectionProps) {
  const { t } = useTranslations();

  return (
    <View className="bg-surface-container-low rounded-3xl border border-outline-variant/30 p-5 shadow-sm mb-4">
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
          <MaterialCommunityIcons
            name="account-group-outline"
            size={24}
            color={COLORS.primary}
            accessibilityLabel={t("venture.capacity_label")}
          />
        </View>
        <Text className="text-lg font-display font-bold text-on-surface">
          {t("venture.capacity_label")}
        </Text>
      </View>

      <View className="flex-row items-center justify-between bg-surface-container-highest/30 p-4 rounded-2xl mb-4">
        <Button
          variant="outline"
          onPress={() => onValueChange(Math.max(1, capacity - 1))}
          className="w-12 h-12 rounded-xl border-outline-variant/50"
          disabled={capacity <= 1 || disabled}
          testID="minus-button"
          accessibilityLabel={t("venture.minus")}
        >
          <MaterialCommunityIcons
            name="minus"
            size={24}
            color={COLORS.primary}
            accessibilityLabel={t("venture.minus")}
          />
        </Button>

        <View className="items-center">
          <View className="flex-row items-center mb-1 opacity-40">
            <Text className="text-[8px] font-body uppercase tracking-widest text-on-surface-variant">
              {t("venture.current_value")}:{" "}
            </Text>
            <Text className="text-[10px] font-display font-bold text-on-surface-variant">
              {originalCapacity}
            </Text>
          </View>

          <Text testID="capacity-text" className="text-3xl font-display font-bold text-on-surface">
            {capacity}
          </Text>
          <Text className="text-[10px] font-body text-on-surface-variant/60 uppercase tracking-widest">
            {t("common.pax")}
          </Text>
        </View>

        <Button
          variant="outline"
          onPress={() => onValueChange(capacity + 1)}
          className="w-12 h-12 rounded-xl border-outline-variant/50"
          disabled={capacity >= 999 || disabled}
          testID="plus-button"
          accessibilityLabel={t("venture.plus")}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={COLORS.primary}
            accessibilityLabel={t("venture.plus")}
          />
        </Button>
      </View>

      <Text className="text-[11px] font-body text-on-surface-variant/70 text-center px-4 mb-2 italic">
        {t("venture.capacity_legend")}
      </Text>
    </View>
  );
}
