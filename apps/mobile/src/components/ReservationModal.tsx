/**
 * ReservationModal Component
 * Modal for making a reservation - selects moment of day and quantity
 */

import { useState } from "react";
import { Text, View, Modal, Pressable, ScrollView, TextInput, Image } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { CatalogServiceItem } from "../mocks/catalog";
import { useI18n } from "../hooks/useI18n";

interface ReservationModalProps {
  visible: boolean;
  service: CatalogServiceItem | null;
  onClose: () => void;
  onConfirm: (momentOfDay: string, quantity: number, notes?: string) => void;
  isLoading?: boolean;
}

const MOMENTS_OF_DAY = [
  { id: "Desayuno", icon: "coffee", labelKey: "catalog.reservation.moments.breakfast" },
  { id: "Almuerzo", icon: "silverware-fork-knife", labelKey: "catalog.reservation.moments.lunch" },
  { id: "Merienda", icon: "cookie", labelKey: "catalog.reservation.moments.afternoon" },
  { id: "Cena", icon: "food-drumstick", labelKey: "catalog.reservation.moments.dinner" },
];

export function ReservationModal({
  visible,
  service,
  onClose,
  onConfirm,
  isLoading = false,
}: ReservationModalProps) {
  const { t } = useI18n();
  const [selectedMoment, setSelectedMoment] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    if (!selectedMoment) return;
    onConfirm(selectedMoment, quantity, notes || undefined);
    // Reset form
    setSelectedMoment(null);
    setQuantity(1);
    setNotes("");
  };

  const handleClose = () => {
    setSelectedMoment(null);
    setQuantity(1);
    setNotes("");
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

        <Pressable className="bg-surface max-h-[85%]" onPress={() => {}}>
          {/* Handle bar */}
          <View className="w-full items-center pt-3 pb-2">
            <View className="w-12 h-1 bg-outline-variant" />
          </View>

          {/* Header with image */}
          <View className="pb-4 border-b border-outline-variant">
            {service.image_url && (
              <View className="mx-auto mb-4 rounded-xl overflow-hidden sm:h-64 h-48 max-w-md w-full">
                <Image
                  source={{ uri: service.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                  alt={service.name_i18n.es || service.name_i18n.en || "Service image"}
                />
              </View>
            )}
            <View className="px-6 pt-0 flex-row justify-between items-start">
              <View className="flex-1 pr-4">
                <Text className="text-xl font-display font-bold text-on-surface">
                  {service.name_i18n.es || service.name_i18n.en}
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
                      ? "bg-secondary border-secondary"
                      : "bg-surface-container-low border-outline-variant"
                  }`}
                  onPress={() => setSelectedMoment(moment.id)}
                >
                  <View className="items-center gap-1">
                    <MaterialCommunityIcons
                      name={moment.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={24}
                      color={selectedMoment === moment.id ? "on-secondary" : "secondary"}
                    />
                    <Text
                      className={`text-sm font-body ${
                        selectedMoment === moment.id ? "text-white" : "text-on-surface"
                      }`}
                    >
                      {t(moment.labelKey)}
                    </Text>
                  </View>
                </Pressable>
              ))}
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
              placeholderTextColor="rgba(28, 28, 24, 0.4)"
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
                !selectedMoment || isLoading ? "opacity-50" : ""
              }`}
              onPress={handleConfirm}
              disabled={!selectedMoment || isLoading}
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
