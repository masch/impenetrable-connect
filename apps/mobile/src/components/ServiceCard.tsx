/**
 * ServiceCard Component
 * Displays a tourist service (gastronomy or excursion) with image, details, and reservation action
 */

import { Text, View, Pressable } from "react-native";
import { Button } from "./Button";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../hooks/useI18n";
import { SERVICE_CATEGORY_IDS } from "../mocks/catalog";
import type { CatalogServiceItem } from "../mocks/catalog";
import { CatalogImage } from "./CatalogImage";
import { COLORS } from "@repo/shared";

interface ServiceCardProps {
  service: CatalogServiceItem;
  isEditing?: boolean;
  onPress?: (service: CatalogServiceItem) => void;
  accessibilityLabel?: string;
}

export function ServiceCard({ service, isEditing, onPress, accessibilityLabel }: ServiceCardProps) {
  const { t, getLocalizedName } = useTranslations();
  const formatPrice = (price: number) => {
    return `$ ${price.toLocaleString("es-AR")}`;
  };

  // Get category from catalog_category_id: 1 = gastronomy, 2 = excursion
  const isGastronomy =
    Number(service.catalog_category_id) === Number(SERVICE_CATEGORY_IDS.GASTRONOMY);
  const categoryIcon = (
    isGastronomy ? "silverware-fork-knife" : "nature-people"
  ) as keyof typeof MaterialCommunityIcons.glyphMap;
  const categoryLabel = isGastronomy
    ? t("catalog.category.gastronomy")
    : t("catalog.category.excursion");

  // Get localized name/description using active locale with fallback chain
  const name = getLocalizedName(service.name_i18n) || t("catalog.no_name");
  const description = getLocalizedName(service.description_i18n) || t("catalog.no_description");

  return (
    <Pressable
      className="bg-surface-container-low mb-6 rounded-3xl overflow-hidden border border-outline-variant/20 shadow-sm active:opacity-95"
      onPress={() => onPress?.(service)}
      accessible
      accessibilityLabel={accessibilityLabel || name}
    >
      {/* Image Container with explicit height and background */}
      <View className="h-48 w-full bg-surface-container-highest items-center justify-center overflow-hidden">
        {service.image_url ? (
          <CatalogImage imageUrl={service.image_url} alt={name} />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <MaterialCommunityIcons name="image-off" size={48} color={COLORS["outline-variant"]} />
          </View>
        )}

        {/* Category badge - Pill style */}
        <View className="absolute top-4 left-4 bg-black/40 px-3 py-1.5 rounded-full flex-row items-center gap-2 backdrop-blur-md border border-white/20">
          <MaterialCommunityIcons name={categoryIcon} size={14} color="white" />
          <Text className="text-[10px] font-display font-bold text-white uppercase tracking-widest">
            {categoryLabel}
          </Text>
        </View>
      </View>

      {/* Content Area */}
      <View className="p-5">
        <View className="flex-row justify-between items-start mb-2">
          <Text
            className="text-xl font-display font-bold text-on-surface flex-1 pr-4"
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text className="text-xl font-display font-bold text-primary">
            {formatPrice(service.price)}
          </Text>
        </View>

        <Text
          className="text-sm font-body text-on-surface opacity-60 leading-5 mb-4"
          numberOfLines={2}
        >
          {description}
        </Text>

        {/* Action Row - Includes details and CTA */}
        <View className="flex-row items-center justify-between">
          {service.max_participants ? (
            <View className="flex-row items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full">
              <MaterialCommunityIcons name="account-group" size={14} color={COLORS.secondary} />
              <Text className="text-xs font-display font-bold text-secondary uppercase tracking-tight">
                {service.max_participants} {t("catalog.participants")}
              </Text>
            </View>
          ) : (
            <View />
          )}

          <Button
            variant={isEditing ? "secondary" : "primary"}
            title={isEditing ? t("catalog.edit") : t("catalog.add")}
            leftIcon={isEditing ? "pencil" : "plus"}
            className="px-6 rounded-2xl h-11"
            size="sm"
            onPress={() => onPress?.(service)}
          />
        </View>
      </View>
    </Pressable>
  );
}
