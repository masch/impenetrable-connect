/**
 * DatePicker Component
 * A wrapper around @react-native-community/datetimepicker with NativeWind styling
 */

import { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../hooks/useI18n";
import { COLORS } from "@repo/shared";

const isWeb = Platform.OS === "web";

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  accessibilityLabel?: string;
}

export function DatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
  accessibilityLabel,
}: DatePickerProps) {
  const { t } = useTranslations();
  const [showPicker, setShowPicker] = useState(false);

  // Default to today if value is null
  const currentValue = value || new Date();

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      onChange(selectedDate);
      // On Android, close picker when date is selected to prevent re-opening loop
      if (Platform.OS === "android") {
        setShowPicker(false);
      }
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const handleQuickSelect = (daysFromNow: number) => {
    const targetDate = new Date();
    targetDate.setHours(12, 0, 0, 0);
    targetDate.setDate(targetDate.getDate() + daysFromNow);
    onChange(targetDate);
  };

  const isToday = (): boolean => {
    if (value === null) return false;
    const today = new Date();
    const valueCheck = new Date(value);
    return (
      valueCheck.getDate() === today.getDate() &&
      valueCheck.getMonth() === today.getMonth() &&
      valueCheck.getFullYear() === today.getFullYear()
    );
  };

  const isTomorrow = (): boolean => {
    if (value === null) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const valueCheck = new Date(value);
    return (
      valueCheck.getDate() === tomorrow.getDate() &&
      valueCheck.getMonth() === tomorrow.getMonth() &&
      valueCheck.getFullYear() === tomorrow.getFullYear()
    );
  };

  // Check if a custom date (not today/tomorrow) was selected
  const isCustomDate = (): boolean => value !== null && !isToday() && !isTomorrow();

  // Check if no date is selected at all
  const isDateSelected = (): boolean => value !== null;

  const [webPickerOpen, setWebPickerOpen] = useState(false);

  const adjustDate = (days: number) => {
    const newDate = new Date(currentValue);
    newDate.setDate(newDate.getDate() + days);
    newDate.setHours(12, 0, 0, 0);
    onChange(newDate);
  };

  const handleWebQuickSelect = (offset: number) => {
    handleQuickSelect(offset);
  };

  if (isWeb) {
    return (
      <View accessibilityLabel={accessibilityLabel}>
        {/* Quick select in single line */}
        <View className="flex-row gap-2">
          <Pressable
            className={`flex-1 py-3 border ${
              isDateSelected() && isToday()
                ? "bg-secondary border-secondary"
                : "bg-surface-container-low border-outline-variant"
            }`}
            onPress={() => handleWebQuickSelect(0)}
          >
            <Text
              className={`text-center text-base font-body ${isDateSelected() && isToday() ? "text-on-primary font-bold" : "text-on-surface"}`}
            >
              {t("orders.today")}
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-3 border ${
              isDateSelected() && isTomorrow()
                ? "bg-secondary border-secondary"
                : "bg-surface-container-low border-outline-variant"
            }`}
            onPress={() => handleWebQuickSelect(1)}
          >
            <Text
              className={`text-center text-base font-body ${isDateSelected() && isTomorrow() ? "text-on-primary font-bold" : "text-on-surface"}`}
            >
              {t("orders.tomorrow")}
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-3 border ${
              isCustomDate()
                ? "bg-secondary border-secondary"
                : "bg-surface-container-low border-outline-variant"
            }`}
            onPress={() => {
              if (isWeb) {
                setWebPickerOpen(!webPickerOpen);
              } else {
                setShowPicker(!showPicker);
              }
            }}
          >
            {isCustomDate() ? (
              <View className="flex-row items-center justify-center gap-1">
                <Text className="text-base font-body text-on-primary font-bold">
                  {formatDate(currentValue)}
                </Text>
                <MaterialCommunityIcons name="pencil" size={14} color={COLORS["on-primary"]} />
              </View>
            ) : (
              <View className="flex-row items-center justify-center gap-2">
                <MaterialCommunityIcons name="calendar" size={18} color={COLORS["on-surface"]} />
                <Text className="text-base font-body text-on-surface">{t("orders.choose")}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {webPickerOpen && (
          <View className="mt-2 bg-surface-container-low border border-outline-variant p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Pressable className="p-2" onPress={() => adjustDate(-1)}>
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color={COLORS["on-surface"]}
                />
              </Pressable>
              <Text className="text-lg font-body font-bold text-on-surface">
                {formatDate(currentValue)}
              </Text>
              <Pressable className="p-2" onPress={() => adjustDate(1)}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS["on-surface"]}
                />
              </Pressable>
            </View>
            <View className="flex-row gap-2 justify-center">
              <Pressable
                className="py-2 px-4 bg-primary"
                onPress={() => {
                  // Set the current value as the selected date
                  onChange(currentValue);
                  setWebPickerOpen(false);
                }}
              >
                <Text className="text-base font-body font-bold text-on-primary">
                  {t("orders.confirm")}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View accessibilityLabel={accessibilityLabel}>
      {/* Quick select in single line */}
      <View className="flex-row gap-3">
        <Pressable
          className={`flex-1 py-4 border-2 rounded-2xl ${
            isDateSelected() && isToday()
              ? "bg-secondary/10 border-secondary"
              : "bg-surface-container-low border-outline-variant/30"
          }`}
          onPress={() => handleQuickSelect(0)}
        >
          <Text
            className={`text-center text-sm font-display leading-tight ${isDateSelected() && isToday() ? "text-secondary font-bold" : "text-on-surface-variant font-medium"}`}
          >
            {t("orders.today")}
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-4 border-2 rounded-2xl ${
            isDateSelected() && isTomorrow()
              ? "bg-secondary/10 border-secondary"
              : "bg-surface-container-low border-outline-variant/30"
          }`}
          onPress={() => handleQuickSelect(1)}
        >
          <Text
            className={`text-center text-sm font-display leading-tight ${isDateSelected() && isTomorrow() ? "text-secondary font-bold" : "text-on-surface-variant font-medium"}`}
          >
            {t("orders.tomorrow")}
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 py-4 border-2 rounded-2xl ${
            isCustomDate()
              ? "bg-secondary/10 border-secondary"
              : "bg-surface-container-low border-outline-variant/30"
          }`}
          onPress={() => setShowPicker(!showPicker)}
        >
          {isCustomDate() ? (
            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-sm font-display text-secondary font-bold leading-tight">
                {formatDate(currentValue)}
              </Text>
              <MaterialCommunityIcons name="pencil" size={14} color={COLORS["on-surface"]} />
            </View>
          ) : (
            <View className="flex-row items-center justify-center gap-2">
              <MaterialCommunityIcons
                name="calendar"
                size={16}
                color={COLORS["on-surface-variant"]}
              />
              <Text className="text-sm font-display text-on-surface-variant font-medium leading-tight">
                {t("orders.choose")}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {showPicker && (
        <View className="mt-2 items-center">
          <DateTimePicker
            value={currentValue}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale="es-AR"
          />
        </View>
      )}
    </View>
  );
}
