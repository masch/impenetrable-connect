import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import Screen, { ScreenContent } from "../../components/Screen";
import LoadingView from "../../components/LoadingView";
import { useTranslations } from "../../hooks/useI18n";
import { useAgendaStore } from "../../stores/agenda.store";
import ReservationCard from "../../components/entrepreneur/ReservationCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { getTimeOfDayColor, getTimeOfDayIcon } from "../../constants/moments";
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

  // Helper to render date selector
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
              const isToday = new Date().toDateString() === date.toDateString();
              const isTomorrow =
                new Date(Date.now() + 86400000).toDateString() === date.toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();

              let dateLabel = date.toLocaleDateString(locale, { weekday: "short" });
              if (isToday) dateLabel = t("order_setup.today");
              else if (isTomorrow) dateLabel = t("order_setup.tomorrow");

              // Capitalize first letter (e.g. "Mañana", "Lun")
              dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1).toLowerCase();
              if (dateLabel.length > 3 && !isToday && !isTomorrow) {
                dateLabel = dateLabel.substring(0, 3);
              }

              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  onPress={() => setSelectedDate(date)}
                  className={`mr-3 items-center pt-3.5 w-16 h-22 rounded-full border ${
                    isSelected
                      ? "bg-primary border-primary shadow-lg"
                      : "bg-surface-container-lowest border-outline-variant/30"
                  }`}
                >
                  <Text
                    className={`font-display-bold text-[11px] mb-2 ${isSelected ? "text-white" : "text-on-surface-variant"}`}
                    numberOfLines={1}
                  >
                    {dateLabel}
                  </Text>
                  <View
                    className={`w-10 h-10 items-center justify-center rounded-full ${isSelected ? "bg-white/20" : "bg-surface-container-low"}`}
                  >
                    <Text
                      className={`font-display-black text-lg ${isSelected ? "text-white" : "text-on-surface"}`}
                    >
                      {date.getDate()}
                    </Text>
                  </View>
                  {isToday && !isSelected && (
                    <View className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                  {isSelected && <View className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/60" />}
                </TouchableOpacity>
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
            className="flex-1 px-5"
            contentContainerStyle={{ paddingTop: 10, paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: COLORS["surface-container-low"] }}
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
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-surface-container-high p-2.5 rounded-xl border border-outline-variant/30"
              >
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {renderDateSelector()}

            {MOMENTS.map((moment) => {
              const momentOrders = orders.filter((o) => o.time_of_day === moment);
              if (momentOrders.length === 0) return null;

              const momentColor = getTimeOfDayColor(moment);
              const momentIcon = getTimeOfDayIcon(moment);
              const momentKey = moment.toLowerCase();

              return (
                <View key={moment} className="mb-6">
                  <View className="flex-row items-center mb-3.5 px-1">
                    <View
                      className="p-2 rounded-xl mr-3"
                      style={{ backgroundColor: `${momentColor}15` }}
                    >
                      <MaterialCommunityIcons
                        name={
                          momentIcon as React.ComponentProps<typeof MaterialCommunityIcons>["name"]
                        }
                        size={18}
                        color={momentColor}
                      />
                    </View>
                    <Text
                      className="font-display-black text-[14px] uppercase tracking-[1.5px]"
                      style={{ color: momentColor }}
                    >
                      {t(`agenda.moments.${momentKey}`)}
                    </Text>
                    <View
                      className="h-[0.8px] flex-1 ml-4 opacity-20"
                      style={{ backgroundColor: momentColor }}
                    />
                  </View>
                  <View className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
                    {momentOrders.map((order, index) => (
                      <View key={order.id}>
                        <ReservationCard
                          order={order}
                          hideBorder
                          hideShadow
                          isFirst={index === 0}
                          accentColorOverride={momentColor}
                        />
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
