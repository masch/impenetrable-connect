import { View, Text } from "react-native";
import { Button } from "../../components/Button";
import { type Order, type OrderStatus, COLORS } from "@repo/shared";
import { useTranslations } from "../../hooks/useI18n";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getOrderActions } from "../../logic/order-actions";
import { formatCurrency } from "../../logic/formatters";

interface BaseReservationCardProps {
  order: Order;
  title?: string;
  hideBorder?: boolean;
  hideShadow?: boolean;
}

interface EntrepreneurReservationCardProps extends BaseReservationCardProps {
  role: "entrepreneur";
  onAccept: () => void;
  onDecline: () => void;
  onCancel?: never;
}

interface TouristReservationCardProps extends BaseReservationCardProps {
  role: "tourist";
  onCancel: () => void;
  onAccept?: never;
  onDecline?: never;
}

type ReservationCardProps = EntrepreneurReservationCardProps | TouristReservationCardProps;

interface StatusConfig {
  color: string;
  label: string;
  icon: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

// Dynamic colors based on status - defined at module level for performance
const getStatusConfig = (t: (key: string) => string, globalStatus: OrderStatus): StatusConfig => {
  const statusMap: Record<OrderStatus, StatusConfig> = {
    OFFER_PENDING: {
      color: COLORS["status-pending"],
      label: t("orders.status.offer_pending"),
      icon: "clock-outline",
      bgClass: "bg-status-pending",
      textClass: "text-status-pending",
      borderClass: "border-status-pending",
    },
    CONFIRMED: {
      color: COLORS.secondary,
      label: t("orders.status.confirmed"),
      icon: "check-circle-outline",
      bgClass: "bg-secondary",
      textClass: "text-secondary",
      borderClass: "border-secondary",
    },
    CANCELLED: {
      color: COLORS.error,
      label: t("orders.status.cancelled"),
      icon: "close-circle-outline",
      bgClass: "bg-error",
      textClass: "text-error",
      borderClass: "border-error",
    },
    SEARCHING: {
      color: COLORS["status-searching"],
      label: t("orders.status.searching"),
      icon: "magnify",
      bgClass: "bg-status-searching",
      textClass: "text-status-searching",
      borderClass: "border-status-searching",
    },
    COMPLETED: {
      color: COLORS.success,
      label: t("orders.status.completed"),
      icon: "check-all",
      bgClass: "bg-success",
      textClass: "text-success",
      borderClass: "border-success",
    },
    EXPIRED: {
      color: COLORS["on-surface-variant"],
      label: t("orders.status.expired"),
      icon: "calendar-remove",
      bgClass: "bg-on-surface-variant",
      textClass: "text-on-surface-variant",
      borderClass: "border-on-surface-variant",
    },
    NO_SHOW: {
      color: COLORS.error,
      label: t("orders.status.no_show"),
      icon: "account-off-outline",
      bgClass: "bg-error",
      textClass: "text-error",
      borderClass: "border-error",
    },
  };

  return (
    statusMap[globalStatus] || {
      color: COLORS["status-searching"],
      label: t("orders.status.searching"),
      icon: "magnify",
      bgClass: "bg-status-searching",
      textClass: "text-status-searching",
      borderClass: "border-status-searching",
    }
  );
};

export default function ReservationCard({
  order,
  role,
  title,
  hideBorder = false,
  hideShadow = false,
  onAccept,
  onDecline,
  onCancel,
}: ReservationCardProps) {
  const { t, locale } = useTranslations();
  const status = getStatusConfig(t, order.global_status);
  const containerClass = `bg-surface-container-lowest overflow-hidden ${hideBorder ? "" : "border border-outline-variant/50 rounded-3xl mb-4"} ${hideShadow ? "" : "shadow-md"}`;

  const headerTitle =
    title ||
    (role === "entrepreneur"
      ? order.reservation?.user?.alias ||
        (order.reservation?.user?.first_name
          ? `${order.reservation.user.first_name} ${order.reservation.user.last_name || ""}`
          : t("orders.registeredTourist"))
      : t("orders.registeredVenture")); // Fallback for venture name if not provided

  const headerIcon = role === "entrepreneur" ? "account-outline" : "storefront-outline";

  // Calculate available actions using the logic layer
  const actions = getOrderActions(order, role, t, {
    onAccept,
    onDecline,
    onCancel,
  });

  return (
    <View className={containerClass} style={hideShadow ? {} : { elevation: 3 }}>
      {/* Visual Indicator Line */}
      <View className={`h-1.5 w-full ${status.bgClass}`} />

      <View className="p-3">
        {/* Header: Status and Items Count */}
        <View className="flex-row justify-between items-center mb-3">
          <View className={`flex-row items-center px-3 py-1.5 rounded-full ${status.bgClass}/15`}>
            <MaterialCommunityIcons
              name={status.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={14}
              color={status.color}
            />
            <Text
              className={`font-display-bold text-[10px] uppercase tracking-[1px] ml-1.5 ${status.textClass}`}
            >
              {status.label}
            </Text>
          </View>

          <View className="flex-row items-center bg-surface-container-low px-3 py-1.5 rounded-full max-w-[60%]">
            <MaterialCommunityIcons
              name={headerIcon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={14}
              color={COLORS["on-surface-variant"]}
            />
            <Text
              className="text-on-surface-variant font-display-bold text-[11px] ml-1.5"
              numberOfLines={1}
            >
              {headerTitle}
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
                    {item.catalog_item?.name_i18n?.[locale as "es" | "en"] ||
                      `${t("orders.itemNumber")}${item.catalog_item_id}`}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <View className="items-end mr-3">
                    <Text className="text-on-surface-variant font-body-medium text-xs">
                      {item.quantity}
                      {item.quantity > 1 && ` x ${formatCurrency(item.price)}`}
                    </Text>
                  </View>
                  <Text className="text-on-surface font-display-black text-[16px] min-w-[80px] text-right">
                    {formatCurrency(item.price * item.quantity)}
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
        <View className="pt-3 border-t border-outline-variant/10">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center bg-surface-container-low px-3 py-1.5 rounded-xl">
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

            <View className={`px-4 py-1.5 rounded-2xl overflow-hidden ${status.bgClass}/15`}>
              <Text className={`font-display-black text-[17px] leading-tight ${status.textClass}`}>
                $
                {formatCurrency(
                  order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0,
                )}
              </Text>
            </View>
          </View>

          {/* Dynamic Actions */}
          {actions.length > 0 && (
            <View className="flex-row gap-2">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  className={`flex-1 ${action.variant === "outline" ? "border-error/30" : ""}`}
                  textClassName={action.variant === "outline" ? "text-error" : "text-xs"}
                  onPress={action.onPress}
                  title={action.label}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
