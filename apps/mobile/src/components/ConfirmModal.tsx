import { Text, View, Modal } from "react-native";
import { Button } from "./Button";
import { useTranslations } from "../hooks/useI18n";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const { t } = useTranslations();
  const finalConfirmText = confirmText || t("common.confirm");
  const finalCancelText = cancelText || t("common.cancel");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center p-5">
        {/* Backdrop overlay - Sibling pattern to avoid nested buttons */}
        <Button variant="ghost" className="absolute inset-0 rounded-none" onPress={onCancel}>
          <View className="absolute inset-0 bg-surface/85 backdrop-blur-md" />
        </Button>

        {/* Content Area */}
        <View className="bg-surface-container-highest p-6 w-full max-w-md">
          <Text className="text-xl font-bold text-on-surface mb-2">{title}</Text>
          <Text className="text-base text-on-surface opacity-70 mb-6">{message}</Text>

          <View className="gap-4">
            <Button
              title={finalConfirmText}
              variant={variant}
              onPress={onConfirm}
              disabled={isLoading}
            />
            <Button
              title={finalCancelText}
              variant="secondary"
              onPress={onCancel}
              disabled={isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
