import React, { useState } from "react";
import { View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../hooks/useI18n";
import { COLORS } from "@repo/shared";
import { FormSwitch } from "./FormSwitch";
import { AppAlert } from "./AppAlert";

interface VentureStatusSectionProps {
  isPaused: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

/**
 * Venture Status Section
 * Manages venture availability (Pause/Resume)
 */
export default function VentureStatusSection({
  isPaused,
  onValueChange,
  disabled,
}: VentureStatusSectionProps) {
  const { t } = useTranslations();
  const [showAlert, setShowAlert] = useState(false);
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);

  const handleTogglePause = (value: boolean) => {
    setPendingValue(value);
    setShowAlert(true);
  };

  const confirmTogglePause = () => {
    if (pendingValue === null) return;
    onValueChange(pendingValue);
    setShowAlert(false);
    setPendingValue(null);
  };

  const alertTitle = pendingValue
    ? t("venture.pause_confirm_title")
    : t("venture.resume_confirm_title");
  const alertMessage = pendingValue
    ? t("venture.pause_confirm_message")
    : t("venture.resume_confirm_message");

  return (
    <View className="bg-surface-container-low rounded-3xl border border-outline-variant/30 p-5 shadow-sm mb-4">
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
          <MaterialCommunityIcons
            name="power-settings"
            size={24}
            color={COLORS.primary}
            accessibilityLabel={t("venture.management")}
          />
        </View>
        <Text className="text-lg font-display font-bold text-on-surface">
          {t("venture.management")}
        </Text>
      </View>

      <FormSwitch
        label={t("venture.is_paused")}
        value={!isPaused}
        onValueChange={(value) => handleTogglePause(!value)}
        disabled={disabled}
        testID="venture-active-switch"
        warning={t("venture.deactivate_warning")}
        helperText={t("venture.is_paused_help")}
      />

      <AppAlert
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        type="alert"
        onClose={() => setShowAlert(false)}
        actions={[
          {
            text: t("common.cancel"),
            onPress: () => setShowAlert(false),
            style: "cancel",
          },
          {
            text: t("common.confirm"),
            onPress: confirmTogglePause,
            variant: "primary",
          },
        ]}
      />
    </View>
  );
}
