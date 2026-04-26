/**
 * Agenda Store (Zustand)
 * Manages entrepreneur agenda state
 */

import { create } from "zustand";
import type { Order } from "@repo/shared";
import { logger } from "../services/logger.service";
import { getMockAgendaOrders } from "../mocks/agenda";
import { useAuthStore } from "./auth.store";
import { getVentureIdsByUserId } from "../mocks/venture-members";
import { toISODate } from "../logic/formatters";
import { CatalogService } from "../services/catalog.service";

interface AgendaState {
  // Data
  allOrders: Order[];
  orders: Order[];
  pendingOrders: Order[];

  // UI state
  isLoading: boolean;
  isLoadingPending: boolean;
  error: string | null;

  fetchAgenda: (date: Date) => Promise<void>;
  fetchPendingOrders: () => Promise<void>;
  acceptOrder: (orderId: number) => Promise<void>;
  declineOrder: (orderId: number) => Promise<void>;
  getOccupationStats: (maxCapacity: number) => { occupied: number; total: number };
  getDayCount: (date: Date) => number;
  reset: () => void;
}

export const useAgendaStore = create<AgendaState>((set, get) => ({
  // Initial state
  allOrders: [],
  orders: [],
  pendingOrders: [],
  isLoading: false,
  isLoadingPending: false,
  error: null,

  // Fetch agenda (simulated with mock data filtered by date and venture)
  fetchAgenda: async (date: Date) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 300));

      const currentUser = useAuthStore.getState().currentUser;
      const dateStr = toISODate(date);

      // Dynamically resolve venture IDs for the current user
      const ventureIds = currentUser ? getVentureIdsByUserId(currentUser.id) : [];

      const allFetched = ventureIds.length > 0 ? getMockAgendaOrders(ventureIds) : [];

      const filtered = allFetched.filter(
        (o) =>
          toISODate(o.zzz_reservation?.zzz_service_date || new Date()) === dateStr &&
          o.zzz_global_status === "CONFIRMED",
      );

      set({
        allOrders: allFetched,
        orders: filtered,
        isLoading: false,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error("Error fetching agenda", { error: errorMessage });
      set({ error: "Failed to fetch agenda", isLoading: false });
    }
  },

  fetchPendingOrders: async () => {
    set({ isLoadingPending: true, error: null });
    try {
      const currentUser = useAuthStore.getState().currentUser;
      const allOrders = await CatalogService.getOrders(currentUser?.id);
      const ventureIds = currentUser ? getVentureIdsByUserId(currentUser.id) : [];

      const pending = allOrders.filter(
        (o) =>
          o.zzz_global_status === "OFFER_PENDING" &&
          (ventureIds.includes(Number(o.zzz_confirmed_venture_id)) ||
            ventureIds.includes(Number(o.zzz_current_offer_venture_id))),
      );

      set({ pendingOrders: pending, isLoadingPending: false });
    } catch (err: unknown) {
      logger.error("Error fetching pending orders", err);
      set({ error: "Failed to fetch pending orders", isLoadingPending: false });
    }
  },

  acceptOrder: async (orderId: number) => {
    try {
      await CatalogService.updateOrderStatus(orderId, "CONFIRMED");
      // Optimistic update or just re-fetch
      set((state) => ({
        pendingOrders: state.pendingOrders.filter((o) => Number(o.zzz_id) !== orderId),
        orders: state.orders.map((o) =>
          Number(o.zzz_id) === orderId ? { ...o, zzz_global_status: "CONFIRMED" } : o,
        ),
      }));
    } catch (err: unknown) {
      logger.error("Error accepting order", err);
    }
  },

  declineOrder: async (orderId: number) => {
    try {
      await CatalogService.updateOrderStatus(orderId, "CANCELLED");
      set((state) => ({
        pendingOrders: state.pendingOrders.filter((o) => Number(o.zzz_id) !== orderId),
        orders: state.orders.map((o) =>
          Number(o.zzz_id) === orderId ? { ...o, zzz_global_status: "CANCELLED" } : o,
        ),
      }));
    } catch (err: unknown) {
      logger.error("Error declining order", err);
    }
  },

  // Calculate occupation stats for current orders in state
  getOccupationStats: (maxCapacity: number) => {
    const totalOccupied = get()
      .orders.filter((o) => o.zzz_global_status !== "CANCELLED")
      .reduce((sum, order) => {
        const guestCount = order.zzz_reservation?.zzz_guest_count || 1;
        return sum + guestCount;
      }, 0);
    return {
      occupied: totalOccupied,
      total: maxCapacity,
    };
  },

  getDayCount: (date: Date) => {
    const dateStr = toISODate(date);
    return get().allOrders.filter(
      (o) =>
        toISODate(o.zzz_reservation?.zzz_service_date || new Date()) === dateStr &&
        o.zzz_global_status === "CONFIRMED",
    ).length;
  },

  reset: () => {
    set({
      allOrders: [],
      orders: [],
      pendingOrders: [],
      isLoading: false,
      isLoadingPending: false,
      error: null,
    });
  },
}));
