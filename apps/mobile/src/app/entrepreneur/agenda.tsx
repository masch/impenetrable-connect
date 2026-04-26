import { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { Button } from "../../components/Button";
import Screen, { ScreenContent } from "../../components/Screen";
import LoadingView from "../../components/LoadingView";
import { useTranslations } from "../../hooks/useI18n";
import { useAgendaStore } from "../../stores/agenda.store";
import { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import ReservationCard from "../../components/entrepreneur/ReservationCard";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getMomentConfig, MOMENTS } from "../../constants/moments";
import { COLORS } from "@repo/shared";
import { formatDate, isSameDay, toISODate, formatMoment } from "../../logic/formatters";
import { AppDateTimePicker } from "../../components/AppDateTimePicker";

export default function AgendaScreen() {
  const { t } = useTranslations();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { orders, isLoading, fetchAgenda, acceptOrder, declineOrder, getDayCount } =
    useAgendaStore();

  useEffect(() => {
    fetchAgenda(selectedDate);
  }, [selectedDate, fetchAgenda]);

  const onRefresh = () => fetchAgenda(selectedDate);

  const onDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const renderDateSelector = () => {
    const days = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return date;
    });

    return (
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row pb-2 px-1">
            {days.map((date) => {
              const today = new Date();
              const tomorrow = new Date();
              tomorrow.setDate(today.getDate() + 1);

              const isToday = isSameDay(date, today);
              const isTomorrow = isSameDay(date, tomorrow);
              const isSelected = isSameDay(date, selectedDate);
              const count = getDayCount(date);

              const weekdayLabel = isToday
                ? t("orders.today")
                : isTomorrow
                  ? t("orders.tomorrow")
                  : formatDate(date, { weekday: "short" });

              return (
                <View key={toISODate(date)} className="relative mr-3">
                  <Button
                    onPress={() => setSelectedDate(date)}
                    className={`w-[58px] h-[82px] rounded-3xl border items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary shadow-lg shadow-primary/30"
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
                            className={`font-display-bold text-[9px] uppercase tracking-tighter mb-1.5 ${
                              isSelected ? "text-white/70" : "text-on-surface-variant"
                            }`}
                          >
                            {weekdayLabel}
                          </Text>

                          <Text
                            className={`font-display-black text-xl ${
                              isSelected ? "text-white" : "text-on-surface"
                            }`}
                          >
                            {formatDate(date, { day: "numeric" })}
                          </Text>
                        </>
                      )}
                    </View>

                    {isToday && !isSelected && (
                      <View className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-secondary" />
                    )}
                  </Button>

                  {count > 0 && (
                    <View
                      className={`absolute top-1 right-1 min-w-[18px] h-4 px-1 rounded-md items-center justify-center border ${
                        isSelected ? "bg-white border-primary/20" : "bg-primary border-primary"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-display-black leading-none ${
                          isSelected ? "text-primary" : "text-white"
                        }`}
                        style={{ marginTop: -1 }}
                      >
                        {count}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <Screen>
      <ScreenContent>
        {showDatePicker && <AppDateTimePicker value={selectedDate} onChange={onDateChange} />}
        {isLoading && orders.length === 0 ? (
          <LoadingView className="py-20" />
        ) : (
          <ScrollView
            className="flex-1 px-2 bg-surface-container-low"
            contentContainerClassName="pt-[10px] pb-4"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
              />
            }
          >
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-foreground font-display-bold text-2xl tracking-tight">
                  {t("agenda.title")}
                </Text>
                <Text className="text-secondary font-body-medium text-xs mt-0.5 capitalize">
                  {formatDate(selectedDate, { month: "long", year: "numeric" })}
                </Text>
              </View>
              <Button
                onPress={() => setShowDatePicker(true)}
                variant="outline"
                className="bg-surface-container-high p-2.5 rounded-xl border border-outline-variant/30"
                rightIcon="calendar-month-outline"
                iconColor={COLORS.primary}
              />
            </View>

            {renderDateSelector()}

            {MOMENTS.map((moment) => {
              const momentOrders = orders.filter(
                (o) => o.zzz_reservation?.zzz_time_of_day === moment,
              );
              if (momentOrders.length === 0) return null;

              const config = getMomentConfig(moment);

              return (
                <View key={moment} className="mb-4">
                  <View className="flex-row items-center mb-3.5 px-1">
                    <View className={`p-2 rounded-xl mr-3 ${config.bgClass}/15`}>
                      <MaterialCommunityIcons
                        name={config.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                        size={18}
                        color={config.hex}
                      />
                    </View>
                    <Text
                      className={`font-display-black text-[14px] uppercase tracking-[1.5px] ${config.textClass}`}
                    >
                      {formatMoment(moment, t)}
                    </Text>
                    <View className={`h-[0.8px] flex-1 ml-4 opacity-20 ${config.bgClass}`} />
                  </View>
                  <View className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
                    {momentOrders.map((order, index) => (
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
                        {index < momentOrders.length - 1 && (
                          <View className={`h-[1px] mx-2 ${config.bgClass}/40`} />
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </ScreenContent>
    </Screen>
  );
}
