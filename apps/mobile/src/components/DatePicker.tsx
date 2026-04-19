/**
 * DatePicker Component
 * A wrapper around @react-native-community/datetimepicker with NativeWind styling
 */

import { useState } from "react";
import { View, Text, Platform } from "react-native";
import { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { AppDateTimePicker } from "./AppDateTimePicker";
import { useTranslations } from "../hooks/useI18n";
import { Button } from "./Button";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { COLORS } from "@repo/shared";
import { formatDate as formatDisplayDate } from "../logic/formatters";

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
    return formatDisplayDate(date, {
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
          <Button
            className="flex-1 rounded-2xl px-1"
            variant={isDateSelected() && isToday() ? "secondary" : "outline"}
            title={t("orders.today")}
            onPress={() => handleWebQuickSelect(0)}
            accessibilityLabel={t("orders.today")}
          />
          <Button
            className="flex-1 rounded-2xl px-1"
            variant={isDateSelected() && isTomorrow() ? "secondary" : "outline"}
            title={t("orders.tomorrow")}
            onPress={() => handleWebQuickSelect(1)}
            accessibilityLabel={t("orders.tomorrow")}
          />
          <Button
            className="flex-1 rounded-2xl px-1"
            variant={isCustomDate() ? "secondary" : "outline"}
            title={isCustomDate() ? formatDate(currentValue) : t("orders.choose")}
            rightIcon={isCustomDate() ? "pencil" : undefined}
            leftIcon={!isCustomDate() ? "calendar" : undefined}
            onPress={() => {
              setWebPickerOpen(!webPickerOpen);
            }}
            accessibilityLabel={isCustomDate() ? formatDate(currentValue) : t("orders.choose")}
          />
        </View>

        {webPickerOpen && (
          <View className="mt-4 bg-surface-container-low border border-outline-variant p-3 rounded-2xl">
            <View className="flex-row justify-between items-center mb-4 bg-surface-container-high/50 p-1.5 rounded-xl">
              <Button
                size="sm"
                variant="outline"
                leftIcon="chevron-left"
                className="border-0 bg-surface-container-highest w-10 h-10"
                onPress={() => adjustDate(-1)}
                accessibilityLabel={t("common.previous")}
              />
              <Text className="text-lg font-display font-bold text-on-surface">
                {formatDate(currentValue)}
              </Text>
              <Button
                size="sm"
                variant="outline"
                leftIcon="chevron-right"
                className="border-0 bg-surface-container-highest w-10 h-10"
                onPress={() => adjustDate(1)}
                accessibilityLabel={t("common.next")}
              />
            </View>
            <View className="flex-row justify-center">
              <Button
                variant="primary"
                title={t("orders.confirm")}
                className="px-8 py-3 rounded-xl shadow-md"
                onPress={() => {
                  onChange(currentValue);
                  setWebPickerOpen(false);
                }}
              />
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
        <Button
          className={`flex-1 rounded-3xl py-4 border-2 ${
            isDateSelected() && isToday()
              ? "bg-secondary/10 border-secondary shadow-sm"
              : "bg-surface-container-low/30 border-outline-variant/20"
          }`}
          variant="ghost"
          onPress={() => handleQuickSelect(0)}
          accessibilityLabel={t("orders.today")}
        >
          <Text
            className={`text-base font-display ${
              isDateSelected() && isToday()
                ? "text-secondary font-bold"
                : "text-on-surface-variant font-medium opacity-60"
            }`}
          >
            {t("orders.today")}
          </Text>
        </Button>
        <Button
          className={`flex-1 rounded-3xl py-4 border-2 ${
            isDateSelected() && isTomorrow()
              ? "bg-secondary/10 border-secondary shadow-sm"
              : "bg-surface-container-low/30 border-outline-variant/20"
          }`}
          variant="ghost"
          onPress={() => handleQuickSelect(1)}
          accessibilityLabel={t("orders.tomorrow")}
        >
          <Text
            className={`text-base font-display ${
              isDateSelected() && isTomorrow()
                ? "text-secondary font-bold"
                : "text-on-surface-variant font-medium opacity-60"
            }`}
          >
            {t("orders.tomorrow")}
          </Text>
        </Button>
        <Button
          className={`flex-1 rounded-3xl py-4 border-2 ${
            isCustomDate()
              ? "bg-secondary/10 border-secondary shadow-sm"
              : "bg-surface-container-low/30 border-outline-variant/20"
          }`}
          variant="ghost"
          onPress={() => setShowPicker(!showPicker)}
          accessibilityLabel={isCustomDate() ? formatDate(currentValue) : t("orders.choose")}
        >
          <View className="flex-row items-center gap-2">
            {!isCustomDate() && (
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={18}
                color={COLORS["on-surface-variant"]}
                className="opacity-40"
              />
            )}
            <Text
              className={`text-base font-display ${
                isCustomDate()
                  ? "text-secondary font-bold"
                  : "text-on-surface-variant font-medium opacity-60"
              }`}
            >
              {isCustomDate() ? formatDate(currentValue) : t("orders.choose")}
            </Text>
            {isCustomDate() && (
              <MaterialCommunityIcons name="pencil" size={14} color={COLORS.secondary} />
            )}
          </View>
        </Button>
      </View>

      {showPicker && (
        <View className="mt-2 items-center">
          <AppDateTimePicker
            value={currentValue}
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            display={Platform.OS === "ios" ? "spinner" : "default"}
          />
        </View>
      )}
    </View>
  );
}
