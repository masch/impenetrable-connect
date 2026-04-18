/**
 * Reservation Store (Zustand)
 * Manages tourist orders (active and history).
 * Renamed from useOrdersStore to follow the domain model where Orders belong to a Reservation.
 */

import { create } from "zustand";
import type { Order, ServiceMoment } from "@repo/shared";
import { orderService } from "../services/order.service";
import { logger } from "../services/logger.service";

interface ReservationState {
  // Data
  activeOrders: Order[];
  historyOrders: Order[];

  // UI state
  isLoading: boolean;
  error: string | null;
  selectedTab: "active" | "history";

  // Actions
  fetchOrders: () => Promise<void>;
  cancelOrder: (orderId: number) => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  moveOrders: (orderIds: number[], newDate: Date, newMoment: ServiceMoment) => Promise<void>;
  setTab: (tab: "active" | "history") => void;
}

export const useReservationStore = create<ReservationState>((set, get) => ({
  // Initial state
  activeOrders: [],
  historyOrders: [],
  isLoading: false,
  error: null,
  selectedTab: "active",

  // Fetch all orders and split into active/history
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await orderService.getOrders();

      // Filter active orders: SEARCHING, OFFER_PENDING, CONFIRMED
      const active = orders
        .filter((order) =>
          ["SEARCHING", "OFFER_PENDING", "CONFIRMED"].includes(order.global_status),
        )
        .sort((a, b) => new Date(a.service_date).getTime() - new Date(b.service_date).getTime());

      // Filter history orders: COMPLETED, CANCELLED, NO_SHOW, EXPIRED
      const history = orders
        .filter((order) =>
          ["COMPLETED", "CANCELLED", "NO_SHOW", "EXPIRED"].includes(order.global_status),
        )
        .sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime());

      set({ activeOrders: active, historyOrders: history, isLoading: false });
    } catch (err) {
      logger.error("Error fetching orders", err);
      set({ error: "Failed to fetch orders", isLoading: false });
    }
  },

  // Cancel an order
  cancelOrder: async (orderId: number) => {
    set({ isLoading: true, error: null });
    try {
      await orderService.cancelOrder(orderId);
      await get().fetchOrders();
    } catch (err) {
      logger.error(`Error cancelling order ${orderId}`, err);
      set({ error: "Failed to cancel order", isLoading: false });
    }
  },

  // Add a single order
  addOrder: (order: Order) => {
    const isActive = ["SEARCHING", "OFFER_PENDING", "CONFIRMED"].includes(order.global_status);
    if (isActive) {
      set((state) => ({ activeOrders: [order, ...state.activeOrders] }));
    } else {
      set((state) => ({ historyOrders: [order, ...state.historyOrders] }));
    }
  },

  // Update a single order
  updateOrder: (order: Order) => {
    set((state) => ({
      activeOrders: state.activeOrders.map((o) =>
        Number(o.id) === Number(order.id) ? { ...o, ...order } : o,
      ),
      historyOrders: state.historyOrders.map((o) =>
        Number(o.id) === Number(order.id) ? { ...o, ...order } : o,
      ),
    }));
  },

  // Set the selected tab
  setTab: (tab: "active" | "history") => {
    set({ selectedTab: tab });
  },

  // Move orders to a new context
  moveOrders: async (orderIds: number[], newDate: Date, newMoment: ServiceMoment) => {
    set({ isLoading: true, error: null });
    try {
      const { CatalogService } = await import("../services/catalog.service");
      for (const id of orderIds) {
        await CatalogService.updateOrder(id, {
          date: newDate,
          moment: newMoment,
        });
      }
      await get().fetchOrders();
    } catch (err) {
      logger.error("Error moving orders", err);
      set({ error: "Failed to move orders", isLoading: false });
    }
  },
}));
