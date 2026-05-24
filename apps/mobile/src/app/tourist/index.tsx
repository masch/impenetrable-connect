import { useState, useEffect } from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "../../components/Icon";
import { useTranslations } from "../../hooks/useI18n";
import { useCartStore } from "../../stores/cart.store";
import { createHourMinute } from "@repo/shared";
import { useReservationStore } from "../../stores/reservation.store";
import { useProjectStore } from "../../stores/project.store";
import {
  SERVICE_MOMENTS,
  getMomentConfig,
  getDefaultTimeForMoment,
  isMomentExpired,
} from "../../constants/moments";
import { DatePicker } from "../../components/DatePicker";
import { Button } from "../../components/Button";
import { AppDateTimePicker } from "../../components/AppDateTimePicker";
import LoadingView from "../../components/LoadingView";
import { COLORS, ICON_SIZES, FONT_SIZES, ServiceMoment, Order } from "@repo/shared";
import { isSameDay, formatDateToTime, parseTimeToDate } from "../../logic/formatters";
import { isTimeInRange, isTimeInPast } from "../../hooks/useTimeValidation";
import Screen, { ScreenContent } from "../../components/Screen";

export default function OrderSetupScreen() {
  const { push, back } = useRouter();
  const { t } = useTranslations();
  const { projects, selectedProject, isLoading, error, fetchProjects, selectProject } =
    useProjectStore();
  const {
    setContext,
    selectedDate,
    selectedMoment,
    selectedTime,
    guestCount,
    setGuestCount,
    setSelectedTime,
  } = useCartStore();
  const { activeOrders, moveOrders } = useReservationStore();

  const [date, setDate] = useState<Date | null>(selectedDate || null);
  const [moment, setMoment] = useState<ServiceMoment | null>(selectedMoment);
  const [time, setTime] = useState<Date | null>(
    selectedTime ? parseTimeToDate(selectedTime) : null,
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProject && !isLoading && !error) {
      if (projects.length === 0) {
        fetchProjects();
      } else {
        // Auto-select the first active project if none selected
        const firstActive = projects.find((p) => p.zzz_is_active);
        if (firstActive) {
          selectProject(firstActive.zzz_id);
        }
      }
    }
  }, [selectedProject, projects, isLoading, error, fetchProjects, selectProject]);

  if (isLoading || (!selectedProject && !error)) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ScreenContent className="items-center justify-center p-6">
          <Icon name="alert-circle-outline" size={ICON_SIZES.MASSIVE} color={COLORS.error} />
          <Text className="text-xl font-display font-bold text-on-surface mt-4 text-center">
            {error ? t("common.error") : t("errors.no_project_found")}
          </Text>
          {error && (
            <Text className="text-sm font-body text-on-surface-variant mt-2 text-center">
              {error}
            </Text>
          )}
          <Button
            title={error ? t("common.retry") : t("common.back")}
            onPress={() => (error ? fetchProjects() : back())}
            variant={error ? "primary" : "ghost"}
            className="mt-6 w-full"
          />
        </ScreenContent>
      </Screen>
    );
  }

  const handleMomentChange = (newMoment: ServiceMoment) => {
    setMoment(newMoment);
    // Reset time when moment changes
    setTime(null);
    setSelectedTime(undefined);
    setTimeError(null);
  };

  const handleTimeChange = (event: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      const timeStr = createHourMinute(formatDateToTime(selectedDate));
      setTime(selectedDate);
      setSelectedTime(timeStr);

      // Validate time against moment range
      if (moment) {
        const validation = isTimeInRange(timeStr, moment);
        if (!validation.valid) {
          const config = getMomentConfig(moment);
          setTimeError(
            t("order_setup.time_error_outside_range", {
              start: config.startTime,
              end: config.endTime,
            }),
          );
        } else if (isTimeInPast(date, selectedDate)) {
          setTimeError(t("order_setup.time_error_past"));
        } else {
          setTimeError(null);
        }
      } else {
        setTimeError(null);
      }
    }
  };

  const handleTimePickerClose = () => {
    setShowTimePicker(false);
  };

  const getMomentTimeRange = (): string => {
    if (!moment) return "";
    const config = getMomentConfig(moment);
    return `${config.startTime} - ${config.endTime}`;
  };

  const handleProceed = async () => {
    if (!date || !moment) return;
    // Prevent proceeding if time is outside valid range
    if (timeError) return;

    // Prevent proceeding if selected time is in the past (only for today)
    if (time && isTimeInPast(date, time)) {
      setTimeError(t("order_setup.time_error_past"));
      return;
    }

    // Detect if we need to move existing items to a new context
    const hasContextChanged =
      (selectedDate && !isSameDay(date, selectedDate)) ||
      (selectedMoment && moment !== selectedMoment);

    if (hasContextChanged && selectedDate && selectedMoment) {
      // Find orders in the PREVIOUS context to move them
      const itemsToMove = activeOrders.filter((o: Order) => {
        const oDate = new Date(o.zzz_reservation?.zzz_service_at || 0);
        const isSameDayResult = isSameDay(oDate, selectedDate);
        const isSameMoment = o.zzz_reservation?.zzz_time_of_day === selectedMoment;

        return isSameDayResult && isSameMoment;
      });

      if (itemsToMove.length > 0) {
        await moveOrders(
          itemsToMove.map((o: Order) => o.zzz_id),
          date,
          moment,
        );
      }
    }

    setContext(date, moment, selectedTime);
    push("/tourist/booking");
  };

  return (
    <Screen>
      <ScreenContent>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View className="px-2 pt-6 pb-4">
            <Text className="text-3xl font-display font-bold text-on-surface">
              {t("order_setup.title")}
            </Text>
            <Text className="text-sm font-body text-on-surface/50 mt-1">
              {t("order_setup.subtitle")}
            </Text>
          </View>

          {/* Date Selection */}
          <View className="px-2 mb-6">
            <View className="flex-row items-center mb-4">
              <Icon name="calendar-clock" size={ICON_SIZES.LARGE} color={COLORS.primary} />
              <Text className="text-lg font-display font-bold text-on-surface ml-2">
                {t("order_setup.date_label")}
              </Text>
            </View>
            <DatePicker
              value={date}
              onChange={setDate}
              accessibilityLabel={t("order_setup.date_label")}
              accessibilityHint={t("accessibility.date_picker_hint")}
            />
          </View>

          {/* Guest Count Selection */}
          <View className="px-2 mb-6">
            <View className="flex-row items-center mb-4">
              <Icon name="account-group-outline" size={ICON_SIZES.LARGE} color={COLORS.primary} />
              <Text className="text-lg font-display font-bold text-on-surface ml-2">
                {t("order_setup.guests_label")}
              </Text>
            </View>

            <View className="bg-surface-container-low/30 border border-outline-variant/20 rounded-3xl p-6 flex-row items-center justify-between">
              <Button
                variant="ghost"
                testID="guest-minus-button"
                onPress={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="size-14 rounded-2xl bg-surface-container-high items-center justify-center border border-outline-variant/10"
                accessibilityLabel={t("accessibility.decrement_guests")}
                accessibilityHint={t("accessibility.decrement_guests_hint")}
              >
                <Icon name="minus" size={ICON_SIZES.XXLARGE} color={COLORS.primary} />
              </Button>

              <View className="items-center">
                <Text className="text-4xl font-display font-bold text-on-surface">
                  {guestCount}
                </Text>
                <Text
                  className={`${FONT_SIZES.DAY_NUM} font-display font-bold text-on-surface-variant uppercase tracking-widest mt-1`}
                >
                  {t("common.pax")}
                </Text>
              </View>

              <Button
                variant="ghost"
                testID="guest-plus-button"
                onPress={() => setGuestCount(guestCount + 1)}
                className="size-14 rounded-2xl bg-surface-container-high items-center justify-center border border-outline-variant/10"
                accessibilityLabel={t("accessibility.increment_guests")}
                accessibilityHint={t("accessibility.increment_guests_hint")}
              >
                <Icon name="plus" size={ICON_SIZES.XXLARGE} color={COLORS.primary} />
              </Button>
            </View>
          </View>

          {/* Moment Selection */}
          <View className="px-2 mb-8">
            <View className="flex-row items-center mb-4">
              <Icon name="clock-outline" size={ICON_SIZES.LARGE} color={COLORS.primary} />
              <Text className="text-lg font-display font-bold text-on-surface ml-2">
                {t("order_setup.moment_label")}
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-4">
              {SERVICE_MOMENTS.map((m) => {
                const isSelected = moment === m.zzz_id;
                const expired = isMomentExpired(m.zzz_id, date);
                const label = t(m.labelKey);
                return (
                  <Button
                    key={m.zzz_id}
                    variant="ghost"
                    onPress={() => {
                      if (!expired) handleMomentChange(m.zzz_id);
                    }}
                    disabled={expired}
                    accessibilityLabel={`${label}${expired ? `, ${t("common.unavailable")}` : ""}${isSelected ? `, ${t("common.selected")}` : ""}`}
                    accessibilityHint={
                      expired
                        ? t("accessibility.moment_expired_hint")
                        : t("accessibility.moment_selection_hint")
                    }
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected, disabled: expired }}
                    className={`w-[48%] items-center justify-center p-5 border rounded-3xl transition-all ${
                      expired
                        ? "bg-surface-container-low/10 border-outline-variant/10 opacity-30"
                        : isSelected
                          ? `shadow-lg border-${m.color} ${m.bgClass}/15`
                          : "bg-surface-container-low/30 border-outline-variant/20"
                    }`}
                  >
                    <View className="items-center justify-center mb-3">
                      <Icon
                        name={m.icon}
                        size={ICON_SIZES.HUGE}
                        color={
                          expired
                            ? COLORS["on-surface-variant"]
                            : isSelected
                              ? m.hex
                              : COLORS["on-surface-variant"]
                        }
                        className={!isSelected || expired ? "opacity-40" : ""}
                      />
                    </View>
                    <Text
                      className={`text-lg font-display transition-colors ${
                        isSelected && !expired
                          ? "text-on-surface font-bold"
                          : "text-on-surface-variant font-medium opacity-60"
                      }`}
                    >
                      {label}
                    </Text>

                    {expired && (
                      <Text className="text-[10px] font-display-bold text-on-surface-variant uppercase tracking-wider mt-1">
                        {t("common.expired")}
                      </Text>
                    )}

                    {isSelected && !expired && (
                      <View
                        className={`absolute top-3 right-3 size-5 rounded-full items-center justify-center ${m.bgClass}`}
                      >
                        <Icon name="check" size={ICON_SIZES.XSMALL} color={COLORS["on-primary"]} />
                      </View>
                    )}
                  </Button>
                );
              })}
            </View>

            {/* Time Picker - Show when a moment is selected */}
            {moment && (
              <View className="mt-4">
                <View className="flex-row items-center mb-3">
                  <Icon name="clock-edit-outline" size={ICON_SIZES.LARGE} color={COLORS.primary} />
                  <Text className="text-base font-display font-bold text-on-surface ml-2">
                    {t("order_setup.time_label")}
                  </Text>
                  <Text className="text-sm text-on-surface-variant ml-2">
                    ({getMomentTimeRange()})
                  </Text>
                </View>

                <Button
                  variant={time ? "secondary" : "outline"}
                  onPress={() => {
                    // Don't auto-select - user must explicitly pick a time
                    setShowTimePicker(true);
                  }}
                  title={time ? formatDateToTime(time) : t("order_setup.select_time")}
                  leftIcon={time ? "clock-check-outline" : "clock-outline"}
                  className="w-full"
                />

                {timeError && (
                  <View className="flex-row items-center mt-2">
                    <Icon name="alert-circle" size={ICON_SIZES.SMALL} color={COLORS.error} />
                    <Text className="text-sm text-error ml-1">{timeError}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Time Picker - Native component or web fallback */}
            {showTimePicker && moment && (
              <View className="mt-4">
                {Platform.OS === "web" ? (
                  /* Web fallback: Simple time selector */
                  <View className="bg-surface-container-low/30 border border-outline-variant/20 rounded-3xl p-4">
                    <Text className="text-sm font-display text-on-surface-variant mb-3">
                      {t("order_setup.select_time")}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {(() => {
                        const config = getMomentConfig(moment);
                        const [startHour] = config.startTime.split(":").map(Number);
                        const [endHour] = config.endTime.split(":").map(Number);
                        const hours = [];
                        const MINUTES_PER_HOUR = 60;
                        const SLOT_INTERVAL_MINUTES = 30;
                        for (let h = startHour; h < endHour; h++) {
                          for (let m = 0; m < MINUTES_PER_HOUR; m += SLOT_INTERVAL_MINUTES) {
                            hours.push(
                              `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
                            );
                          }
                        }
                        return hours.map((h) => (
                          <Button
                            key={h}
                            variant={selectedTime === h ? "secondary" : "outline"}
                            title={h}
                            onPress={() => {
                              const date = new Date();
                              const [hours, mins] = h.split(":").map(Number);
                              date.setHours(hours, mins, 0, 0);
                              setTime(date);
                              setSelectedTime(createHourMinute(h));
                              const validation = isTimeInRange(h, moment);
                              if (!validation.valid) {
                                setTimeError(
                                  t("order_setup.time_error_outside_range", {
                                    start: config.startTime,
                                    end: config.endTime,
                                  }),
                                );
                              } else {
                                setTimeError(null);
                              }
                              setShowTimePicker(false);
                            }}
                            className="px-4 py-2"
                          />
                        ));
                      })()}
                    </View>
                  </View>
                ) : (
                  /* Native picker for iOS/Android */
                  <>
                    <AppDateTimePicker
                      value={time || getDefaultTimeForMoment(moment!)}
                      onChange={handleTimeChange}
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                    />
                    {Platform.OS === "ios" && (
                      <Button
                        variant="ghost"
                        title={t("common.done")}
                        onPress={handleTimePickerClose}
                        className="mt-2"
                      />
                    )}
                  </>
                )}
              </View>
            )}
          </View>

          {/* Action Button */}
          <View className="px-2">
            <Button
              variant="primary"
              title={t("order_setup.submit")}
              onPress={handleProceed}
              disabled={!date || !moment || !time || !!timeError}
              rightIcon="arrow-right"
              className="py-5 rounded-2xl shadow-lg"
              accessibilityLabel={t("order_setup.submit")}
              accessibilityHint={t("accessibility.submit_order_hint")}
            />
          </View>
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}
