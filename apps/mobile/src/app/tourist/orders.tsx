/**
 * Tourist Orders Screen
 * Displays active and historical orders with status badges
 */

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, ScrollView, RefreshControl, Alert } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../../hooks/useI18n";
import Screen, { ScreenContent } from "../../components/Screen";
import LoadingView from "../../components/LoadingView";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { useOrdersStore } from "../../stores/orders.store";
import { useAuthStore } from "../../stores/auth.store";
import { Button } from "../../components/Button";
import { getTimeOfDayIcon, getTimeOfDayColor } from "../../constants/moments";
import { type Order, type OrderStatus, COLORS } from "@repo/shared";

// Status badge mapping - labels come from i18n
const getStatusConfig = (
  t: (key: string) => string,
): Record<OrderStatus, { label: string; bgClass: string; textClass: string }> => ({
  SEARCHING: {
    label: t("orders.status.searching"),
    bgClass: "bg-tertiary-container",
    textClass: "text-on-tertiary-fixed",
  },
  OFFER_PENDING: {
    label: t("orders.status.offer_pending"),
    bgClass: "bg-primary-container",
    textClass: "text-on-primary-fixed",
  },
  CONFIRMED: {
    label: t("orders.status.confirmed"),
    bgClass: "bg-secondary-container",
    textClass: "text-on-secondary-fixed",
  },
  COMPLETED: {
    label: t("orders.status.completed"),
    bgClass: "bg-surface-container-highest",
    textClass: "text-on-surface opacity-60",
  },
  CANCELLED: {
    label: t("orders.status.cancelled"),
    bgClass: "bg-error-container",
    textClass: "text-error",
  },
  NO_SHOW: {
    label: t("orders.status.noShow"),
    bgClass: "bg-error-container",
    textClass: "text-error",
  },
  EXPIRED: {
    label: t("orders.status.expired"),
    bgClass: "bg-error-container",
    textClass: "text-on-error-container",
  },
});

// Format time of day for display using i18n
function formatTimeOfDay(timeOfDay: string, t: (key: string) => string): string {
  const keyMap: Record<string, string> = {
    BREAKFAST: "breakfast",
    LUNCH: "lunch",
    SNACK: "snack",
    DINNER: "dinner",
  };
  const key = keyMap[timeOfDay] || timeOfDay.toLowerCase();
  return t(`catalog.reservation.moments.${key}`);
}

// Check if date is today, tomorrow, or yesterday
function getDateLabel(date: Date): "today" | "tomorrow" | "yesterday" | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  if (checkDate.getTime() === today.getTime()) return "today";
  if (checkDate.getTime() === tomorrow.getTime()) return "tomorrow";
  if (checkDate.getTime() === yesterday.getTime()) return "yesterday";
  return null;
}

