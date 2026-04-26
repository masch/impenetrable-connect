import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../../hooks/useI18n";
import { useCartStore } from "../../stores/cart.store";
import { useReservationStore } from "../../stores/reservation.store";
import { SERVICE_MOMENTS } from "../../constants/moments";
import { DatePicker } from "../../components/DatePicker";
import { Button } from "../../components/Button";
import { COLORS, ServiceMoment, Order } from "@repo/shared";
import { isSameDay } from "../../logic/formatters";
import Screen, { ScreenContent } from "../../components/Screen";

export default function OrderSetupScreen() {
  const router = useRouter();
  const { t } = useTranslations();
  const { setContext, selectedDate, selectedMoment } = useCartStore();
  const { activeOrders, moveOrders } = useReservationStore();

  const [date, setDate] = useState<Date | null>(selectedDate || null);
  const [moment, setMoment] = useState<ServiceMoment | null>(selectedMoment);

  const isValid = date !== null && moment !== null;

  const handleProceed = async () => {
    if (!isValid || !date || !moment) return;

    // Detect if we need to move existing items to a new context
    const hasContextChanged =
      (selectedDate && !isSameDay(date, selectedDate)) ||
      (selectedMoment && moment !== selectedMoment);

    if (hasContextChanged && selectedDate && selectedMoment) {
      // Find orders in the PREVIOUS context to move them
      const itemsToMove = activeOrders.filter((o: Order) => {
        const oDate = new Date(o.zzz_reservation?.zzz_service_date || 0);
        const isSameDayResult = isSameDay(oDate, selectedDate);
        const isSameMoment = o.zzz_reservation?.zzz_time_of_day === selectedMoment;

        return isSameDayResult && isSameMoment;
      });

      if (itemsToMove.length > 0) {
        await moveOrders(
          itemsToMove.map((o: Order) => Number(o.zzz_id)),
          date,
          moment,
        );
      }
    }

    setContext(date, moment);
    router.push("/tourist/booking");
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
              <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.primary} />
              <Text className="text-lg font-display font-bold text-on-surface ml-2">
                {t("order_setup.date_label")}
              </Text>
            </View>
            <DatePicker
              value={date}
              onChange={setDate}
              accessibilityLabel={t("order_setup.date_label")}
            />
          </View>

          {/* Guest Count Selection */}
          <View className="px-2 mb-6">
            <View className="flex-row items-center mb-4">
              <MaterialCommunityIcons
                name="account-group-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text className="text-lg font-display font-bold text-on-surface ml-2">
                {t("order_setup.guests_label")}
              </Text>
            </View>

            <View className="bg-surface-container-low/30 border border-outline-variant/20 rounded-3xl p-6 flex-row items-center justify-between">
              <Button
                variant="ghost"
                onPress={() =>
                  useCartStore
                    .getState()
                    .setGuestCount(Math.max(1, useCartStore.getState().guestCount - 1))
                }
                className="w-14 h-14 rounded-2xl bg-surface-container-high items-center justify-center border border-outline-variant/10"
              >
                <MaterialCommunityIcons name="minus" size={24} color={COLORS.primary} />
              </Button>

              <View className="items-center">
                <Text className="text-4xl font-display font-bold text-on-surface">
                  {useCartStore((state) => state.guestCount)}
                </Text>
                <Text className="text-[10px] font-display font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                  {t("common.pax")}
                </Text>
              </View>

              <Button
                variant="ghost"
                onPress={() =>
                  useCartStore
                    .getState()
                    .setGuestCount(Math.min(20, useCartStore.getState().guestCount + 1))
                }
                className="w-14 h-14 rounded-2xl bg-surface-container-high items-center justify-center border border-outline-variant/10"
              >
                <MaterialCommunityIcons name="plus" size={24} color={COLORS.primary} />
              </Button>
            </View>
          </View>

          {/* Moment Selection */}
          <View className="px-2 mb-8">
            <View className="flex-row items-center mb-4">
              <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.primary} />
              <Text className="text-lg font-display font-bold text-on-surface ml-2">
                {t("order_setup.moment_label")}
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-4">
              {SERVICE_MOMENTS.map((m) => {
                const isSelected = moment === m.zzz_id;
                const label = t(m.labelKey);
                return (
                  <Button
                    key={m.zzz_id}
                    variant="ghost"
                    onPress={() => setMoment(m.zzz_id)}
                    accessibilityLabel={`${label}${isSelected ? `, ${t("common.selected")}` : ""}`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    className={`w-[48%] items-center justify-center p-5 border rounded-3xl transition-all ${
                      isSelected
                        ? `shadow-lg border-${m.color} ${m.bgClass}/15`
                        : "bg-surface-container-low/30 border-outline-variant/20"
                    }`}
                  >
                    <View className="items-center justify-center mb-3">
                      <MaterialCommunityIcons
                        name={m.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                        size={42}
                        color={isSelected ? m.hex : COLORS["on-surface-variant"]}
                        className={!isSelected ? "opacity-40" : ""}
                      />
                    </View>
                    <Text
                      className={`text-lg font-display transition-colors ${
                        isSelected
                          ? "text-on-surface font-bold"
                          : "text-on-surface-variant font-medium opacity-60"
                      }`}
                    >
                      {label}
                    </Text>

                    {isSelected && (
                      <View
                        className={`absolute top-3 right-3 w-5 h-5 rounded-full items-center justify-center ${m.bgClass}`}
                      >
                        <MaterialCommunityIcons
                          name="check"
                          size={14}
                          color={COLORS["on-primary"]}
                        />
                      </View>
                    )}
                  </Button>
                );
              })}
            </View>
          </View>

          {/* Action Button */}
          <View className="px-2">
            <Button
              variant="primary"
              title={t("order_setup.submit")}
              onPress={handleProceed}
              disabled={!isValid}
              rightIcon="arrow-right"
              className="py-5 rounded-2xl shadow-lg"
              accessibilityLabel={t("order_setup.submit")}
            />
          </View>
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}
