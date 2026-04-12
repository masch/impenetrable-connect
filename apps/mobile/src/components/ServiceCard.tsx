/**
 * ServiceCard Component
 * Displays a tourist service (gastronomy or excursion) with image, details, and reservation action
 */

import { Text, View, Pressable } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../hooks/useI18n";
import { CATALOG_TYPE_IDS } from "../mocks/catalog";
import type { CatalogServiceItem } from "../mocks/catalog";
import { CatalogImage } from "./CatalogImage";

interface ServiceCardProps {
  service: CatalogServiceItem;
  onPress?: (service: CatalogServiceItem) => void;
  accessibilityLabel?: string;
}

export function ServiceCard({ service, onPress, accessibilityLabel }: ServiceCardProps) {
  const { t, locale } = useTranslations();
  const formatPrice = (price: number) => {
    return `$ ${price.toLocaleString("es-AR")}`;
  };

  // Get category from catalog_type_id: 1 = gastronomy, 2 = excursion
  const isGastronomy = service.catalog_type_id === CATALOG_TYPE_IDS.GASTRONOMY;
  const categoryIcon = (
    isGastronomy ? "silverware-fork-knife" : "nature-people"
  ) as keyof typeof MaterialCommunityIcons.glyphMap;
  const categoryLabel = isGastronomy
    ? t("catalog.category.gastronomy")
    : t("catalog.category.excursion");

  // Get localized name/description using active locale with fallback chain
  const name =
    service.name_i18n[locale as keyof typeof service.name_i18n] ||
    service.name_i18n.es ||
    service.name_i18n.en ||
    t("catalog.no_name");
  const description =
    service.description_i18n?.[locale as keyof typeof service.description_i18n] ||
    service.description_i18n?.es ||
    service.description_i18n?.en ||
    t("catalog.no_description");

  return (
    <Pressable
      className="bg-surface-container-low mb-4 overflow-hidden"
      onPress={() => onPress?.(service)}
      accessible
      accessibilityLabel={accessibilityLabel || name}
    >
      {/* Image */}
      <View className="h-40 w-full bg-surface-container-highest items-center justify-center overflow-hidden">
        {service.image_url ? (
          <CatalogImage imageUrl={service.image_url} alt={name} />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <MaterialCommunityIcons name="image-off" size={40} color="outline-variant" />
          </View>
        )}
        {/* Category badge */}
        <View className="absolute top-3 left-3 bg-secondary px-3 py-1 flex-row items-center gap-1">
          <MaterialCommunityIcons name={categoryIcon} size={14} color="on-secondary" />
          <Text className="text-xs font-body text-on-secondary">{categoryLabel}</Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-display font-bold text-on-surface flex-1 pr-2">{name}</Text>
          <Text className="text-lg font-display font-bold text-primary">
            {formatPrice(service.price)}
          </Text>
        </View>

        <Text className="text-sm font-body text-on-surface opacity-70 mb-3" numberOfLines={2}>
          {description}
        </Text>

        {/* Details row */}
        <View className="flex-row gap-4">
          {service.max_participants && (
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons name="account-group" size={16} color="secondary" />
              <Text className="text-sm font-body text-secondary">
                {service.max_participants} {t("catalog.participants")}
              </Text>
            </View>
          )}
          {service.schedule && (
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons name="calendar-clock" size={16} color="secondary" />
              <Text className="text-sm font-body text-secondary">{service.schedule}</Text>
            </View>
          )}
        </View>

        {/* CTA */}
        <View className="mt-4">
          <View className="bg-primary py-3 px-4 flex-row items-center justify-center gap-2">
            <MaterialCommunityIcons name="calendar-plus" size={18} color="on-primary" />
            <Text className="text-base font-body font-bold text-on-primary">
              {t("catalog.reserve")}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
