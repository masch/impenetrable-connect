/**
 * Tourist Booking Screen
 * Displays available tourist services grouped by categories with booking capability.
 */

import { useEffect, useState, useCallback, useMemo, type ComponentProps } from "react";
import { Text, View, ScrollView, RefreshControl, Platform } from "react-native";
import {
  impactAsync,
  notificationAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from "expo-haptics";
import { useRouter } from "expo-router";
import { useTranslations } from "../../hooks/useI18n";
import { formatCurrency, getRelativeDateLabel, isSameDay } from "../../logic/formatters";
import Screen, { ScreenContent } from "../../components/Screen";
import LoadingView from "../../components/LoadingView";
import { ServiceCard } from "../../components/ServiceCard";
import { ReservationModal } from "../../components/ReservationModal";
import { AppAlert, type AppAlertAction } from "../../components/AppAlert";
import { useCatalogStore } from "../../stores/catalog.store";
import { useReservationStore } from "../../stores/reservation.store";
import { useAuthStore } from "../../stores/auth.store";
import { CatalogService } from "../../services/catalog.service";
import { logger } from "../../services/logger.service";
import { COLORS, type Order, type ServiceMoment } from "@repo/shared";
import type { CatalogServiceItem } from "../../mocks/catalog";
import { useCartStore } from "../../stores/cart.store";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SERVICE_MOMENTS } from "../../constants/moments";
import { Button } from "../../components/Button";

