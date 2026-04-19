import { Modal, Text, View, ScrollView } from "react-native";
import { Button } from "./Button";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../hooks/useI18n";
import { COLORS } from "@repo/shared";

export interface AppAlertAction {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  style?: "cancel" | "default" | "destructive";
}

interface AppAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  actions: AppAlertAction[];
  type?: "info" | "error" | "alert" | "confirm";
}

/**
 * AppAlert Component
 * A custom, cross-platform alert component that follows the project design system.
 */
export function AppAlert({
  visible,
  title,
  message,
  onClose,
  actions,
  type = "info",
}: AppAlertProps) {
  const { t } = useTranslations();

  const getIconConfig = () => {
    switch (type) {
      case "error":
        return {
          name: "close-circle-outline" as const,
          color: COLORS.error,
          bg: "bg-error/10",
        };
      case "alert":
        return { name: "alert-outline" as const, color: COLORS.warning, bg: "bg-warning/10" };
      case "confirm":
        return {
          name: "check-circle-outline" as const,
          color: COLORS.success,
          bg: "bg-success/10",
        };
      default:
        return { name: "information-outline" as const, color: COLORS.info, bg: "bg-info/10" };
    }
  };

  const { name, color, bg } = getIconConfig();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center px-6">
        {/* Backdrop overlay - Now a sibling to avoid nesting buttons in HTML */}
        <Button
          variant="ghost"
          className="absolute inset-0 rounded-none"
          onPress={onClose}
          accessibilityLabel={t("common.cancel")}
          accessibilityHint={t("common.cancel")}
        >
          <View className="absolute inset-0 bg-black/60" />
        </Button>

        {/* Content - Non-clickable View container */}
        <View className="w-full max-w-[340px] p-6 rounded-[32px] border border-outline-variant shadow-2xl bg-surface-solid">
          {/* Icon / Brand mark */}
          <View className="items-center mb-4">
            <View
              className={`w-14 h-14 ${bg} rounded-full items-center justify-center`}
              accessibilityLabel={t(`common.${type}`)}
              accessibilityRole="image"
            >
              <MaterialCommunityIcons name={name} size={32} color={color} />
            </View>
          </View>

          <Text className="text-xl font-display font-bold text-on-surface text-center mb-2">
            {title}
          </Text>

          <ScrollView className="max-h-48 mb-8" showsVerticalScrollIndicator={true}>
            <Text className="text-base font-body text-on-surface-variant text-center leading-relaxed">
              {message}
            </Text>
          </ScrollView>

          <View className="flex-col gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                title={action.text}
                variant={
                  action.variant || (action.style === "destructive" ? "danger" : "secondary")
                }
                onPress={() => {
                  onClose();
                  action.onPress();
                }}
                className={action.style === "cancel" ? "opacity-70" : ""}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