// Format date for display
function formatDate(date: Date, locale: string = "es-AR"): string {
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

// Active Order Card Component
interface ActiveOrderCardProps {
  order: Order;
  onCancel: (orderId: number) => void;
}

function ActiveOrderCard({ order, onCancel }: ActiveOrderCardProps) {
  const { t, getLocalizedName } = useTranslations();
  const statusConfig = getStatusConfig(t);
  const status = statusConfig[order.global_status];
  const showCancelButton = order.global_status === "SEARCHING";

  return (
    <View className="bg-surface-container-lowest rounded-xl p-4 mb-4 shadow-sm">
      {/* Status Badge */}
      <View className={`self-start px-3 py-1 rounded-md mb-3 ${status.bgClass}`}>
        <Text className={`text-[10px] font-black tracking-widest uppercase ${status.textClass}`}>
          {status.label}
        </Text>
      </View>

      {/* Title */}
      <Text className="text-xl font-display font-bold text-on-surface mb-2">
        {getLocalizedName(order.catalog_item?.name_i18n)}
      </Text>

      {/* Date and Time */}
      <View className="flex-row items-center gap-2 mb-1">
        {getDateLabel(order.service_date) === null && (
          <MaterialCommunityIcons name="calendar" size={14} color={COLORS["on-surface-variant"]} />
        )}
        {getDateLabel(order.service_date) === "today" ? (
          <View className="bg-primary px-2 py-0.5 rounded">
            <Text className="text-xs font-bold text-on-primary">{t("orders.today")}</Text>
          </View>
        ) : getDateLabel(order.service_date) === "tomorrow" ? (
          <View className="bg-secondary px-2 py-0.5 rounded">
            <Text className="text-xs font-bold text-on-primary">{t("orders.tomorrow")}</Text>
          </View>
        ) : (
          <Text className="text-base font-body text-on-surface opacity-80">
            {formatDate(order.service_date)}
          </Text>
        )}
        <View className="flex-row items-center gap-1">
          <MaterialCommunityIcons
            name={
              getTimeOfDayIcon(order.time_of_day) as keyof typeof MaterialCommunityIcons.glyphMap
            }
            size={14}
            color={getTimeOfDayColor(order.time_of_day)}
          />
          <Text className={`text-sm font-body moment-${order.time_of_day.toLowerCase()}`}>
            {formatTimeOfDay(order.time_of_day, t)}
          </Text>
        </View>
      </View>

      {/* Guest count */}
      <View className="flex-row items-center gap-2 mb-4">
        <MaterialCommunityIcons
          name="account-group-outline"
          size={20}
          color={COLORS["on-surface"]}
          className="opacity-60"
        />
        <Text className="text-base font-body text-on-surface opacity-80">
          {order.guest_count} {t("orders.guest_count")}
        </Text>
      </View>

      {/* Confirmation code (if confirmed) */}
      {order.global_status === "CONFIRMED" && order.confirmed_venture_id && (
        <View className="flex-row items-center gap-2 mb-4">
          <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.secondary} />
          <Text className="text-base font-body text-secondary font-bold">
            {t("orders.status.confirmed")}
          </Text>
        </View>
      )}

      {/* Cancel Button */}
      {showCancelButton && (
        <Button
          variant="danger"
          title={t("orders.cancel")}
          onPress={() => {
            Alert.alert(t("orders.cancel"), t("orders.cancelConfirm"), [
              { text: t("orders.keeping"), style: "cancel" },
              {
                text: t("orders.confirmCancel"),
                style: "destructive",
                onPress: () => onCancel(order.id),
              },
            ]);
          }}
          disabled={order.global_status !== "SEARCHING"}
          className="mt-2"
        />
      )}
    </View>
  );
}

// History Item Component
interface HistoryItemProps {
  order: Order;
}

