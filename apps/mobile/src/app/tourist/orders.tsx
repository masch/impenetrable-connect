/**
 * Tourist Orders Screen
 * Displays active and historical orders with status badges.
 */

import { useEffect, useCallback, useState, useMemo, type ComponentProps } from "react";
import { useRouter } from "expo-router";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { Button } from "../../components/Button";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../../hooks/useI18n";
import Screen, { ScreenContent } from "../../components/Screen";
import LoadingView from "../../components/LoadingView";
import { AppAlert } from "../../components/AppAlert";
import { useReservationStore } from "../../stores/reservation.store";
import { useAuthStore } from "../../stores/auth.store";
import { useCatalogStore } from "../../stores/catalog.store";
import { getMomentConfig } from "../../constants/moments";
import { type Order, type ServiceMoment, COLORS } from "@repo/shared";
import {
  formatDate,
  isSameDay,
  toISODate,
  formatMoment,
  extractTimeFromISO,
} from "../../logic/formatters";
import { formatMomentTimeRange } from "../../constants/moments";
import ReservationCard from "../../components/entrepreneur/ReservationCard";

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
  const { replace } = useRouter();
  const { t } = useTranslations();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { activeOrders, historyOrders, isLoading, error, fetchOrders, cancelOrder } =
    useReservationStore();

  const allOrders = [...activeOrders, ...historyOrders];

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
      replace("/tourist");
    }
  }, [currentUser, replace]);

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

  // Filter orders based on selected date
  const filteredOrders = allOrders.filter((o) => {
    if (!o.zzz_reservation?.zzz_service_at) return false;
    const orderDate = new Date(o.zzz_reservation.zzz_service_at);
    return isSameDay(orderDate, selectedDate);
  });

  // Group orders by date -> moment -> time
  const groupedOrders: Array<
    [string, Array<{ moment: string; times: Array<{ time: string; orders: Order[] }> }>]
  > = useMemo(() => {
    const groups: Record<string, Record<string, Record<string, Order[]>>> = {};

    filteredOrders.forEach((order) => {
      const date = new Date(order.zzz_reservation?.zzz_service_at || new Date());
      const dateStr = toISODate(date);

      if (!groups[dateStr]) groups[dateStr] = {};

      const moment = order.zzz_reservation?.zzz_time_of_day || "";
      const time = order.zzz_reservation?.zzz_service_at
        ? extractTimeFromISO(order.zzz_reservation.zzz_service_at)
        : "";

      if (!groups[dateStr][moment]) groups[dateStr][moment] = {};
      if (!groups[dateStr][moment][time]) groups[dateStr][moment][time] = [];
      groups[dateStr][moment][time].push(order);
    });

    // Convert to sorted array: date -> moment -> time
    const result = Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, momentGroups]) => {
        const momentList = Object.entries(momentGroups).map(([moment, timeGroups]) => {
          const timesList = Object.entries(timeGroups).map(([time, orders]) => ({
            time,
            orders,
          }));
          // Sort times
          timesList.sort((a, b) => a.time.localeCompare(b.time));
          return { moment, times: timesList };
        });
        return [dateStr, momentList] as [string, typeof momentList];
      });
    return result;
  }, [filteredOrders]);

  // Render horizontal date selector like the agenda
  const renderDateSelector = () => {
    const days = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return date;
    });

    return (
      <View className="mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row pb-2 px-1">
            {days.map((date) => {
              const today = new Date();
              const tomorrow = new Date();
              tomorrow.setDate(today.getDate() + 1);

              const isToday = isSameDay(date, today);
              const isTomorrow = isSameDay(date, tomorrow);
              const isSelected = isSameDay(date, selectedDate);

              const weekdayLabel = isToday
                ? t("orders.today")
                : isTomorrow
                  ? t("orders.tomorrow")
                  : formatDate(date, { weekday: "short" });

              return (
                <Button
                  key={toISODate(date)}
                  onPress={() => setSelectedDate(date)}
                  variant="ghost"
                  className="mr-3"
                  accessibilityLabel={
                    isToday
                      ? t("accessibility.select_today")
                      : isTomorrow
                        ? t("accessibility.select_tomorrow")
                        : t("accessibility.select_date", {
                            date: formatDate(date, { day: "numeric", month: "short" }),
                          })
                  }
                  accessibilityHint={t("accessibility.date_selection_hint")}
                >
                  <View
                    className={`w-[58px] h-[82px] rounded-3xl border items-center justify-center overflow-hidden ${
                      isSelected
                        ? "bg-primary border-primary shadow-lg"
                        : isToday
                          ? "bg-secondary/10 border-secondary/40"
                          : "bg-surface-container-lowest border-outline-variant/30"
                    }`}
                  >
                    <View className="items-center justify-center flex-1">
                      {isToday || isTomorrow ? (
                        <>
                          <View
                            className={`p-1.5 rounded-full mb-1 ${isSelected ? "bg-white/20" : isToday ? "bg-secondary/20" : "bg-primary/10"}`}
                          >
                            <MaterialCommunityIcons
                              name={isToday ? "star" : "calendar-arrow-right"}
                              size={22}
                              color={
                                isSelected
                                  ? COLORS["on-primary"]
                                  : isToday
                                    ? COLORS.secondary
                                    : COLORS.primary
                              }
                            />
                          </View>
                          <Text
                            className={`font-display-black text-[9px] uppercase tracking-[0.5px] ${
                              isSelected
                                ? "text-white"
                                : isToday
                                  ? "text-secondary"
                                  : "text-on-surface-variant"
                            }`}
                          >
                            {isToday ? t("common.today_short") : t("common.tomorrow_short")}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text
                            className={`font-display-black text-[12px] uppercase ${isSelected ? "text-white" : "text-on-surface-variant"}`}
                          >
                            {weekdayLabel}
                          </Text>
                          <Text
                            className={`font-display-black text-[20px] ${isSelected ? "text-white" : "text-on-surface"}`}
                          >
                            {date.getDate()}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </Button>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Resolve venture name from enriched order data
  const getVentureName = (order: Order) => {
    return order.zzz_confirmed_venture?.name;
  };

  return (
    <Screen>
      <ScreenContent>
        <View className="py-4">
          <Text className="text-foreground font-display-bold text-3xl tracking-tight">
            {t("orders.title")}
          </Text>
        </View>

        {renderDateSelector()}

        {error && (
          <View className="bg-error-container p-4 mb-4 rounded-lg">
            <Text className="text-base font-body text-on-error-container">{error}</Text>
          </View>
        )}

        {isLoading && filteredOrders.length === 0 ? (
          <LoadingView className="py-20" />
        ) : (
          <ScrollView
            className="flex-1 bg-surface-container-low rounded-t-3xl"
            contentContainerClassName="pt-6 pb-10 px-2"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
              />
            }
          >
            {filteredOrders.length > 0 ? (
              groupedOrders.map(
                ([dateStr, momentGroups]: [
                  string,
                  Array<{ moment: string; times: Array<{ time: string; orders: Order[] }> }>,
                ]) => (
                  <View key={dateStr} className="mb-8">
                    {/* Group by moment */}
                    {momentGroups.map(({ moment, times }) => {
                      const config = getMomentConfig(moment as ServiceMoment);

                      return (
                        <View key={moment} className="mb-6">
                          {/* Moment Header */}
                          <View className="flex-row items-center mb-4 px-2">
                            <View className={`p-1.5 rounded-lg mr-3 ${config.bgClass}/15`}>
                              <MaterialCommunityIcons
                                name={config.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                                size={18}
                                color={config.hex}
                              />
                            </View>
                            <Text className="font-display-bold text-lg text-on-surface">
                              {formatMoment(moment as ServiceMoment, t)}
                            </Text>
                          </View>

                          {/* Sub-group by time */}
                          {times.map(({ time, orders }) => {
                            const displayTime =
                              time || formatMomentTimeRange(moment as ServiceMoment);

                            return (
                              <View key={time} className="mb-3">
                                {/* Time Label - Prominent */}
                                {time ? (
                                  <View className="flex-row justify-center items-center mb-2">
                                    {(() => {
                                      const momentConf = getMomentConfig(moment as ServiceMoment);
                                      const momentColor = momentConf?.hex || COLORS.primary;
                                      return (
                                        <View
                                          className="flex-row items-center px-3 py-1.5 rounded-full gap-1.5"
                                          style={{ backgroundColor: momentColor }}
                                        >
                                          <MaterialCommunityIcons
                                            name="clock-outline"
                                            size={16}
                                            color="#FFFFFF"
                                          />
                                          <Text className="font-display-bold text-base text-white">
                                            {displayTime}
                                          </Text>
                                        </View>
                                      );
                                    })()}
                                  </View>
                                ) : (
                                  <View className="flex-row items-center mb-2 px-2">
                                    <Text className="font-display text-sm text-on-surface-variant">
                                      {displayTime}
                                    </Text>
                                  </View>
                                )}

                                {/* Orders for this time */}
                                {orders.map((order: Order) => (
                                  <View key={order.zzz_id}>
                                    <ReservationCard
                                      order={order}
                                      role="tourist"
                                      title={getVentureName(order)}
                                      hideBorder
                                      hideShadow
                                      onCancel={() => {
                                        setAlertConfig({
                                          visible: true,
                                          title: t("orders.rejectTitle"),
                                          message: t("orders.rejectConfirm"),
                                          actions: [
                                            {
                                              text: t("common.no"),
                                              style: "cancel",
                                              onPress: () => {},
                                            },
                                            {
                                              text: t("common.yes"),
                                              onPress: () => cancelOrder(order.zzz_id),
                                              style: "destructive",
                                            },
                                          ],
                                        });
                                      }}
                                    />
                                  </View>
                                ))}
                              </View>
                            );
                          })}
                        </View>
                      );
                    })}
                  </View>
                ),
              )
            ) : (
              <EmptyState type="active" />
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
