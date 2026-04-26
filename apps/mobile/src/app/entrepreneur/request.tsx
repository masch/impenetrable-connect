import { useEffect } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import Screen, { ScreenContent } from "../../components/Screen";
import LoadingView from "../../components/LoadingView";
import { useTranslations } from "../../hooks/useI18n";
import { useAgendaStore } from "../../stores/agenda.store";
import ReservationCard from "../../components/entrepreneur/ReservationCard";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { COLORS } from "@repo/shared";
import {
  formatDate,
  toISODate,
  formatMoment,
  getRelativeDateLabel,
  parseISODate,
} from "../../logic/formatters";
import { getMomentConfig, MOMENTS } from "../../constants/moments";

export default function RequestScreen() {
  const { t } = useTranslations();
  const { pendingOrders, isLoadingPending, fetchPendingOrders, acceptOrder, declineOrder } =
    useAgendaStore();

  useEffect(() => {
    fetchPendingOrders();
  }, [fetchPendingOrders]);

  const onRefresh = () => fetchPendingOrders();

  // Grouping logic
  const groupedOrders = pendingOrders.reduce(
    (acc, order) => {
      const dateKey = order.zzz_reservation?.zzz_service_date
        ? toISODate(new Date(order.zzz_reservation.zzz_service_date))
        : "no_date";

      if (!acc[dateKey]) acc[dateKey] = {};

      const momentKey = order.zzz_reservation?.zzz_time_of_day || "OTHER";
      if (!acc[dateKey][momentKey]) acc[dateKey][momentKey] = [];

      acc[dateKey][momentKey].push(order);
      return acc;
    },
    {} as Record<string, Record<string, typeof pendingOrders>>,
  );

  const sortedDates = Object.keys(groupedOrders).sort();

  return (
    <Screen>
      <ScreenContent>
        <View className="px-4 pt-6 pb-2">
          <Text className="text-foreground font-display-black text-3xl tracking-tighter">
            {t("orders.status.offer_pending")}
          </Text>
          <Text className="text-on-surface-variant font-body-medium text-sm mt-1">
            {pendingOrders.length > 0
              ? t("orders.pending_requests_count", { count: pendingOrders.length })
              : t("orders.no_pending_requests")}
          </Text>
        </View>

        {isLoadingPending && pendingOrders.length === 0 ? (
          <LoadingView className="py-20" />
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="pt-4 pb-10"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingPending}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
              />
            }
          >
            {sortedDates.length > 0 ? (
              sortedDates.map((dateKey) => (
                <View key={dateKey} className="mb-12">
                  {/* Date Header Banner - High Visibility Ribbon */}
                  <View
                    className="flex-row items-center py-6 px-8 mb-10 -mx-4 border-y border-primary/20 relative overflow-hidden"
                    style={{ backgroundColor: COLORS.primary + "14" }}
                  >
                    {/* Vertical Accent Bar */}
                    <View
                      className="absolute left-0 top-0 bottom-0 w-1.5"
                      style={{ backgroundColor: COLORS.primary }}
                    />

                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center mr-5 shadow-lg shadow-primary/20"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      <MaterialCommunityIcons
                        name="calendar-multiselect"
                        size={24}
                        color={COLORS["on-primary"]}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-on-surface font-display-black text-2xl uppercase tracking-tighter leading-none mb-1">
                        {dateKey === "no_date"
                          ? t("common.no_date")
                          : getRelativeDateLabel(parseISODate(dateKey), t)}
                      </Text>
                      {dateKey !== "no_date" && (
                        <Text className="text-on-surface-variant font-display-bold text-xs uppercase tracking-[3px] opacity-50">
                          {formatDate(parseISODate(dateKey), {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                          })}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Moments in that Date */}
                  {MOMENTS.map((moment) => {
                    const momentOrders = groupedOrders[dateKey][moment];
                    if (!momentOrders || momentOrders.length === 0) return null;

                    const config = getMomentConfig(moment);

                    return (
                      <View key={moment} className="mb-6 px-4">
                        <View className="flex-row items-center mb-3">
                          <View className={`p-1.5 rounded-lg mr-2.5 ${config.bgClass}/10`}>
                            <MaterialCommunityIcons
                              name={config.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                              size={16}
                              color={config.hex}
                            />
                          </View>
                          <Text
                            className={`font-display-bold text-xs uppercase tracking-widest ${config.textClass}`}
                          >
                            {formatMoment(moment, t)}
                          </Text>
                          <View className={`h-[1px] flex-1 ml-3 opacity-10 ${config.bgClass}`} />
                        </View>

                        <View className="bg-surface-container-lowest/50 rounded-3xl border border-outline-variant/10 overflow-hidden">
                          {momentOrders.map((order, idx) => (
                            <View key={order.zzz_id}>
                              <ReservationCard
                                order={order}
                                role="entrepreneur"
                                hideBorder
                                hideShadow
                                hideStatus
                                onAccept={() => acceptOrder(Number(order.zzz_id))}
                                onDecline={() => declineOrder(Number(order.zzz_id))}
                              />
                              {idx < momentOrders.length - 1 && (
                                <View className="h-[1px] mx-4 bg-outline-variant/10" />
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))
            ) : (
              <View className="items-center justify-center py-20 px-10">
                <View className="w-20 h-20 rounded-full bg-secondary/10 items-center justify-center mb-6">
                  <MaterialCommunityIcons
                    name="tray-full"
                    size={40}
                    color={COLORS.secondary}
                    style={{ opacity: 0.5 }}
                  />
                </View>
                <Text className="text-on-surface font-display-bold text-xl text-center mb-2">
                  {t("orders.empty_inbox_title")}
                </Text>
                <Text className="text-on-surface-variant font-body-medium text-center">
                  {t("orders.empty_inbox_desc")}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </ScreenContent>
    </Screen>
  );
}
