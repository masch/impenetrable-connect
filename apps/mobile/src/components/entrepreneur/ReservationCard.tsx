import React from "react";
import { View, Text } from "react-native";
import { Button } from "../../components/Button";
import { type Order, COLORS } from "@repo/shared";
import { useTranslations } from "../../hooks/useI18n";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ReservationCardProps {
  order: Order;
  hideBorder?: boolean;
  hideShadow?: boolean;
}

export default function ReservationCard({
  order,
  hideBorder = false,
  hideShadow = false,
}: ReservationCardProps) {
  const { t, locale } = useTranslations();
  const isPending = order.global_status === "OFFER_PENDING";

  // Dynamic colors based on status
  const getStatusConfig = () => {
    const statusMap: Record<string, { color: string; label: string; icon: string }> = {
      OFFER_PENDING: {
        color: COLORS["status-pending"],
        label: t("orders.status.offer_pending"),
        icon: "clock-outline",
      },
      CONFIRMED: {
        color: COLORS.secondary,
        label: t("orders.status.confirmed"),
        icon: "check-circle-outline",
      },
      CANCELLED: {
        color: COLORS.error,
        label: t("orders.status.cancelled"),
        icon: "close-circle-outline",
      },
      SEARCHING: {
        color: COLORS["status-searching"], // Vibrant sky blue for searching
        label: t("orders.status.searching"),
        icon: "magnify",
      },
      COMPLETED: {
        color: COLORS.success,
        label: t("orders.status.completed"),
        icon: "check-all",
      },
      EXPIRED: {
        color: COLORS["on-surface-variant"],
        label: t("orders.status.expired"),
        icon: "calendar-remove",
      },
    };

    return (
      statusMap[order.global_status] || {
        color: COLORS["status-searching"],
        label: t("orders.status.searching"),
        icon: "magnify",
      }
    );
  };

  const status = getStatusConfig();
  const containerClass = `bg-surface-container-lowest overflow-hidden ${hideBorder ? "" : "border border-outline-variant/50 rounded-3xl mb-4"} ${hideShadow ? "" : "shadow-md"}`;

  return (
    <View className={containerClass} style={hideShadow ? {} : { elevation: 3 }}>
      {/* Visual Indicator Line */}
      <View className="h-1.5 w-full" style={{ backgroundColor: status.color }} />

      <View className="p-4">
        {/* Header: Status and Items Count */}
        <View className="flex-row justify-between items-center mb-4">
          <View
            className="flex-row items-center px-3 py-1.5 rounded-full"
            style={{ backgroundColor: `${status.color}15` }}
          >
            <MaterialCommunityIcons
              name={status.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={14}
              color={status.color}
            />
            <Text
              className="font-display-bold text-[10px] uppercase tracking-[1px] ml-1.5"
              style={{ color: status.color }}
            >
              {status.label}
            </Text>
          </View>

          <View className="flex-row items-center bg-surface-container-low px-3 py-1.5 rounded-full">
            <MaterialCommunityIcons
              name="account-outline"
              size={14}
              color={COLORS["on-surface-variant"]}
            />
            <Text className="text-on-surface-variant font-display-bold text-[11px] ml-1.5">
              {order.reservation?.user?.alias ||
                (order.reservation?.user?.first_name
                  ? `${order.reservation.user.first_name} ${order.reservation.user.last_name || ""}`
                  : t("orders.registeredTourist"))}
            </Text>
          </View>
        </View>

        {/* Content: List of Items */}
        <View className="mb-4">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, idx) => (
              <View key={item.id} className={`flex-row items-center ${idx > 0 ? "mt-4" : ""}`}>
                <View className="flex-1 mr-2">
                  <Text
                    className="text-on-surface font-display-bold text-[15px] leading-tight"
                    numberOfLines={2}
                  >
                    {item.catalog_item?.name_i18n[locale as "es" | "en"] ||
                      `${t("orders.itemNumber")}${item.catalog_item_id}`}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-on-surface-variant font-display-bold text-xs mr-4">
                    x{item.quantity}
                  </Text>
                  <Text className="text-on-surface font-display-black text-[15px]">
                    ${(item.price * item.quantity).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-on-surface-variant font-body-medium italic">
              {t("orders.noItems")}
            </Text>
          )}
        </View>

        {/* Notes Section */}
        {order.notes && (
          <View className="bg-surface-container-low/50 p-3 rounded-2xl mb-4 border border-outline-variant/20">
            <View className="flex-row items-center mb-1">
              <MaterialCommunityIcons
                name="comment-text-outline"
                size={12}
                color={COLORS["on-surface-variant"]}
              />
              <Text className="text-on-surface-variant font-display-bold text-[10px] uppercase ml-1.5 tracking-wider">
                {t("orders.notes")}
              </Text>
            </View>
            <Text className="text-on-surface font-body-medium text-xs leading-relaxed">
              {order.notes}
            </Text>
          </View>
        )}

        {/* Footer: Actions or Details */}
        <View className="pt-4 border-t border-outline-variant/10">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center bg-surface-container-low px-4 py-2 rounded-xl">
              <MaterialCommunityIcons
                name="silverware-variant"
                size={14}
                color={COLORS["on-surface-variant"]}
              />
              <Text className="text-on-surface-variant font-display-black text-[11px] ml-2 uppercase tracking-tighter">
                {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}{" "}
                {t("common.dishes_other")}
              </Text>
            </View>

            <View
              className="px-4 py-2 rounded-xl shadow-sm"
              style={{ backgroundColor: `${status.color}20` }}
            >
              <Text className="font-display-black text-lg" style={{ color: status.color }}>
                $
                {order.items
                  ?.reduce((sum, item) => sum + item.price * item.quantity, 0)
                  .toLocaleString()}
              </Text>
            </View>
          </View>

          {isPending && (
            <View className="flex-row">
              <Button
                variant="outline"
                className="flex-1 mr-2"
                textClassName="text-red-500 text-xs"
                onPress={() => {}}
                title={t("common.decline")}
              />
              <Button
                variant="primary"
                className="flex-1"
                textClassName="text-white text-xs"
                onPress={() => {}}
                title={t("common.accept")}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