export default function BookingScreen() {
  const router = useRouter();
  const { t, getLocalizedName } = useTranslations();
  const services = useCatalogStore((state) => state.services);
  const isLoading = useCatalogStore((state) => state.isLoading);
  const error = useCatalogStore((state) => state.error);
  const fetchServices = useCatalogStore((state) => state.fetchServices);
  const placeOrder = useCatalogStore((state) => state.placeOrder);

  const fetchOrders = useReservationStore((state) => state.fetchOrders);
  const addOrderToStore = useReservationStore((state) => state.addOrder);
  const updateOrderInStore = useReservationStore((state) => state.updateOrder);
  const activeOrders = useReservationStore((state) => state.activeOrders);
  const cancelOrder = useReservationStore((state) => state.cancelOrder);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    isValid: isValidContext,
    selectedDate,
    selectedMoment,
    cartItems,
    addItem,
    removeItem,
    clearCart,
  } = useCartStore();

  const currentMoment = useMemo(
    () => SERVICE_MOMENTS.find((m) => m.zzz_id === selectedMoment),
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

  const relativeDateLabel = getRelativeDateLabel(selectedDate, t);

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<CatalogServiceItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
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

  const handleEditOrder = useCallback(
    (order: Order) => {
      const firstItem = order.zzz_items?.[0];
      if (!firstItem) return;

      const service = services.find((s) => s.zzz_id === firstItem.zzz_catalog_item_id);
      if (!service) return;

      setSelectedService(service);
      setEditingOrder(order);
      setModalVisible(true);
    },
    [services],
  );

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedService(null);
    setEditingOrder(null);
  }, []);

  const handleServicePress = useCallback(
    (service: CatalogServiceItem) => {
      const existingOrder = activeOrders.find((order) => {
        const hasItem = order.zzz_items?.some(
          (item) => Number(item.zzz_catalog_item_id) === Number(service.zzz_id),
        );
        if (!hasItem) return false;

        const oDate = new Date(order.zzz_reservation?.zzz_service_date || 0);
        if (!selectedDate) return false;
        const isSameDayResult = isSameDay(oDate, selectedDate);
        const isSameMoment = order.zzz_reservation?.zzz_time_of_day === selectedMoment;

        return isSameDayResult && isSameMoment;
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
    async (orderId?: number) => {
      // If no orderId, it's a cart item
      if (!orderId) {
        if (selectedService) {
          removeItem(selectedService.zzz_id);
          setModalVisible(false);
        }
        return;
      }

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
    [cancelOrder, handleCloseModal, removeItem, selectedService],
  );

  const handleBooking = useCallback(
    async (moment: ServiceMoment, zzz_quantity: number, date: Date, zzz_notes?: string) => {
      if (!selectedService) return;
      const orderId = editingOrder?.zzz_id;

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
      handleCloseModal();

      try {
        if (orderId) {
          const updatedOrder = await CatalogService.updateOrder(Number(orderId), {
            zzz_quantity,
            zzz_notes,
          });
          updateOrderInStore(updatedOrder);
        } else {
          logger.info("[BOOKING] Adding item to cart");
          addItem({
            zzz_catalog_item_id: selectedService.zzz_id,
            zzz_quantity,
            zzz_price: selectedService.zzz_price,
          });
          impactAsync(ImpactFeedbackStyle.Medium);
        }

        await fetchOrders();
      } catch (err) {
        logger.error("Booking failed", err);
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
      fetchOrders,
      handleCloseModal,
      t,
      router,
      addItem,
      updateOrderInStore,
      editingOrder,
    ],
  );

  const contextServiceIds = useMemo(() => {
    return new Set(cartItems.map((i) => i.zzz_catalog_item_id));
  }, [cartItems]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.zzz_price * item.zzz_quantity, 0);
  }, [cartItems]);

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.zzz_quantity, 0);
  }, [cartItems]);

  // Group services by category: 1 = Gastronomy, 2 = Excursions
  const gastronomyServices = services.filter((s) => s.zzz_catalog_category_id === 1);
  const excursionServices = services.filter((s) => s.zzz_catalog_category_id === 2);

  return (
    <Screen>
      <ScreenContent className={cartItems.length > 0 ? "pb-24" : "pb-4"}>
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
          <LoadingView className="py-20" />
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
                    key={service.zzz_id}
                    service={service}
                    isEditing={contextServiceIds.has(Number(service.zzz_id))}
                    onPress={handleServicePress}
                    accessibilityLabel={getLocalizedName(service.zzz_name_i18n)}
                  />
                ))}
              </View>
            )}

            {/* Excursions Section */}
            {excursionServices.length > 0 && (
              <View className="mb-4">
                {excursionServices.map((service) => (
                  <ServiceCard
                    key={service.zzz_id}
                    service={service}
                    isEditing={contextServiceIds.has(Number(service.zzz_id))}
                    onPress={handleServicePress}
                    accessibilityLabel={getLocalizedName(service.zzz_name_i18n)}
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
        {modalVisible && selectedService && (
          <ReservationModal
            key={
              selectedService?.zzz_id ? `service-${selectedService.zzz_id}` : "reservation-modal"
            }
            visible={modalVisible}
            service={selectedService}
            onClose={handleCloseModal}
            onConfirm={handleBooking}
            onDelete={() => handleDeleteOrder(editingOrder?.zzz_id)}
            isLoading={isSubmitting}
            initialNotes={editingOrder?.zzz_notes || undefined}
            initialQuantity={
              selectedService
                ? editingOrder
                  ? editingOrder.zzz_items?.find(
                      (i) => Number(i.zzz_catalog_item_id) === Number(selectedService.zzz_id),
                    )?.zzz_quantity
                  : cartItems.find(
                      (i) => Number(i.zzz_catalog_item_id) === Number(selectedService.zzz_id),
                    )?.zzz_quantity
                : undefined
            }
            mode={
              editingOrder ||
              cartItems.some(
                (i) => Number(i.zzz_catalog_item_id) === Number(selectedService?.zzz_id),
              )
                ? "edit"
                : "add"
            }
          />
        )}

        <AppAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
          actions={alertConfig.actions}
        />

        {/* Sticky Footer - Confirm Order Button */}
        {cartItems.length > 0 && (
          <View className="absolute bottom-0 left-0 right-0">
            <View
              className={`bg-surface-solid border-t border-outline-variant ${Platform.OS === "web" ? "pb-6" : "pb-0"} pt-0.5 px-4 shadow-2xl`}
            >
              <View className="pt-1 pb-1">
                {showOrderSummary && (
                  <ScrollView
                    className="max-h-48 mb-4 border-b border-outline-variant/20 pb-2"
                    showsVerticalScrollIndicator={false}
                  >
                    {cartItems.map((item) => {
                      const service = services.find((s) => s.zzz_id === item.zzz_catalog_item_id);
                      const name = service ? getLocalizedName(service.zzz_name_i18n) : "---";
                      return (
                        <View
                          key={item.zzz_catalog_item_id}
                          className="flex-row items-center border-b border-outline-variant/10 last:border-0"
                        >
                          <Button
                            variant="ghost"
                            onPress={() => {
                              if (service) handleServicePress(service);
                            }}
                            className="flex-1 flex-row items-center justify-between py-1.5 rounded-none"
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
                                x{item.zzz_quantity}
                              </Text>
                              <Text className="text-sm font-display font-bold text-on-surface mr-3">
                                {formatCurrency(item.zzz_price * item.zzz_quantity)}
                              </Text>
                              <View className="w-7 h-7 bg-surface-container-high rounded-full items-center justify-center border border-outline-variant/20">
                                <MaterialCommunityIcons
                                  name="pencil"
                                  size={14}
                                  color={COLORS.primary}
                                />
                              </View>
                            </View>
                          </Button>

                          <Button
                            variant="ghost"
                            onPress={() => {
                              setAlertConfig({
                                visible: true,
                                title: t("catalog.reservation.remove_confirm_title"),
                                message: t("catalog.reservation.remove_confirm_message"),
                                type: "alert",
                                actions: [
                                  {
                                    text: t("common.cancel"),
                                    style: "cancel",
                                    onPress: () => {},
                                  },
                                  {
                                    text: t("common.confirm"),
                                    variant: "danger",
                                    onPress: () => {
                                      removeItem(item.zzz_catalog_item_id);
                                      impactAsync(ImpactFeedbackStyle.Light);
                                    },
                                  },
                                ],
                              });
                            }}
                            className="p-2 ml-1 min-w-0"
                          >
                            <MaterialCommunityIcons
                              name="trash-can-outline"
                              size={18}
                              color={COLORS.error}
                            />
                          </Button>
                        </View>
                      );
                    })}
                  </ScrollView>
                )}

                <View className="flex-row items-center justify-between mt-1 py-1">
                  <Button
                    variant="ghost"
                    onPress={() => setShowOrderSummary(!showOrderSummary)}
                    className="flex-row items-center min-w-0 p-0"
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
                        {formatCurrency(totalAmount)}
                      </Text>
                    </View>
                  </Button>

                  <View className="flex-row items-center gap-2">
                    <Button
                      variant="secondary"
                      className="flex-row items-center p-0 px-2.5 h-10 rounded-xl border border-outline-variant/30 bg-surface-container-solid"
                      onPress={() => {
                        impactAsync(ImpactFeedbackStyle.Light);
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
                        {relativeDateLabel}
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
                              onPress: async () => {
                                if (!selectedDate || !selectedMoment) return;
                                setIsSubmitting(true);
                                try {
                                  const newOrder = await placeOrder(
                                    selectedDate,
                                    selectedMoment,
                                    cartItems.map((i) => ({
                                      zzz_catalog_item_id: i.zzz_catalog_item_id,
                                      zzz_quantity: i.zzz_quantity,
                                    })),
                                    useCartStore.getState().guestCount,
                                  );
                                  if (newOrder) {
                                    addOrderToStore(newOrder);
                                    clearCart();
                                    notificationAsync(NotificationFeedbackType.Success);
                                    router.push("/tourist/orders");
                                  }
                                } catch (err) {
                                  logger.error("Final confirmation failed", err);
                                } finally {
                                  setIsSubmitting(false);
                                }
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
