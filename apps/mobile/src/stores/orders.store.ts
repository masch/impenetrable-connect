/**
 * Orders Store (Zustand)
 * Manages tourist orders (active and history)
 * In-memory state that persists while the app is open
 */

import { create } from "zustand";
import type { Order } from "@repo/shared";
import { orderService } from "../services/order.service";
import { logger } from "../services/logger.service";

interface OrdersState {
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
  setTab: (tab: "active" | "history") => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  // Initial state
  activeOrders: [],
  historyOrders: [],
  isLoading: false,
  error: null,
  selectedTab: "active",

  // Fetch all orders and split into active/history
  fetchOrders: async () => {
    // Always clear existing orders first to avoid showing previous user's orders
    set({ activeOrders: [], historyOrders: [], isLoading: true, error: null });
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

      // Always replace orders (not append) to handle user changes correctly
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
      // After cancelling, refresh the orders to update the lists
      await get().fetchOrders();
    } catch (err) {
      logger.error(`Error cancelling order ${orderId}`, err);
      set({ error: "Failed to cancel order", isLoading: false });
    }
  },

  // Add a single order (used after creation to avoid full refetch)
  addOrder: (order: Order) => {
    const isActive = ["SEARCHING", "OFFER_PENDING", "CONFIRMED"].includes(order.global_status);
    if (isActive) {
      set((state) => ({ activeOrders: [order, ...state.activeOrders] }));
    } else {
      set((state) => ({ historyOrders: [order, ...state.historyOrders] }));
    }
  },

  // Set the selected tab
  setTab: (tab: "active" | "history") => {
    set({ selectedTab: tab });
  },
}));
