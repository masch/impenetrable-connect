/**
 * Tourist Catalog Screen
 * Displays available tourist services (gastronomy & excursions) with reservation capability
 */

import { useEffect, useState, useCallback } from "react";
import { Text, View, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslations } from "../../hooks/useI18n";
import Screen, { ScreenContent } from "../../components/Screen";
import { ServiceCard } from "../../components/ServiceCard";
import { SectionHeader } from "../../components/SectionHeader";
import { ReservationModal } from "../../components/ReservationModal";
import { useCatalogStore } from "../../stores/catalog.store";
import { useOrdersStore } from "../../stores/orders.store";
import { useAuthStore } from "../../stores/auth.store";
import type { CatalogServiceItem } from "../../mocks/catalog";
import type { TimeOfDay } from "@repo/shared";

export default function CatalogScreen() {
  const router = useRouter();
  const { t, getLocalizedName } = useTranslations();
  const store = useCatalogStore();
  const addOrderToStore = useOrdersStore((state) => state.addOrder);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect to home if not authenticated (route guard)
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/tourist");
    }
  }, [isAuthenticated, router]);

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<CatalogServiceItem | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  // Destructure for easier access - stable reference
  const { services, isLoading, error, fetchServices, createReservation } = store;

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  }, [fetchServices]);

  const handleServicePress = useCallback((service: CatalogServiceItem) => {
    setSelectedService(service);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedService(null);
  }, []);

  const handleReservation = useCallback(
    async (momentOfDay: TimeOfDay, quantity: number, date: Date, notes?: string) => {
      if (!selectedService) return;

      if (!isAuthenticated) {
        Alert.alert(t("errors.login_required_title"), t("errors.login_required_message"), [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("auth.login"),
            onPress: () => router.push("/tourist/login"),
          },
        ]);
        return;
      }

      setIsReserving(true);
      try {
        const result = await createReservation({
          serviceId: selectedService.id,
          momentOfDay,
          quantity,
          date,
          notes,
        });

        if (result) {
          handleCloseModal();
          // Also add to orders store so it shows immediately
          addOrderToStore(result);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        Alert.alert(t("errors.reservation_failed"), message);
      } finally {
        setIsReserving(false);
      }
    },
    [
      selectedService,
      isAuthenticated,
      createReservation,
      handleCloseModal,
      addOrderToStore,
      t,
      router,
    ],
  );

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
                    accessibilityLabel={getLocalizedName(service.name_i18n)}
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
                    accessibilityLabel={getLocalizedName(service.name_i18n)}
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

        {/* Reservation Modal - conditionally rendered only when needed */}
        {modalVisible && selectedService && (
          <ReservationModal
            visible={modalVisible}
            service={selectedService}
            onClose={handleCloseModal}
            onConfirm={handleReservation}
            isLoading={isReserving}
          />
        )}
      </ScreenContent>
    </Screen>
  );
}
