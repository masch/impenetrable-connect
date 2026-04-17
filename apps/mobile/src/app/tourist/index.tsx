import { useState } from "react";
import { View, Text, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../../hooks/useI18n";
import { useOrderContextStore } from "../../stores/order-context.store";
import { useOrdersStore } from "../../stores/orders.store";
import { MOMENTS_OF_DAY } from "../../constants/moments";
import { DatePicker } from "../../components/DatePicker";
import { Button } from "../../components/Button";
import { COLORS } from "@repo/shared";
import type { TimeOfDay, Order } from "@repo/shared";

export default function OrderSetupScreen() {
  const router = useRouter();
  const { t } = useTranslations();
  const { setContext, selectedDate, selectedMoment } = useOrderContextStore();
  const { activeOrders, moveOrders } = useOrdersStore();

  const [date, setDate] = useState<Date | null>(selectedDate || null);
  const [moment, setMoment] = useState<TimeOfDay | null>(selectedMoment);

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
        const oDate = new Date(o.service_date);
        return (
          oDate.getFullYear() === selectedDate.getFullYear() &&
          oDate.getMonth() === selectedDate.getMonth() &&
          oDate.getDate() === selectedDate.getDate() &&
          o.time_of_day === selectedMoment
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
    router.push("/tourist/catalog");
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Header Section */}
        <View className="px-6 pt-12 pb-6">
          <Text className="text-4xl font-display font-bold text-on-surface leading-tight">
            {t("order_setup.title")}
          </Text>
          <Text className="text-base font-body text-on-surface/50 mt-2">
            {t("order_setup.subtitle")}
          </Text>
        </View>

        {/* Date Selection */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.primary} />
            <Text className="text-lg font-display font-bold text-on-surface ml-2">
              {t("order_setup.date_label")}
            </Text>
          </View>
          <DatePicker value={date} onChange={setDate} />
        </View>

        {/* Moment Selection */}
        <View className="px-6 mb-10">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.primary} />
            <Text className="text-lg font-display font-bold text-on-surface ml-2">
              {t("order_setup.moment_label")}
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            {MOMENTS_OF_DAY.map((m) => {
              const isSelected = moment === m.id;
              const momentKey = m.id.toLowerCase();
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setMoment(m.id)}
                  className={`w-[48%] items-center justify-center p-6 border-2 rounded-3xl transition-all shadow-sm ${
                    isSelected
                      ? `bg-moment-${momentKey}/10 border-moment-${momentKey} shadow-moment-${momentKey}/20`
                      : "bg-surface-container-low border-outline-variant/30"
                  }`}
                  style={isSelected ? { elevation: 4 } : {}}
                >
                  <View
                    className={`w-14 h-14 rounded-full items-center justify-center mb-3 ${
                      isSelected ? `bg-moment-${momentKey}/20` : "bg-surface-container-high"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={m.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={34}
                      color={isSelected ? m.hex : "#6B7280"}
                    />
                  </View>
                  <Text
                    className={`text-base font-display transition-colors ${
                      isSelected
                        ? "text-on-surface font-bold"
                        : "text-on-surface-variant font-medium"
                    }`}
                  >
                    {t(m.labelKey)}
                  </Text>

                  {isSelected && (
                    <View
                      className="absolute top-3 right-3 w-5 h-5 rounded-full items-center justify-center"
                      style={{ backgroundColor: m.hex }}
                    >
                      <MaterialCommunityIcons name="check" size={14} color="white" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Action Button */}
        <View className="px-6">
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
    </SafeAreaView>
  );
}
