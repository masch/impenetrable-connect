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
import { ProductService } from "../services/product.service";

const SIMULATED_DELAY_MS = 300;

export interface AgendaState {
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
  acceptOrder: (orderId: string) => Promise<void>;
  declineOrder: (orderId: string) => Promise<void>;
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
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

      const currentUser = useAuthStore.getState().currentUser;
      const dateStr = toISODate(date);

      // Dynamically resolve venture IDs for the current user
      const ventureIds = currentUser ? getVentureIdsByUserId(currentUser.id) : [];

      const allFetched = ventureIds.length > 0 ? getMockAgendaOrders(ventureIds) : [];

      const filtered = allFetched.filter((o) => {
        const serviceAt = o.zzz_reservation?.zzz_service_at;
        if (!serviceAt) {
          throw new Error(`Order ${o.zzz_id} is missing zzz_service_at`);
        }
        return toISODate(serviceAt) === dateStr && o.zzz_global_status === "CONFIRMED";
      });

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
      const allOrders = await ProductService.getOrders(currentUser?.id);
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

  acceptOrder: async (orderId: string) => {
    try {
      await ProductService.updateOrderStatus(orderId, "CONFIRMED");
      // Optimistic update or just re-fetch
      set((state) => ({
        pendingOrders: state.pendingOrders.filter((o) => o.zzz_id !== orderId),
        orders: state.orders.map((o) =>
          o.zzz_id === orderId ? { ...o, zzz_global_status: "CONFIRMED" } : o,
        ),
      }));
    } catch (err: unknown) {
      logger.error("Error accepting order", err);
    }
  },

  declineOrder: async (orderId: string) => {
    try {
      await ProductService.updateOrderStatus(orderId, "CANCELLED");
      set((state) => ({
        pendingOrders: state.pendingOrders.filter((o) => o.zzz_id !== orderId),
        orders: state.orders.map((o) =>
          o.zzz_id === orderId ? { ...o, zzz_global_status: "CANCELLED" } : o,
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
    return get().allOrders.filter((o) => {
      const serviceAt = o.zzz_reservation?.zzz_service_at;
      if (!serviceAt) {
        throw new Error(`Order ${o.zzz_id} is missing zzz_service_at`);
      }
      return toISODate(serviceAt) === dateStr && o.zzz_global_status === "CONFIRMED";
    }).length;
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
