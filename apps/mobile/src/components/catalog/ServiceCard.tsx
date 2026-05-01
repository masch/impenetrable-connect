import React from "react";
import { View, Text, Image } from "react-native";
import { Button } from "../Button";
import { CatalogItem, COLORS } from "@repo/shared";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslations } from "../../hooks/useI18n";
import { formatCurrency } from "../../logic/formatters";

interface ServiceCardProps {
  item: CatalogItem;
  onPress: () => void;
  categoryName?: string;
  className?: string;
}

/**
 * ServiceCard - Premium card for catalog items
 * Features 24dp corners and translucent category badges.
 */
export const ServiceCard = ({ item, onPress, categoryName, className = "" }: ServiceCardProps) => {
  const { t, getLocalizedName } = useTranslations();
  const name = getLocalizedName(item.zzz_name_i18n) || t("catalog.no_name");
  const description = item.zzz_description_i18n
    ? getLocalizedName(item.zzz_description_i18n)
    : t("catalog.no_description");

  return (
    <Button
      variant="ghost"
      onPress={onPress}
      className={`p-0 bg-surface-container-low rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm mb-4 ${className}`}
      accessibilityLabel={`${name}, ${item.zzz_price} pesos`}
      testID={`service-card-${item.zzz_id}`}
    >
      <View className="w-full">
        {/* Image Container */}
        <View className="h-48 w-full bg-surface-container-highest relative overflow-hidden">
          {item.zzz_image_url ? (
            <Image
              source={
                typeof item.zzz_image_url === "string"
                  ? { uri: item.zzz_image_url }
                  : item.zzz_image_url
              }
              className="absolute w-full h-full"
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <MaterialCommunityIcons
                name="image-off-outline"
                size={48}
                color={COLORS["outline-variant"]}
              />
            </View>
          )}

          {/* Translucent Badge */}
          {categoryName && (
            <View className="absolute top-3 left-3 bg-surface-container-highest/70 px-3 py-1.5 rounded-full border border-outline-variant/20">
              <Text className="text-[10px] font-display font-bold text-on-surface uppercase tracking-widest">
                {categoryName}
              </Text>
            </View>
          )}

          {/* Price Badge */}
          <View className="absolute bottom-3 right-3 bg-primary px-3 py-1.5 rounded-xl shadow-lg">
            <Text className="text-on-primary font-display font-bold">
              {formatCurrency(item.zzz_price)}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="p-5">
          <View className="flex-row justify-between items-start mb-2">
            <Text
              className="text-lg font-display font-bold text-on-surface flex-1 mr-2"
              numberOfLines={2}
            >
              {name}
            </Text>
            {item.zzz_max_participants && (
              <View className="flex-row items-center bg-secondary/10 px-2 py-1 rounded-lg">
                <MaterialCommunityIcons name="account-group" size={14} color={COLORS.secondary} />
                <Text className="text-[10px] font-bold text-secondary ml-1">
                  {item.zzz_max_participants}
                </Text>
              </View>
            )}
          </View>

          <Text
            className="text-sm font-body text-on-surface-variant/80 leading-5"
            numberOfLines={3}
          >
            {description}
          </Text>

          <View className="flex-row items-center mt-4 pt-4 border-t border-outline-variant/10">
            <Text className="text-[10px] font-display font-bold text-primary uppercase tracking-tighter">
              {t("catalog.view_details")}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.primary} />
          </View>
        </View>
      </View>
    </Button>
  );
};
