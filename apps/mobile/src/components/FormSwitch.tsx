import React, { useEffect, useRef } from "react";
import { Text, View, Animated, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { COLORS } from "@repo/shared";
import { useTranslations } from "../hooks/useI18n";

interface FormSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
  warning?: string;
  helperText?: string;
}

/**
 * Modern Animated Switch with integrated Guardrail Pattern
 * Provides a premium look and feel with contextual safety warnings.
 */
export function FormSwitch({
  label,
  value,
  onValueChange,
  disabled,
  testID,
  warning,
  helperText,
}: FormSwitchProps) {
  const { t } = useTranslations();
  // Animation value: 0 for off, 1 for on
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  // Track(50) - Padding(3*2) - Thumb(22) = 22px of available movement
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS["surface-container-highest"], COLORS.primary],
  });

  return (
    <View testID={testID ? `${testID}-container` : undefined}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 12,
          minHeight: 48,
        }}
      >
        <Text
          style={{
            flex: 1,
            marginRight: 16,
            fontSize: 16,
            color: COLORS["on-surface"],
            includeFontPadding: false,
          }}
        >
          {label}
        </Text>

        <Pressable
          onPress={() => !disabled && onValueChange(!value)}
          disabled={disabled}
          accessibilityRole="switch"
          accessibilityState={{ checked: value, disabled }}
          testID={testID}
          style={{ width: 50, height: 28 }}
        >
          <Animated.View
            pointerEvents="none"
            style={{
              backgroundColor,
              width: 50,
              height: 28,
              borderRadius: 14,
              padding: 3,
              justifyContent: "center",
            }}
          >
            <Animated.View
              style={{
                transform: [{ translateX }],
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: COLORS["surface-container-lowest"],
              }}
              className="shadow-sm elevation-5"
            />
          </Animated.View>
        </Pressable>
      </View>

      {/* Integrated Guardrail Pattern */}
      {value && warning ? (
        <View className="bg-error/5 border border-error/10 rounded-2xl p-4 mt-2 flex-row items-start">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={20}
            color={COLORS.error}
            className="mr-3 mt-0.5"
            accessibilityLabel={t("common.alert")}
          />
          <Text className="flex-1 text-[13px] font-body text-error leading-5">{warning}</Text>
        </View>
      ) : !value && helperText ? (
        <View className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mt-2 flex-row items-start">
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={COLORS.primary}
            className="mr-3 mt-0.5"
            accessibilityLabel={t("common.info")}
          />
          <Text className="flex-1 text-[13px] font-body text-on-surface-variant leading-5">
            {helperText}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
