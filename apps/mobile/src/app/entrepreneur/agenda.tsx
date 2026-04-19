import { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { Button } from "../../components/Button";
import Screen, { ScreenContent } from "../../components/Screen";
import LoadingView from "../../components/LoadingView";
import { useTranslations } from "../../hooks/useI18n";
import { useAgendaStore } from "../../stores/agenda.store";
import ReservationCard from "../../components/entrepreneur/ReservationCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { getMomentColor, getMomentIcon } from "../../constants/moments";
import { COLORS } from "@repo/shared";

const MOMENTS = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const;

export default function AgendaScreen() {
  const { t, locale } = useTranslations();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { orders, isLoading, fetchAgenda } = useAgendaStore();

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
              const isToday = new Date().toDateString() === date.toDateString();
              const isTomorrow =
                new Date(Date.now() + 86400000).toDateString() === date.toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();

              const weekdayLabel = isToday
                ? t("orders.today")
                : isTomorrow
                  ? t("orders.tomorrow")
                  : date.toLocaleDateString(locale, { weekday: "short" });

              return (
                <Button
                  key={date.toISOString()}
                  onPress={() => setSelectedDate(date)}
                  className={`mr-3 w-[58px] h-[82px] rounded-3xl border items-center justify-center ${
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
                          {date.getDate()}
                        </Text>
                      </>
                    )}
                  </View>

                  {isToday && !isSelected && (
                    <View className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-secondary" />
                  )}
                </Button>
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
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            locale={locale === "es" ? "es-AR" : "en-US"}
          />
        )}
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
                <Text className="text-secondary font-body-medium text-xs mt-0.5">
                  {selectedDate.toLocaleDateString(locale, { month: "long", year: "numeric" })}
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
              const momentOrders = orders.filter((o) => o.reservation?.time_of_day === moment);
              if (momentOrders.length === 0) return null;

              const momentColor = getMomentColor(moment);
              const momentIcon = getMomentIcon(moment);

              return (
                <View key={moment} className="mb-4">
                  <View className="flex-row items-center mb-3.5 px-1">
                    <View
                      className="p-2 rounded-xl mr-3"
                      style={{ backgroundColor: `${momentColor}15` }}
                    >
                      <MaterialCommunityIcons
                        name={momentIcon as keyof typeof MaterialCommunityIcons.glyphMap}
                        size={18}
                        color={momentColor}
                      />
                    </View>
                    <Text
                      className="font-display-black text-[14px] uppercase tracking-[1.5px]"
                      style={{ color: momentColor }}
                    >
                      {(() => {
                        const momentMap: Record<string, string> = {
                          BREAKFAST: "catalog.reservation.moments.breakfast",
                          LUNCH: "catalog.reservation.moments.lunch",
                          SNACK: "catalog.reservation.moments.snack",
                          DINNER: "catalog.reservation.moments.dinner",
                        };
                        return t(momentMap[moment] || "catalog.reservation.moments.lunch");
                      })()}
                    </Text>
                    <View
                      className="h-[0.8px] flex-1 ml-4 opacity-20"
                      style={{ backgroundColor: momentColor }}
                    />
                  </View>
                  <View className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
                    {momentOrders.map((order, index) => (
                      <View key={order.id}>
                        <ReservationCard order={order} hideBorder hideShadow />
                        {index < momentOrders.length - 1 && (
                          <View
                            className="h-[1px] mx-2"
                            style={{ backgroundColor: `${momentColor}40` }}
                          />
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
