/**
 * ReservationModal Component
 * Modal for making a reservation - selects moment of day and quantity
 */

import { useState } from "react";
import { Text, View, Modal, Pressable, ScrollView, TextInput } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MOMENTS_OF_DAY } from "../constants/moments";
import type { TimeOfDay } from "@repo/shared";
import type { CatalogServiceItem } from "../mocks/catalog";
import { useTranslations } from "../hooks/useI18n";
import { CatalogImage } from "./CatalogImage";
import { DatePicker } from "./DatePicker";

interface ReservationModalProps {
  visible: boolean;
  service: CatalogServiceItem | null;
  onClose: () => void;
  onConfirm: (momentOfDay: TimeOfDay, quantity: number, date: Date, notes?: string) => void;
  isLoading?: boolean;
}

export function ReservationModal({
  visible,
  service,
  onClose,
  onConfirm,
  isLoading = false,
}: ReservationModalProps) {
  const { t, getLocalizedName } = useTranslations();
  const [selectedMoment, setSelectedMoment] = useState<TimeOfDay | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const isValid = selectedMoment !== null && quantity > 0 && date !== null;

  const handleConfirm = () => {
    if (!isValid || !date) return;
    onConfirm(selectedMoment, quantity, date, notes || undefined);
    handleClose();
  };

  const handleClose = () => {
    setSelectedMoment(null);
    setQuantity(1);
    setNotes("");
    setDate(null);
    onClose();
  };

  const formatPrice = (price: number) => {
    return `$ ${price.toLocaleString("es-AR")}`;
  };

  if (!service) return null;

  const totalPrice = service.price * quantity;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="flex-1 justify-end" onPress={handleClose}>
        {/* Glassmorphism overlay */}
        <View className="absolute inset-0 bg-surface/85 backdrop-blur-md" />

        <Pressable className="flex-1 bg-surface" onPress={() => {}}>
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
                  alt={getLocalizedName(service.name_i18n) || "Service image"}
                  className="w-full h-full"
                />
              </View>
            )}
            <View className="px-6 pt-0 flex-row justify-between items-start">
              <View className="flex-1 pr-4">
                <Text className="text-xl font-display font-bold text-on-surface">
                  {getLocalizedName(service.name_i18n)}
                </Text>
                <Text className="text-base font-body text-primary font-bold mt-1">
                  {formatPrice(service.price)}
                </Text>
              </View>
              <Pressable onPress={handleClose} className="p-2 -mr-2 -mt-2">
                <MaterialCommunityIcons name="close" size={24} color="on-surface" />
              </Pressable>
            </View>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
            {/* Moment of Day Selection */}
            <Text className="text-base font-body font-bold text-on-surface mb-3">
              {t("catalog.reservation.moment_of_day")}
            </Text>
            <View className="flex-row gap-2 mb-6">
              {MOMENTS_OF_DAY.map((moment) => (
                <Pressable
                  key={moment.id}
                  className={`flex-1 py-3 px-2 border ${
                    selectedMoment === moment.id
                      ? `border-0 bg-moment-${moment.id.toLowerCase()}/20`
                      : `bg-surface-container-low border-outline-variant border-moment-${moment.id.toLowerCase()}/40`
                  }`}
                  onPress={() => setSelectedMoment(moment.id)}
                >
                  <View className="items-center gap-1">
                    <MaterialCommunityIcons
                      name={moment.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={24}
                      color={moment.hex}
                    />
                    <Text className={`text-sm font-body moment-${moment.id.toLowerCase()}`}>
                      {t(moment.labelKey)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Date Selection */}
            <View className="mb-6">
              <DatePicker value={date} onChange={setDate} />
            </View>

            {/* Quantity Selector */}
            <Text className="text-base font-body font-bold text-on-surface mb-3">
              {t("catalog.reservation.quantity")}
            </Text>
            <View className="flex-row items-center justify-center gap-4 mb-6">
              <Pressable
                className="w-12 h-12 bg-surface-container-low items-center justify-center border border-outline-variant"
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <MaterialCommunityIcons name="minus" size={24} color="on-surface" />
              </Pressable>
              <View className="w-16 h-12 bg-surface-container-highest items-center justify-center border border-outline-variant">
                <Text className="text-2xl font-display font-bold text-on-surface">{quantity}</Text>
              </View>
              <Pressable
                className="w-12 h-12 bg-surface-container-low items-center justify-center border border-outline-variant"
                onPress={() => setQuantity((q) => Math.min(10, q + 1))}
              >
                <MaterialCommunityIcons name="plus" size={24} color="on-surface" />
              </Pressable>
            </View>

            {/* Total */}
            <View className="bg-surface-container-low p-4 mb-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-base font-body text-on-surface">
                  {t("catalog.reservation.total")}
                </Text>
                <Text className="text-xl font-display font-bold text-primary">
                  {formatPrice(totalPrice)}
                </Text>
              </View>
            </View>

            {/* Notes input */}
            <Text className="text-base font-body font-bold text-on-surface mb-3">
              {t("catalog.reservation.notes")}
            </Text>
            <TextInput
              className="bg-surface-container-low border border-outline-variant p-3 mb-6 h-20 text-base font-body text-on-surface"
              placeholder={t("catalog.reservation.notes_placeholder")}
              placeholderTextColor="on-surface"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Footer */}
          <View className="px-6 pb-6 pt-4 border-t border-outline-variant">
            <Pressable
              className={`bg-primary py-4 flex-row items-center justify-center gap-2 ${
                !isValid || isLoading ? "opacity-50" : ""
              }`}
              onPress={handleConfirm}
              disabled={!isValid || isLoading}
            >
              <MaterialCommunityIcons name="check" size={20} color="on-primary" />
              <Text className="text-base font-body font-bold text-on-primary">
                {isLoading ? t("catalog.reservation.confirming") : t("catalog.reservation.confirm")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
