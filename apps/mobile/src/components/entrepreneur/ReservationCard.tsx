import { View, Text } from "react-native";
import { Button } from "../../components/Button";
import { Icon } from "../Icon";
import { type Order, type OrderStatus, COLORS } from "@repo/shared";
import { useTranslations } from "../../hooks/useI18n";
import { getOrderActions } from "../../logic/order-actions";
import { formatCurrency, extractTimeFromISO } from "../../logic/formatters";
import { getMomentColor } from "../../constants/moments";

export interface ReservationCardProps {
  order: Order;
  title?: string;
  hideBorder?: boolean;
  hideShadow?: boolean;
  hideStatus?: boolean;
  userRole: "entrepreneur" | "tourist";
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
}

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
      label: t("orders.status.rejected"),
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
  userRole: role,
  title,
  hideBorder = false,
  hideShadow = false,
  hideStatus = false,
  onAccept,
  onDecline,
  onCancel,
}: ReservationCardProps) {
  const { t, getLocalizedName } = useTranslations();
  const status = getStatusConfig(t, order.zzz_global_status);
  const isPending = order.zzz_global_status === "OFFER_PENDING";
  const bgClass = isPending ? "bg-status-pending/5" : "bg-surface-container-lowest";
  const containerClass = `${bgClass} overflow-hidden ${hideBorder ? "" : "border border-outline-variant/50 rounded-3xl mb-4"} ${hideShadow ? "" : "shadow-md"}`;

  const headerTitle =
    title ||
    (role === "entrepreneur"
      ? order.zzz_reservation?.zzz_user?.alias ||
        (order.zzz_reservation?.zzz_user?.firstName
          ? `${order.zzz_reservation.zzz_user.firstName} ${order.zzz_reservation.zzz_user.lastName || ""}`
          : t("orders.registeredTourist"))
      : t("orders.registeredVenture")); // Fallback for venture name if not provided

  const headerIcon = role === "entrepreneur" ? "account-outline" : "storefront-outline";

  // Get specific time from order
  const orderTime = order.zzz_reservation?.zzz_service_at
    ? extractTimeFromISO(order.zzz_reservation.zzz_service_at)
    : "";

  // Get moment color for indicator
  const momentId = order.zzz_reservation?.zzz_time_of_day;
  const momentColor = momentId ? getMomentColor(momentId) : COLORS.primary;

  // Calculate available actions using the logic layer
  const actions = getOrderActions(order, role, t, {
    onAccept,
    onDecline,
    onCancel,
  });

  return (
    <View
      testID={`reservation-card-${order.zzz_id}`}
      className={`${containerClass} ${!hideShadow ? "shadow-md" : ""}`}
    >
      {/* Status Color Bar with moment color */}
      <View className="h-1.5 w-full" style={{ backgroundColor: momentColor }} />

      <View className="p-3">
        {/* Header: Status and Items Count */}
        <View
          className={`flex-row items-center mb-3 ${hideStatus ? "justify-center" : "justify-between"}`}
        >
          {!hideStatus && (
            <View className={`flex-row items-center px-3 py-1.5 rounded-full ${status.bgClass}/15`}>
              <Icon
                name={status.icon}
                size={14}
                color={status.color}
                accessibilityLabel={status.label}
              />
              <Text
                className={`font-display-bold text-[10px] uppercase tracking-[1px] ml-1.5 ${status.textClass}`}
              >
                {status.label}
              </Text>
            </View>
          )}

          <View
            className={`flex-row items-center px-4 py-2 rounded-full max-w-[90%] ${
              hideStatus ? "bg-primary/10 border border-primary/20" : "bg-surface-container-low"
            }`}
          >
            <Icon
              name={headerIcon}
              size={hideStatus ? 18 : 14}
              color={hideStatus ? COLORS.primary : COLORS["on-surface-variant"]}
              accessibilityLabel={headerTitle}
            />
            <Text
              className={`font-display-black ml-2 ${
                hideStatus ? "text-on-surface text-[14px]" : "text-on-surface-variant text-[11px]"
              }`}
              numberOfLines={1}
            >
              {headerTitle}
            </Text>
            {orderTime && (
              <View
                className="ml-2 px-2.5 py-1 rounded-lg flex-row items-center gap-1"
                style={{ backgroundColor: momentColor + "20" }}
              >
                <Icon name="clock-outline" size={12} color={momentColor} />
                <Text className="font-display-bold text-[11px]" style={{ color: momentColor }}>
                  {orderTime}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content: List of Items */}
        <View className="mb-4">
          {order.zzz_items && order.zzz_items.length > 0 ? (
            order.zzz_items.map((item, idx) => (
              <View key={item.zzz_id} className={`flex-row items-center ${idx > 0 ? "mt-4" : ""}`}>
                <View className="flex-1 mr-2">
                  <Text className="text-on-surface font-display-bold text-[15px]" numberOfLines={2}>
                    {getLocalizedName(item.zzz_catalog_item?.zzz_name_i18n) ||
                      `${t("orders.itemNumber")}${item.zzz_catalog_item_id}`}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <View className="items-end mr-3">
                    <Text className="text-on-surface-variant font-body-medium text-xs">
                      {item.zzz_quantity}
                      {item.zzz_quantity > 1 && ` x ${formatCurrency(item.zzz_price)}`}
                    </Text>
                  </View>
                  <Text className="text-on-surface font-display-black text-[16px] min-w-[80px] text-right">
                    {formatCurrency(item.zzz_price * item.zzz_quantity)}
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
        {order.zzz_notes && (
          <View className="bg-surface-container-low/50 p-3 rounded-2xl mb-4 border border-outline-variant/20">
            <View className="flex-row items-center mb-1">
              <Icon
                name="comment-text-outline"
                size={12}
                color={COLORS["on-surface-variant"]}
                accessibilityLabel={t("orders.notes")}
              />
              <Text className="text-on-surface-variant font-display-bold text-[10px] uppercase ml-1.5 tracking-wider">
                {t("orders.notes")}
              </Text>
            </View>
            <Text className="text-on-surface font-body-medium text-xs leading-relaxed">
              {order.zzz_notes}
            </Text>
          </View>
        )}

        {/* Footer: Actions or Details */}
        <View className="pt-3 border-t border-outline-variant/10">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center bg-surface-container-low px-3 py-1.5 rounded-xl">
                <Icon
                  name="silverware-variant"
                  size={14}
                  color={COLORS["on-surface-variant"]}
                  accessibilityLabel={t("common.dishes_other")}
                />
                <Text className="text-on-surface-variant font-display-black text-[11px] ml-2 uppercase tracking-tighter">
                  {order.zzz_items?.reduce((sum, item) => sum + item.zzz_quantity, 0) || 0}{" "}
                  {t("common.dishes_other")}
                </Text>
              </View>

              <View className="flex-row items-center bg-surface-container-low px-3 py-1.5 rounded-xl border border-primary/10">
                <Icon
                  name="account-group-outline"
                  size={14}
                  color={COLORS.primary}
                  accessibilityLabel={t("common.pax")}
                />
                <Text className="text-primary font-display-black text-[11px] ml-2 uppercase tracking-tighter">
                  {order.zzz_reservation?.zzz_guest_count || 1} {t("common.pax")}
                </Text>
              </View>
            </View>

            <View className={`px-4 py-1.5 rounded-2xl overflow-hidden ${status.bgClass}/15`}>
              <Text className={`font-display-black text-[17px] ${status.textClass}`}>
                {formatCurrency(
                  order.zzz_items?.reduce(
                    (sum, item) => sum + item.zzz_price * item.zzz_quantity,
                    0,
                  ) || 0,
                )}
              </Text>
            </View>
          </View>

          {/* Dynamic Actions */}
          {actions.length > 0 && (
            <View className="flex-row gap-2">
              {actions.map((action) => (
                <Button
                  key={action.zzz_id}
                  variant={action.variant}
                  className={`flex-1 ${action.variant === "outline" ? "border-error/30" : ""}`}
                  textClassName={action.variant === "outline" ? "text-error" : "text-xs"}
                  onPress={action.onPress}
                  title={action.label}
                  testID={`order-action-${action.zzz_id}`}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
