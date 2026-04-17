/**
 * Tourist Catalog Screen
 * Displays available tourist services (gastronomy & excursions) with reservation capability
 */

import { useEffect, useState, useCallback, useMemo, type ComponentProps } from "react";
import { Text, View, ScrollView, RefreshControl, ActivityIndicator, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTranslations } from "../../hooks/useI18n";
import Screen, { ScreenContent } from "../../components/Screen";
import { ServiceCard } from "../../components/ServiceCard";
import { ReservationModal } from "../../components/ReservationModal";
import { AppAlert, type AppAlertAction } from "../../components/AppAlert";
import { useCatalogStore } from "../../stores/catalog.store";
import { useOrdersStore } from "../../stores/orders.store";
import { useAuthStore } from "../../stores/auth.store";
import { CatalogService } from "../../services/catalog.service";
import { logger } from "../../services/logger.service";
import { COLORS, type Order, type TimeOfDay } from "@repo/shared";
import type { CatalogServiceItem } from "../../mocks/catalog";
import { useOrderContextStore } from "../../stores/order-context.store";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable as NativePressable } from "react-native";
import { MOMENTS_OF_DAY } from "../../constants/moments";
import { Button } from "../../components/Button";

export default function CatalogScreen() {
  const router = useRouter();
  const { t, getLocalizedName } = useTranslations();
  const services = useCatalogStore((state) => state.services);
  const isLoading = useCatalogStore((state) => state.isLoading);
  const error = useCatalogStore((state) => state.error);
  const fetchServices = useCatalogStore((state) => state.fetchServices);
  const createReservation = useCatalogStore((state) => state.createReservation);

  const fetchOrders = useOrdersStore((state) => state.fetchOrders);
  const addOrderToStore = useOrdersStore((state) => state.addOrder);
  const updateOrderInStore = useOrdersStore((state) => state.updateOrder);
  const activeOrders = useOrdersStore((state) => state.activeOrders);
  const cancelOrder = useOrdersStore((state) => state.cancelOrder);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isValidContext = useOrderContextStore((state) => state.isValid);
  const selectedDate = useOrderContextStore((state) => state.selectedDate);
  const selectedMoment = useOrderContextStore((state) => state.selectedMoment);

  const currentMoment = useMemo(
    () => MOMENTS_OF_DAY.find((m) => m.id === selectedMoment),
    [selectedMoment],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/tourist");
      return;
    }

    if (!isValidContext()) {
      router.replace("/tourist");
    }
  }, [isAuthenticated, isValidContext, router]);

  const getRelativeDateLabel = (date: Date | null): string => {
    if (!date) return "";

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    const isTomorrow =
      date.getFullYear() === tomorrow.getFullYear() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getDate() === tomorrow.getDate();

    if (isToday) return t("orders.today");
    if (isTomorrow) return t("orders.tomorrow");

    return date.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    });
  };

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<CatalogServiceItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    actions: AppAlertAction[];
    type?: "info" | "error" | "alert" | "confirm";
  }>({
    visible: false,
    title: "",
    message: "",
    actions: [],
  });

  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Fetch services and orders on mount
  useEffect(() => {
    fetchServices();
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [fetchServices, fetchOrders, isAuthenticated]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  }, [fetchServices]);

  const handleEditOrder = useCallback((order: Order) => {
    if (!order.catalog_item) return;
    setSelectedService(order.catalog_item as CatalogServiceItem);
    setEditingOrder(order);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedService(null);
    setEditingOrder(null);
  }, []);

  const handleServicePress = useCallback(
    (service: CatalogServiceItem) => {
      // Check if this service is already in the current context's order
      const existingOrder = activeOrders.find((order) => {
        if (Number(order.catalog_item_id) !== Number(service.id)) return false;

        const oDate = new Date(order.service_date);
        const cDate = new Date(selectedDate!);
        const isSameDay = oDate.toISOString().split("T")[0] === cDate.toISOString().split("T")[0];
        const isSameMoment =
          String(order.time_of_day).trim().toUpperCase() ===
          String(selectedMoment).trim().toUpperCase();

        return isSameDay && isSameMoment;
      });

      if (existingOrder) {
        handleEditOrder(existingOrder);
      } else {
        setSelectedService(service);
        setEditingOrder(null);
        setModalVisible(true);
      }
    },
    [activeOrders, selectedDate, selectedMoment, handleEditOrder],
  );

  const handleDeleteOrder = useCallback(
    async (orderId: number) => {
      setIsSubmitting(true);
      try {
        await cancelOrder(orderId);
        handleCloseModal();
      } catch (error) {
        logger.error("Error removing order", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [cancelOrder, handleCloseModal],
  );

  const handleReservation = useCallback(
    async (
      momentOfDay: TimeOfDay,
      quantity: number,
      date: Date,
      notes?: string,
      orderId?: number,
    ) => {
      if (!selectedService) return;

      if (!isAuthenticated) {
        setAlertConfig({
          visible: true,
          title: t("errors.login_required_title"),
          message: t("errors.login_required_message"),
          actions: [
            {
              text: t("common.cancel"),
              style: "cancel",
              onPress: () => {},
            },
            {
              text: t("common.login"),
              variant: "primary",
              onPress: () => router.push("/tourist/login"),
            },
          ],
        });
        return;
      }

      setIsSubmitting(true);

      // Close modal immediately for better UX
      handleCloseModal();

      try {
        if (orderId) {
          const updatedOrder = await CatalogService.updateReservation(Number(orderId), {
            quantity,
            notes,
          });

          // Optimistically update the store
          updateOrderInStore(updatedOrder);
        } else {
          logger.info("[CATALOG] Creating new order");
          const newOrder = await createReservation({
            serviceId: selectedService.id,
            momentOfDay,
            quantity,
            date,
            notes,
          });

          if (newOrder) {
            addOrderToStore(newOrder);
          }
        }

        // Refresh from service
        await fetchOrders();
      } catch (err) {
        logger.error("Reservation failed", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        setAlertConfig({
          visible: true,
          title: t("errors.reservation_failed"),
          message,
          type: "error",
          actions: [
            {
              text: t("common.ok"),
              variant: "primary",
              onPress: () => {},
            },
          ],
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      selectedService,
      isAuthenticated,
      createReservation,
      fetchOrders,
      handleCloseModal,
      t,
      router,
      addOrderToStore,
      updateOrderInStore,
    ],
  );

  // Get active items for the current context for UI markers and summary
  const contextOrders = useMemo(() => {
    if (!selectedDate || !selectedMoment || !activeOrders) return [];

    return activeOrders.filter((order) => {
      const oDateStr = new Date(order.service_date).toISOString().split("T")[0];
      const cDateStr = new Date(selectedDate).toISOString().split("T")[0];
      const isSameDay = oDateStr === cDateStr;
      const isSameMoment =
        String(order.time_of_day).trim().toUpperCase() ===
        String(selectedMoment).trim().toUpperCase();
      return isSameDay && isSameMoment;
    });
  }, [activeOrders, selectedDate, selectedMoment]);

  const contextServiceIds = useMemo(() => {
    return new Set(contextOrders.map((o) => Number(o.catalog_item_id)));
  }, [contextOrders]);

  const totalAmount = useMemo(() => {
    return contextOrders.reduce((acc, curr) => acc + curr.price_at_purchase * curr.quantity, 0);
  }, [contextOrders]);

  const totalQuantity = useMemo(() => {
    return contextOrders.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [contextOrders]);

  // Group services by catalog_type_id: 1 = Gastronomy, 2 = Excursions
  const gastronomyServices = services.filter((s) => s.catalog_type_id === 1);
  const excursionServices = services.filter((s) => s.catalog_type_id === 2);

  return (
    <Screen>
      <ScreenContent className={contextOrders.length > 0 ? "pb-24" : "pb-4"}>
        {/* Header */}
        <View className="pt-2 pb-6">
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-1">
              <Text className="text-4xl font-display font-bold text-on-surface">
                {t("catalog.title")}
              </Text>
            </View>

            <Button
              onPress={() => router.push("/tourist/profile")}
              variant="secondary"
              leftIcon="cog-outline"
              iconColor={COLORS.primary}
              className="w-12 h-12 rounded-2xl border border-outline-variant/30 shadow-sm p-0 px-0"
            />
          </View>
        </View>

        {error && (
          <View className="bg-error-container p-4 mb-4">
            <Text className="text-base font-body text-on-error-container">{error}</Text>
          </View>
        )}

        {isLoading && services.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="text-base font-body text-on-surface opacity-60 mt-4">
              {t("loading")}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
              />
            }
          >
            {/* Gastronomy Section */}
            {gastronomyServices.length > 0 && (
              <View className="mb-4">
                {gastronomyServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isEditing={contextServiceIds.has(Number(service.id))}
                    onPress={handleServicePress}
                    accessibilityLabel={getLocalizedName(service.name_i18n)}
                  />
                ))}
              </View>
            )}

            {/* Excursions Section */}
            {excursionServices.length > 0 && (
              <View className="mb-4">
                {excursionServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isEditing={contextServiceIds.has(Number(service.id))}
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
            key={editingOrder ? `edit-${editingOrder.id}` : "new-order"}
            visible={modalVisible}
            service={selectedService}
            onClose={handleCloseModal}
            onConfirm={handleReservation}
            onDelete={handleDeleteOrder}
            isLoading={isSubmitting}
            editingOrder={editingOrder}
          />
        )}

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
                if (orderToDelete) cancelOrder(orderToDelete);
              },
            },
          ]}
        />

        <AppAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
          actions={alertConfig.actions}
        />

        {/* Sticky Footer - Confirm Order Button */}
        {contextOrders.length > 0 && (
          <View className="absolute bottom-0 left-0 right-0">
            <View
              className={`bg-surface-solid border-t border-outline-variant ${Platform.OS === "web" ? "pb-6" : "pb-0"} pt-0.5 px-4 shadow-2xl`}
            >
              {/* Collapsed/Expanded Content */}
              <View className="pt-1 pb-1">
                {/* Order Summary List (Expanded) */}

                {showOrderSummary && (
                  <ScrollView
                    className="max-h-48 mb-4 border-b border-outline-variant/20 pb-2"
                    showsVerticalScrollIndicator={false}
                  >
                    {contextOrders.map((order) => {
                      const service = services.find((s) => s.id === order.catalog_item_id);
                      const name = service ? getLocalizedName(service.name_i18n) : "---";
                      return (
                        <View
                          key={order.id}
                          className="flex-row items-center border-b border-outline-variant/10 last:border-0"
                        >
                          <NativePressable
                            onPress={() => handleEditOrder(order)}
                            className="flex-1 flex-row items-center justify-between py-1.5"
                            style={({ pressed }) => (pressed ? { opacity: 0.6 } : {})}
                          >
                            <View className="flex-1 mr-3">
                              <Text
                                className="text-sm font-body text-on-surface-variant font-medium"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {name}
                              </Text>
                            </View>
                            <View className="flex-row items-center">
                              <Text className="text-[10px] font-display font-bold text-primary uppercase tracking-tighter mr-2 bg-primary/5 px-2 py-0.5 rounded-md">
                                x{order.quantity}
                              </Text>
                              <Text className="text-sm font-display font-bold text-on-surface mr-3">
                                $ {order.price_at_purchase.toLocaleString("es-AR")}
                              </Text>
                              <View className="w-7 h-7 bg-surface-container-high rounded-full items-center justify-center border border-outline-variant/20">
                                <MaterialCommunityIcons
                                  name="pencil"
                                  size={14}
                                  color={COLORS.primary}
                                />
                              </View>
                            </View>
                          </NativePressable>

                          <NativePressable
                            testID={`order-delete-button-${order.id}`}
                            onPress={() => {
                              setOrderToDelete(order.id);
                              setDeleteAlertVisible(true);
                            }}
                            hitSlop={12}
                            className="p-2 ml-1"
                            style={({ pressed }) => (pressed ? { opacity: 0.6 } : {})}
                          >
                            <MaterialCommunityIcons
                              name="trash-can-outline"
                              size={18}
                              color={COLORS.error}
                            />
                          </NativePressable>
                        </View>
                      );
                    })}
                  </ScrollView>
                )}

                <View className="flex-row items-center justify-between mt-1 py-1">
                  {/* Left: Interactive Summary & Total */}
                  <NativePressable
                    onPress={() => setShowOrderSummary(!showOrderSummary)}
                    className="flex-row items-center"
                    style={({ pressed }) => (pressed ? { opacity: 0.7 } : {})}
                  >
                    <View>
                      <View className="flex-row items-center gap-1">
                        <Text className="text-[9px] font-display font-bold text-primary uppercase tracking-tighter opacity-80">
                          {t("catalog.reservation.total_items", { count: totalQuantity })}
                        </Text>
                        <MaterialCommunityIcons
                          name={showOrderSummary ? "chevron-down" : "chevron-up"}
                          size={10}
                          color={COLORS.primary}
                        />
                      </View>
                      <Text className="text-lg font-display font-bold text-on-surface -mt-1">
                        $ {totalAmount.toLocaleString("es-AR")}
                      </Text>
                    </View>
                  </NativePressable>

                  {/* Right: Session Info & Confirm Action */}
                  <View className="flex-row items-center gap-2">
                    <Button
                      variant="secondary"
                      className="flex-row items-center p-0 px-2.5 h-10 rounded-xl border border-outline-variant/30 bg-surface-container-solid"
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.replace("/tourist");
                      }}
                    >
                      <MaterialCommunityIcons
                        name="calendar-month-outline"
                        size={12}
                        color={COLORS.primary}
                        className="opacity-80"
                      />
                      <Text className="text-[9px] font-display font-bold text-on-surface-variant uppercase tracking-tighter ml-1">
                        {getRelativeDateLabel(selectedDate)}
                      </Text>

                      <View className="w-[1px] h-3 bg-outline-variant/30 mx-1.5" />

                      {currentMoment && (
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name={
                              currentMoment.icon as ComponentProps<
                                typeof MaterialCommunityIcons
                              >["name"]
                            }
                            size={12}
                            color={currentMoment.hex}
                          />
                        </View>
                      )}
                    </Button>

                    <Button
                      title={t("orders.confirm")}
                      variant="primary"
                      className="px-4 h-10 rounded-xl"
                      size="sm"
                      onPress={() => {
                        setAlertConfig({
                          visible: true,
                          title: t("catalog.reservation.confirm_order_title"),
                          message: `${t("catalog.reservation.confirm_order_message")}`,
                          type: "confirm",
                          actions: [
                            {
                              text: t("common.cancel"),
                              style: "cancel",
                              onPress: () => {},
                            },
                            {
                              text: t("common.confirm"),
                              variant: "primary",
                              onPress: () => {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                router.push("/tourist/orders");
                              },
                            },
                          ],
                        });
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScreenContent>
    </Screen>
  );
}
