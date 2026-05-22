import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { CatalogItem, COLORS, PRODUCT_CATEGORY_IDS } from "@repo/shared";
import { Icon } from "../Icon";
import { useTranslations } from "../../hooks/useI18n";
import { Button } from "../Button";
import { useCartStore } from "../../stores/cart.store";
import { getRelativeDateLabel, formatCurrency } from "../../logic/formatters";

interface ReservationModalProps {
  visible: boolean;
  item: CatalogItem | null;
  onClose: () => void;
  onConfirm: (quantity: number, notes: string) => void;
  onDelete?: () => void;
  initialQuantity?: number;
  initialNotes?: string;
  mode?: "add" | "edit";
}

const ICON_SIZE_MD = 24;
const NOTES_VISIBLE_LINES = 4;
const ALPHA_50_HEX = "80";
const MIN_QUANTITY = 1;

/**
 * ReservationModal - Context-aware booking modal
 */
export const ReservationModal = ({
  visible,
  item,
  onClose,
  onConfirm,
  onDelete,
  initialQuantity,
  initialNotes,
  mode = "add",
}: ReservationModalProps) => {
  const { t, getLocalizedName } = useTranslations();
  const { selectedDate, selectedMoment } = useCartStore();

  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [notes, setNotes] = useState(initialNotes || "");

  if (!item) return null;

  const isExcursion = item.zzz_product_category_id === PRODUCT_CATEGORY_IDS.EXCURSION;
  const quantityLabel = isExcursion
    ? t("catalog.reservation.guests")
    : t("catalog.reservation.quantity");
  const unitLabel = isExcursion ? t("catalog.participants") : t("catalog.reservation.dishes");

  const name = getLocalizedName(item.zzz_name_i18n) || t("catalog.no_name");

  const handleConfirm = () => {
    onConfirm(quantity, notes);
    onClose();
    // Reset local state
    setNotes("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-surface rounded-t-[32px] p-6 max-h-[90%] shadow-2xl border-t border-outline-variant/30">
          <View className="w-12 h-1.5 bg-outline-variant/30 rounded-full self-center mb-6" />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1 mr-4">
                <Text className="text-2xl font-display font-bold text-on-surface">{name}</Text>
                <Text className="text-primary font-display font-bold text-lg" testID="item-price">
                  {formatCurrency(item.zzz_price)}
                </Text>
              </View>
              <Button variant="ghost" onPress={onClose} className="p-2" testID="close-modal-button">
                <Icon
                  name="close"
                  size={ICON_SIZE_MD}
                  color={COLORS["on-surface"]}
                  accessibilityLabel={t("common.close")}
                />
              </Button>
            </View>

            {/* Context Header (Read-only Pill) */}
            <View className="flex-row items-center bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6">
              <Icon
                name="calendar-clock"
                size={ICON_SIZE_MD}
                color={COLORS.primary}
                accessibilityLabel={t("common.scheduled")}
              />
              <View className="ml-3">
                <Text className="text-[10px] font-display font-bold text-primary uppercase tracking-widest">
                  {t("catalog.reservation.active_context")}
                </Text>
                <Text className="text-sm font-body font-bold text-on-surface">
                  {selectedDate ? getRelativeDateLabel(selectedDate, t) : "---"} •{" "}
                  {selectedMoment ? t(`catalog.reservation.moments.${selectedMoment}`) : "---"}
                </Text>
              </View>
            </View>

            {/* Quantity Selector */}
            <View className="mb-6">
              <Text className="text-[10px] font-display font-bold text-on-surface-variant uppercase tracking-widest mb-2 px-1">
                {quantityLabel}
              </Text>
              <View className="flex-row items-center justify-between bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30">
                <Button
                  variant="ghost"
                  onPress={() => setQuantity((prev) => Math.max(MIN_QUANTITY, prev - 1))}
                  className="size-12"
                  disabled={quantity <= MIN_QUANTITY}
                  testID="quantity-minus-button"
                >
                  <Icon
                    name="minus"
                    size={ICON_SIZE_MD}
                    color={COLORS.primary}
                    accessibilityLabel={t("common.decrease")}
                  />
                </Button>

                <View className="items-center">
                  <Text className="text-2xl font-display font-bold text-on-surface">
                    {quantity}
                  </Text>
                  <Text className="text-[10px] font-display font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                    {unitLabel}
                  </Text>
                </View>

                <Button
                  variant="ghost"
                  onPress={() =>
                    setQuantity((prev) => Math.min(item.zzz_max_participants, prev + 1))
                  }
                  className="size-12"
                  disabled={quantity >= item.zzz_max_participants}
                  testID="quantity-plus-button"
                >
                  <Icon
                    name="plus"
                    size={ICON_SIZE_MD}
                    color={COLORS.primary}
                    accessibilityLabel={t("common.increase")}
                  />
                </Button>
              </View>
            </View>

            {/* Notes Input */}
            <View className="mb-8">
              <Text className="text-sm font-display font-bold text-on-surface mb-3 uppercase tracking-wider">
                {t("catalog.reservation.notes")}
              </Text>
              <TextInput
                multiline
                numberOfLines={NOTES_VISIBLE_LINES}
                value={notes}
                onChangeText={setNotes}
                placeholder={t("catalog.reservation.notes_placeholder")}
                className="bg-surface-container-low p-4 rounded-2xl text-on-surface font-body border border-outline-variant/30 text-base"
                textAlignVertical="top"
                placeholderTextColor={COLORS["on-surface-variant"] + ALPHA_50_HEX}
              />
            </View>

            <Button
              title={
                mode === "edit"
                  ? t("catalog.reservation.update")
                  : t("catalog.reservation.add_to_selection")
              }
              onPress={handleConfirm}
              className="mb-4 h-14 rounded-2xl"
              testID={mode === "edit" ? "update-order-button" : "add-to-selection-button"}
            />

            {mode === "edit" && onDelete && (
              <Button
                title={t("catalog.reservation.remove_button")}
                variant="danger"
                onPress={() => {
                  onDelete();
                  onClose();
                }}
                className="mb-4 h-14 rounded-2xl"
                leftIcon="trash-can-outline"
                testID="remove-order-button"
              />
            )}

            <Button
              title={t("common.cancel")}
              variant="ghost"
              onPress={onClose}
              className="mb-8"
              testID="cancel-order-button"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
