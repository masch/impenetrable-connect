/**
 * Tourist Orders Screen
 * Displays active and historical orders with status badges.
 */

import { useEffect, useCallback, useState, type ComponentProps } from "react";
import { useRouter } from "expo-router";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../../hooks/useI18n";
import Screen, { ScreenContent } from "../../components/Screen";
import LoadingView from "../../components/LoadingView";
import { AppAlert } from "../../components/AppAlert";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { useReservationStore } from "../../stores/reservation.store";
import { useAuthStore } from "../../stores/auth.store";
import { useCatalogStore } from "../../stores/catalog.store";
import { Button } from "../../components/Button";
import { getMomentIcon, getMomentColor } from "../../constants/moments";
import { type Order, type OrderStatus, COLORS } from "@repo/shared";

// Status badge mapping - labels come from i18n
const getStatusConfig = (
  t: (key: string) => string,
): Record<OrderStatus, { label: string; bgClass: string; textClass: string }> => ({
  SEARCHING: {
    label: t("orders.status.searching"),
    bgClass: "bg-[#EAB308]/20",
    textClass: "text-[#854D0E]",
  },
  WAITING_FOR_OFFER: {
    label: t("orders.status.waiting_for_offer"),
    bgClass: "bg-primary-container",
    textClass: "text-on-primary-fixed",
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

// Format service moment for display using i18n
function formatMoment(moment: string, t: (key: string) => string): string {
  const keyMap: Record<string, string> = {
    BREAKFAST: "breakfast",
    LUNCH: "lunch",
    SNACK: "snack",
    DINNER: "dinner",
  };
  const key = keyMap[moment] || moment.toLowerCase();
  return t(`catalog.reservation.moments.${key}`);
}

// Format date for display
function formatDate(date: Date, locale: string): string {
  // Use locale mapping for Intl.DateTimeFormat (es-AR, en-US, etc.)
  const localeMap: Record<string, string> = {
    es: "es-AR",
    en: "en-US",
  };
  const fullLocale = localeMap[locale] || "es-AR";
  return date.toLocaleDateString(fullLocale, {
    day: "numeric",
    month: "short",
  });
}

// Active Order Card Component
interface ActiveOrderCardProps {
  order: Order;
  onCancel: (orderId: number) => void;
  onShowAlert: (config: Omit<ComponentProps<typeof AppAlert>, "onClose">) => void;
}

function ActiveOrderCard({ order, onCancel, onShowAlert }: ActiveOrderCardProps) {
  const { t, locale, getLocalizedName } = useTranslations();
  const statusConfig = getStatusConfig(t);
  const status = statusConfig[order.global_status];
  const showCancelButton = order.global_status === "SEARCHING";
  const services = useCatalogStore((state) => state.services);

  // Helper to get relative date label
  const getRelativeDateLabel = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === today.getTime()) return t("orders.today");
    if (checkDate.getTime() === tomorrow.getTime()) return t("orders.tomorrow");
    return formatDate(date, locale);
  };

  return (
    <View className="bg-surface-container-lowest rounded-xl p-4 mb-4 shadow-sm">
      {/* Top Row: Status and Date/Moment */}
      <View className="flex-row items-center justify-between mb-4">
        <View className={`px-3 py-1 rounded-md ${status.bgClass}`}>
          <Text className={`text-[10px] font-black tracking-widest uppercase ${status.textClass}`}>
            {status.label}
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <MaterialCommunityIcons
              name="calendar"
              size={14}
              color={COLORS["on-surface-variant"]}
              className="opacity-60"
            />
            <Text className="text-sm font-bold text-on-surface opacity-80">
              {getRelativeDateLabel(order.service_date)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <MaterialCommunityIcons
              name={
                getMomentIcon(order.time_of_day) as keyof typeof MaterialCommunityIcons.glyphMap
              }
              size={14}
              color={getMomentColor(order.time_of_day)}
            />
            <Text className={`text-sm font-bold moment-${order.time_of_day.toLowerCase()}`}>
              {formatMoment(order.time_of_day, t)}
            </Text>
          </View>
        </View>
      </View>

      {/* Items List (Premium Style) */}
      <View className="mb-2">
        {order.items && order.items.length > 0 ? (
          order.items.map((item, idx) => {
            const service = services.find((s) => Number(s.id) === Number(item.catalog_item_id));
            const name = service
              ? getLocalizedName(service.name_i18n)
              : `${t("orders.itemNumber")}${item.catalog_item_id}`;
            return (
              <View
                key={item.id}
                className={`flex-row items-center justify-between py-3 ${
                  idx < order.items.length - 1 ? "border-b border-outline-variant/10" : ""
                }`}
              >
                <Text className="flex-1 text-base font-body text-on-surface">{name}</Text>
                <View className="flex-row items-center">
                  <View className="bg-surface-container-high px-2 py-0.5 rounded-lg mr-3">
                    <Text className="text-[11px] font-display font-black text-on-surface-variant uppercase tracking-tighter">
                      X{item.quantity}
                    </Text>
                  </View>
                  <Text className="text-base font-display font-bold text-on-surface">
                    ${" "}
                    {(item.price * item.quantity).toLocaleString(
                      locale === "es" ? "es-AR" : "en-US",
                    )}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text className="text-sm font-body text-on-surface opacity-40 py-2 italic">
            {t("orders.noItems")}
          </Text>
        )}
      </View>

      {/* Confirmation code (if confirmed) */}
      {order.global_status === "CONFIRMED" && order.confirmed_venture_id && (
        <View className="flex-row items-center gap-2 mt-2 mb-2">
          <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.secondary} />
          <Text className="text-sm font-body text-secondary font-bold">
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
            onShowAlert({
              visible: true,
              title: t("orders.cancel"),
              message: t("orders.cancelConfirm"),
              type: "alert",
              actions: [
                {
                  text: t("orders.keeping"),
                  style: "cancel",
                  onPress: () => {},
                },
                {
                  text: t("orders.confirmCancel"),
                  variant: "danger",
                  onPress: () => onCancel(order.id),
                },
              ],
            });
          }}
          disabled={order.global_status !== "SEARCHING"}
          className="mt-4"
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
  const { t, locale, getLocalizedName } = useTranslations();
  const statusConfig = getStatusConfig(t);
  const status = statusConfig[order.global_status];
  const services = useCatalogStore((state) => state.services);

  const getRelativeDateLabel = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === today.getTime()) return t("orders.today");
    if (checkDate.getTime() === tomorrow.getTime()) return t("orders.tomorrow");
    if (checkDate.getTime() === yesterday.getTime()) return t("orders.yesterday");
    return formatDate(date, locale);
  };

  return (
    <View className="bg-surface-container-lowest rounded-xl p-4 mb-3">
      {/* Header: Date and Moment */}
      <View className="flex-row items-center justify-between mb-3 border-b border-outline-variant/10 pb-2">
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="calendar"
            size={14}
            color={COLORS["on-surface-variant"]}
            className="opacity-60"
          />
          <Text className="text-sm font-bold text-on-surface opacity-80">
            {getRelativeDateLabel(order.service_date)}
          </Text>
          <View className="w-[1px] h-3 bg-outline-variant/30 mx-1" />
          <MaterialCommunityIcons
            name={getMomentIcon(order.time_of_day) as keyof typeof MaterialCommunityIcons.glyphMap}
            size={14}
            color={getMomentColor(order.time_of_day)}
          />
          <Text className={`text-sm font-bold moment-${order.time_of_day.toLowerCase()}`}>
            {formatMoment(order.time_of_day, t)}
          </Text>
        </View>

        <View className={`px-2 py-0.5 rounded ${status.bgClass}`}>
          <Text className={`text-[9px] font-black tracking-widest uppercase ${status.textClass}`}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Items List */}
      <View>
        {order.items && order.items.length > 0 ? (
          order.items.map((item, idx) => {
            const service = services.find((s) => Number(s.id) === Number(item.catalog_item_id));
            const name = service
              ? getLocalizedName(service.name_i18n)
              : `${t("orders.itemNumber")}${item.catalog_item_id}`;
            return (
              <View
                key={item.id}
                className={`flex-row items-center justify-between py-2 ${
                  idx < order.items.length - 1 ? "border-b border-outline-variant/5" : ""
                }`}
              >
                <Text className="flex-1 text-sm font-body text-on-surface opacity-90">{name}</Text>
                <View className="flex-row items-center">
                  <View className="bg-surface-container-high px-1.5 py-0.5 rounded mr-2">
                    <Text className="text-[10px] font-display font-black text-on-surface-variant uppercase">
                      X{item.quantity}
                    </Text>
                  </View>
                  <Text className="text-sm font-display font-bold text-on-surface">
                    ${" "}
                    {(item.price * item.quantity).toLocaleString(
                      locale === "es" ? "es-AR" : "en-US",
                    )}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text className="text-xs font-body text-on-surface opacity-40 italic">
            {t("orders.noItems")}
          </Text>
        )}
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
  } = useReservationStore();

  const fetchServices = useCatalogStore((state) => state.fetchServices);
  const services = useCatalogStore((state) => state.services);

  const currentUser = useAuthStore((state) => state.currentUser);
  const [refreshing, setRefreshing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<Omit<ComponentProps<typeof AppAlert>, "onClose">>({
    visible: false,
    title: "",
    message: "",
    actions: [],
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!currentUser) {
      router.replace("/tourist");
    }
  }, [currentUser, router]);

  // Fetch orders and services when user changes
  useEffect(() => {
    fetchOrders();
    if (services.length === 0) {
      fetchServices();
    }
  }, [currentUser?.id, fetchOrders, fetchServices, services.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const handleTabChange = (index: number) => {
    setTab(index === 0 ? "active" : "history");
  };

  const displayedOrders = selectedTab === "active" ? activeOrders : historyOrders;

  return (
    <Screen>
      <ScreenContent className="pb-20">
        <View className="py-6">
          <Text className="text-3xl font-display font-bold text-on-surface">
            {t("orders.title")}
          </Text>
        </View>

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

        {error && (
          <View className="bg-error-container p-4 mb-4 rounded-lg">
            <Text className="text-base font-body text-on-error-container">{error}</Text>
          </View>
        )}

        {isLoading && displayedOrders.length === 0 ? (
          <LoadingView className="py-20" />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
              />
            }
          >
            {selectedTab === "active" && (
              <>
                {activeOrders.length > 0 ? (
                  activeOrders.map((order) => (
                    <ActiveOrderCard
                      key={order.id}
                      order={order}
                      onCancel={cancelOrder}
                      onShowAlert={setAlertConfig}
                    />
                  ))
                ) : (
                  <EmptyState type="active" />
                )}
              </>
            )}

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
      <AppAlert
        {...alertConfig}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </Screen>
  );
}