function HistoryItem({ order }: HistoryItemProps) {
  const { t, getLocalizedName } = useTranslations();
  const statusConfig = getStatusConfig(t);
  const status = statusConfig[order.global_status];

  // Icon based on status
  const getIcon = () => {
    switch (order.global_status) {
      case "COMPLETED":
        return "check_circle";
      case "CANCELLED":
        return "cancel";
      case "NO_SHOW":
        return "event_busy";
      default:
        return "help";
    }
  };

  return (
    <View className="flex-row items-center bg-surface-container-lowest rounded-xl p-4 mb-3">
      {/* Icon */}
      <View className="w-10 h-10 rounded-full bg-surface-container-highest items-center justify-center mr-3">
        <MaterialCommunityIcons
          name={getIcon() as keyof typeof MaterialCommunityIcons.glyphMap}
          size={20}
          color={COLORS["on-surface"]}
          className="opacity-60"
        />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-base font-display font-bold text-on-surface">
          {getLocalizedName(order.catalog_item?.name_i18n)}
        </Text>
        <View className="flex-row items-center gap-3 mt-1">
          {getDateLabel(order.service_date) === null && (
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons
                name="calendar"
                size={14}
                color={COLORS["on-surface-variant"]}
              />
              <Text className="text-sm font-body text-on-surface opacity-60">
                {formatDate(order.service_date)}
              </Text>
            </View>
          )}
          {getDateLabel(order.service_date) === "today" && (
            <View className="bg-primary px-2 py-0.5 rounded">
              <Text className="text-xs font-bold text-on-primary">{t("orders.today")}</Text>
            </View>
          )}
          {getDateLabel(order.service_date) === "tomorrow" && (
            <View className="bg-secondary px-2 py-0.5 rounded">
              <Text className="text-xs font-bold text-on-primary">{t("orders.tomorrow")}</Text>
            </View>
          )}
          {getDateLabel(order.service_date) === "yesterday" && (
            <View className="bg-surface-container-highest px-2 py-0.5 rounded">
              <Text className="text-xs font-bold text-on-surface opacity-60">
                {t("orders.yesterday")}
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <MaterialCommunityIcons
              name={
                getTimeOfDayIcon(order.time_of_day) as keyof typeof MaterialCommunityIcons.glyphMap
              }
              size={14}
              color={getTimeOfDayColor(order.time_of_day)}
            />
            <Text className={`text-sm font-body moment-${order.time_of_day.toLowerCase()}`}>
              {formatTimeOfDay(order.time_of_day, t)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <MaterialCommunityIcons
              name="account-group-outline"
              size={14}
              color={COLORS["on-surface"]}
            />
            <Text className="text-sm font-body text-on-surface opacity-60">
              {order.guest_count} {t("orders.guest_count")}
            </Text>
          </View>
        </View>
      </View>

      {/* Status Badge */}
      <View className={`px-2 py-1 rounded ${status.bgClass}`}>
        <Text className={`text-[10px] font-black tracking-widest uppercase ${status.textClass}`}>
          {status.label}
        </Text>
      </View>
    </View>
  );
}

// Empty State Component
interface EmptyStateProps {
  type: "active" | "history";
}

function EmptyState({ type }: EmptyStateProps) {
  const { t } = useTranslations();

  const content = {
    active: {
      title: t("orders.noActive"),
    },
    history: {
      title: t("orders.noHistory"),
    },
  };

  const { title } = content[type];

  return (
    <View className="flex-1 items-center justify-center py-20">
      <MaterialCommunityIcons
        name={type === "active" ? "package-variant-closed" : "history"}
        size={48}
        color={COLORS["on-surface"]}
        className="opacity-20 mb-4"
      />
      <Text className="text-xl font-display font-bold text-on-surface opacity-40 text-center">
        {title}
      </Text>
    </View>
  );
}

export default function OrderScreen() {
  const router = useRouter();
  const { t } = useTranslations();
  const {
    activeOrders,
    historyOrders,
    isLoading,
    error,
    selectedTab,
    fetchOrders,
    cancelOrder,
    setTab,
  } = useOrdersStore();

  const currentUser = useAuthStore((state) => state.currentUser);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!currentUser) {
      router.replace("/tourist");
    }
  }, [currentUser, router]);

  // Fetch orders when user changes
  useEffect(() => {
    fetchOrders();
  }, [currentUser?.id, fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  // Handle tab change
  const handleTabChange = (index: number) => {
    setTab(index === 0 ? "active" : "history");
  };

  // Determine which orders to display based on selected tab
  const displayedOrders = selectedTab === "active" ? activeOrders : historyOrders;

  return (
    <Screen>
      <ScreenContent className="pb-20">
        {/* Header */}
        <View className="py-6">
          <Text className="text-3xl font-display font-bold text-on-surface">
            {t("orders.title")}
          </Text>
        </View>

        {/* Segmented Control with counts */}
        <View className="mb-6">
          <SegmentedControl
            segments={[
              { label: `${t("orders.active")} (${activeOrders.length})` },
              { label: `${t("orders.history")} (${historyOrders.length})` },
            ]}
            selectedIndex={selectedTab === "active" ? 0 : 1}
            onChange={handleTabChange}
          />
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-error-container p-4 mb-4 rounded-lg">
            <Text className="text-base font-body text-on-error-container">{error}</Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && displayedOrders.length === 0 ? (
          <LoadingView className="py-20" />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="primary" />
            }
          >
            {/* Active Orders */}
            {selectedTab === "active" && (
              <>
                {activeOrders.length > 0 ? (
                  activeOrders.map((order) => (
                    <ActiveOrderCard key={order.id} order={order} onCancel={cancelOrder} />
                  ))
                ) : (
                  <EmptyState type="active" />
                )}
              </>
            )}

            {/* History Orders */}
            {selectedTab === "history" && (
              <>
                {historyOrders.length > 0 ? (
                  historyOrders.map((order) => <HistoryItem key={order.id} order={order} />)
                ) : (
                  <EmptyState type="history" />
                )}
              </>
            )}
          </ScrollView>
        )}
      </ScreenContent>
    </Screen>
  );
}
