import React from "react";
import { View, Text } from "react-native";
import { type Order, COLORS } from "@repo/shared";
import { useTranslations } from "../../hooks/useI18n";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ReservationCardProps {
  order: Order;
  hideBorder?: boolean;
  hideShadow?: boolean;
  isFirst?: boolean;
  accentColorOverride?: string;
}

export default function ReservationCard({
  order,
  hideBorder = false,
  hideShadow = false,
  isFirst = true,
  accentColorOverride,
}: ReservationCardProps) {
  const { t, getLocalizedName } = useTranslations();
  const isGastronomy = order.catalog_item?.catalog_type_id === 1;
  const accentColorClass = isGastronomy ? "bg-primary" : "bg-secondary";

  const containerClass = `bg-surface-container-lowest overflow-hidden ${hideBorder ? "" : "border border-outline-variant rounded-2xl mb-2"} ${hideShadow ? "" : "shadow-sm"}`;

  return (
    <View className={containerClass} style={hideShadow ? {} : { elevation: 2 }}>
      {/* Category Accent Line - Only show if standalone OR if first in a group */}
      {(!hideBorder || isFirst) && (
        <View
          className={`h-0.5 w-full ${accentColorOverride ? "" : accentColorClass}`}
          style={accentColorOverride ? { backgroundColor: accentColorOverride } : {}}
        />
      )}

      <View className="p-3">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-on-surface font-display-bold text-base leading-tight">
              {order.catalog_item && getLocalizedName(order.catalog_item.name_i18n)}
            </Text>
            <View className="flex-row items-center mt-1">
              <MaterialCommunityIcons
                name="account-outline"
                size={14}
                color={COLORS["on-surface-variant"]}
              />
              <Text className="text-on-surface-variant font-body-medium text-[11px] ml-1.5">
                {order.user?.alias || "Turista Registrado"}
              </Text>
            </View>
          </View>
          <View
            className="px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: `${accentColorOverride || COLORS.primary}20` }}
          >
            <Text
              className="font-display-bold text-[10px] uppercase tracking-wider bg-transparent"
              style={{ color: accentColorOverride || COLORS.primary }}
            >
              {t(`orders.status.${order.global_status.toLowerCase()}`)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center pt-2.5 border-t border-outline-variant/10">
          <View
            className="flex-row items-center px-2 py-1 rounded-lg mr-2.5"
            style={{ backgroundColor: `${accentColorOverride || COLORS.primary}10` }}
          >
            <MaterialCommunityIcons
              name="account-group"
              size={14}
              color={accentColorOverride || COLORS.primary}
            />
            <Text
              className="font-display-black text-[11px] ml-1.5"
              style={{ color: accentColorOverride || COLORS.primary }}
            >
              {order.guest_count}
            </Text>
          </View>

          {order.notes && (
            <View className="flex-row items-center flex-1 bg-surface-container-low px-2 py-1 rounded-lg">
              <MaterialCommunityIcons
                name="comment-text-outline"
                size={12}
                color={COLORS["on-surface-variant"]}
              />
              <Text
                className="text-on-surface-variant font-body-medium text-[11px] ml-1.5 flex-1"
                numberOfLines={1}
              >
                {order.notes}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
