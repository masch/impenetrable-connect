/**
 * ReservationModal Component
 * Modal for adding services to the cart or updating existing order items.
 */

import { useState, useEffect } from "react";
import { Text, View, Modal, ScrollView } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { ServiceMoment } from "@repo/shared";
import type { CatalogServiceItem } from "../mocks/catalog";
import { useTranslations } from "../hooks/useI18n";
import { CatalogImage } from "./CatalogImage";
import { Button } from "./Button";
import { AppAlert } from "./AppAlert";
import { FormInput } from "./FormInput";
import { useCartStore } from "../stores/cart.store";
import { COLORS } from "@repo/shared";
import { formatCurrency } from "../logic/formatters";

interface ReservationModalProps {
  visible: boolean;
  service: CatalogServiceItem | null;
  onClose: () => void;
  onConfirm: (moment: ServiceMoment, quantity: number, date: Date, notes?: string) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  initialQuantity?: number;
  initialNotes?: string;
  mode?: "add" | "edit";
}

export function ReservationModal({
  visible,
  service,
  onClose,
  onConfirm,
  onDelete,
  isLoading = false,
  initialQuantity,
  initialNotes,
  mode = "add",
}: ReservationModalProps) {
  const { t, getLocalizedName } = useTranslations();
  const selectedDate = useCartStore((state) => state.selectedDate);
  const selectedMoment = useCartStore((state) => state.selectedMoment);

  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);

  // Initialize state when modal opens or initial data changes
  useEffect(() => {
    if (visible) {
      setQuantity(initialQuantity || 1);
      setNotes(initialNotes || "");
    }
  }, [visible, initialQuantity, initialNotes]);

  const isValid = selectedMoment !== null && quantity > 0 && selectedDate !== null;

  const handleConfirm = () => {
    if (!isValid || !selectedDate || !selectedMoment) return;

    onConfirm(selectedMoment, quantity, selectedDate, notes || undefined);
  };

  const handleDelete = () => {
    if (!onDelete) return;
    setDeleteAlertVisible(true);
  };

  const handleClose = () => {
    setNotes("");
    setQuantity(1);
    onClose();
  };

  if (!service) return null;

  const totalPrice = service.price * quantity;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end">
        {/* Backdrop overlay - Sibling pattern */}
        <Button variant="ghost" className="absolute inset-0 rounded-none" onPress={handleClose}>
          <View className="absolute inset-0 bg-black/60" />
        </Button>

        {/* Content Container - View instead of Button */}
        <View className="flex-1 bg-surface-solid">
          {/* Handle bar */}
          <View className="w-full items-center pt-3 pb-2">
            <View className="w-12 h-1 bg-outline-variant" />
          </View>

          {/* Header with image */}
          <View className="pb-4 border-b border-outline-variant">
            {service.image_url && (
              <View className="w-full h-[250px] mb-4">
                <CatalogImage
                  imageUrl={service.image_url}
                  alt={getLocalizedName(service.name_i18n) || t("catalog.service_image_alt")}
                  className="w-full h-full"
                />
              </View>
            )}
            <View className="px-6 pt-2 flex-row justify-between items-start">
              <View className="flex-1 pr-6">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xl font-display font-bold text-on-surface flex-1 mr-2">
                    {getLocalizedName(service.name_i18n)}
                  </Text>
                  <Text className="text-lg font-display font-bold text-primary">
                    {formatCurrency(service.price)}
                  </Text>
                </View>
                <Text className="text-sm font-body text-on-surface-variant leading-relaxed">
                  {getLocalizedName(service.description_i18n)}
                </Text>
              </View>
              <Button variant="ghost" onPress={handleClose} className="p-2 -mr-2 -mt-1 min-w-0">
                <MaterialCommunityIcons name="close" size={24} color={COLORS["on-surface"]} />
              </Button>
            </View>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
            {/* Quantity and Total Action Panel */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
                {/* Compact Stepper */}
                <View className="flex-row items-center bg-surface-container-high rounded-full px-1 py-1">
                  <Button
                    variant="ghost"
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 items-center justify-center p-0 rounded-full"
                  >
                    <MaterialCommunityIcons name="minus" size={20} color={COLORS["on-surface"]} />
                  </Button>
                  <View className="px-4 items-center min-w-[40px]">
                    <Text className="text-lg font-display font-bold text-on-surface">
                      {quantity}
                    </Text>
                  </View>
                  <Button
                    variant="ghost"
                    onPress={() => setQuantity(Math.min(20, quantity + 1))}
                    className="w-10 h-10 items-center justify-center p-0 rounded-full"
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={COLORS["on-surface"]} />
                  </Button>
                </View>

                {/* Integrated Total */}
                <View className="items-end">
                  <Text className="text-xs font-body text-outline uppercase mb-0.5">
                    {t("catalog.reservation.total")}
                  </Text>
                  <Text className="text-xl font-display font-bold text-primary">
                    {formatCurrency(totalPrice)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Notes input */}
            <FormInput
              label={t("catalog.reservation.notes")}
              placeholder={t("catalog.reservation.notes_placeholder")}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="h-28"
            />
          </ScrollView>

          {/* Footer */}
          <View className="px-6 pb-6 pt-4 border-t border-outline-variant flex-col gap-3">
            <Button
              variant="primary"
              title={
                isLoading
                  ? t("catalog.reservation.confirming")
                  : mode === "edit"
                    ? t("catalog.reservation.update")
                    : t("catalog.reservation.add_to_selection")
              }
              onPress={handleConfirm}
              disabled={!isValid || isLoading}
              leftIcon="check"
            />
            {mode === "edit" && (
              <Button
                variant="danger"
                title={t("catalog.reservation.remove_button")}
                onPress={handleDelete}
                disabled={isLoading}
                leftIcon="trash-can-outline"
              />
            )}
          </View>
        </View>
      </View>

      <AppAlert
        visible={deleteAlertVisible}
        title={t("catalog.reservation.remove_confirm_title")}
        message={t("catalog.reservation.remove_confirm_message")}
        type="alert"
        onClose={() => setDeleteAlertVisible(false)}
        actions={[
          {
            text: t("common.cancel"),
            style: "cancel",
            onPress: () => {},
          },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: () => {
              if (onDelete) {
                onDelete();
              }
            },
          },
        ]}
      />
    </Modal>
  );
}
