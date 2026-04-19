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
import { COLORS } from "@repo/shared";
import { ServiceMoment, Order } from "@repo/shared";
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
      (selectedDate &&
        (date.getFullYear() !== selectedDate.getFullYear() ||
          date.getMonth() !== selectedDate.getMonth() ||
          date.getDate() !== selectedDate.getDate())) ||
      (selectedMoment && moment !== selectedMoment);

    if (hasContextChanged && selectedDate && selectedMoment) {
      // Find orders in the PREVIOUS context to move them
      const itemsToMove = activeOrders.filter((o: Order) => {
        const oDate = new Date(o.reservation?.service_date || 0);
        return (
          oDate.getFullYear() === selectedDate.getFullYear() &&
          oDate.getMonth() === selectedDate.getMonth() &&
          oDate.getDate() === selectedDate.getDate() &&
          String(o.reservation?.time_of_day || "").toUpperCase() ===
            String(selectedMoment).toUpperCase()
        );
      });

      if (itemsToMove.length > 0) {
        await moveOrders(
          itemsToMove.map((o: Order) => Number(o.id)),
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
            <Text className="text-3xl font-display font-bold text-on-surface leading-tight">
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
                const isSelected = moment === m.id;
                const label = t(m.labelKey);
                return (
                  <Button
                    key={m.id}
                    variant="ghost"
                    onPress={() => setMoment(m.id)}
                    accessibilityLabel={`${label}${isSelected ? `, ${t("common.selected")}` : ""}`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    className={`w-[48%] items-center justify-center p-5 border rounded-3xl transition-all ${
                      isSelected
                        ? "shadow-lg"
                        : "bg-surface-container-low/30 border-outline-variant/20"
                    }`}
                    style={isSelected ? { borderColor: m.hex, backgroundColor: `${m.hex}15` } : {}}
                  >
                    <View className="items-center justify-center mb-3">
                      <MaterialCommunityIcons
                        name={m.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                        size={42}
                        color={isSelected ? m.hex : COLORS["on-surface-variant"]}
                        style={!isSelected ? { opacity: 0.4 } : {}}
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
                        className="absolute top-3 right-3 w-5 h-5 rounded-full items-center justify-center"
                        style={{ backgroundColor: m.hex }}
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
