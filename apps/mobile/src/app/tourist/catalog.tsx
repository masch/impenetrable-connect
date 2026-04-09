/**
 * Tourist Catalog Screen
 * Displays available tourist services (gastronomy & excursions) with reservation capability
 */

import { useEffect, useState, useCallback } from "react";
import { Text, View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useI18n } from "../../hooks/useI18n";
import Screen, { ScreenContent } from "../../components/Screen";
import { ServiceCard } from "../../components/ServiceCard";
import { SectionHeader } from "../../components/SectionHeader";
import { ReservationModal } from "../../components/ReservationModal";
import { useCatalogStore } from "../../stores/catalog.store";
import type { CatalogServiceItem } from "../../mocks/catalog";

export default function CatalogScreen() {
  const { t } = useI18n();
  const { services, isLoading, error, fetchServices, createReservation } = useCatalogStore();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<CatalogServiceItem | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  }, [fetchServices]);

  const handleServicePress = (service: CatalogServiceItem) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const handleReservation = async (momentOfDay: string, quantity: number, notes?: string) => {
    if (!selectedService) return;

    setIsReserving(true);
    const result = await createReservation({
      serviceId: selectedService.id,
      momentOfDay: momentOfDay as "Desayuno" | "Almuerzo" | "Merienda" | "Cena",
      quantity,
      notes,
    });
    setIsReserving(false);

    if (result) {
      setModalVisible(false);
      setSelectedService(null);
    }
  };

  // Group services by catalog_type_id: 1 = Gastronomy, 2 = Excursions
  const gastronomyServices = services.filter((s) => s.catalog_type_id === 1);
  const excursionServices = services.filter((s) => s.catalog_type_id === 2);

  return (
    <Screen>
      <ScreenContent className="pb-20">
        {/* Header */}
        <View className="py-6">
          <Text className="text-3xl font-display font-bold text-on-surface">
            {t("catalog.title")}
          </Text>
          <Text className="text-base font-body text-on-surface opacity-60 mt-1">
            {t("catalog.subtitle")}
          </Text>
        </View>

        {error && (
          <View className="bg-error-container p-4 mb-4">
            <Text className="text-base font-body text-on-error-container">{error}</Text>
          </View>
        )}

        {isLoading && services.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="primary" />
            <Text className="text-base font-body text-on-surface opacity-60 mt-4">
              {t("loading")}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="primary" />
            }
          >
            {/* Gastronomy Section */}
            {gastronomyServices.length > 0 && (
              <View className="mb-6">
                <SectionHeader
                  title={t("catalog.gastronomy")}
                  subtitle={t("catalog.gastronomy_subtitle")}
                  icon="silverware-fork-knife"
                />
                {gastronomyServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onPress={handleServicePress}
                    accessibilityLabel={`${service.name_i18n.es || service.name_i18n.en}`}
                  />
                ))}
              </View>
            )}

            {/* Excursions Section */}
            {excursionServices.length > 0 && (
              <View className="mb-6">
                <SectionHeader
                  title={t("catalog.excursions")}
                  subtitle={t("catalog.excursions_subtitle")}
                  icon="nature-people"
                />
                {excursionServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onPress={handleServicePress}
                    accessibilityLabel={`${service.name_i18n.es || service.name_i18n.en}`}
                  />
                ))}
              </View>
            )}

            {/* Empty state */}
            {services.length === 0 && (
              <View className="py-20 items-center">
                <Text className="text-xl font-display font-bold text-on-surface opacity-40">
                  {t("catalog.empty")}
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Reservation Modal */}
        <ReservationModal
          visible={modalVisible}
          service={selectedService}
          onClose={() => {
            setModalVisible(false);
            setSelectedService(null);
          }}
          onConfirm={handleReservation}
          isLoading={isReserving}
        />
      </ScreenContent>
    </Screen>
  );
}
