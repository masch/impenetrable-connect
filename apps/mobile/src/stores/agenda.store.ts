/**
 * Agenda Store (Zustand)
 * Manages entrepreneur agenda state
 */

import { create } from "zustand";
import type { Order } from "@repo/shared";
import { logger } from "../services/logger.service";
import { getMockAgendaOrders } from "../mocks/agenda";
import { mockGetCurrentUser } from "../services/auth-state";
import { getVentureIdsByUserId } from "../mocks/venture-members";
import { toISODate } from "../logic/formatters";

interface AgendaState {
  // Data
  orders: Order[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAgenda: (date: Date) => Promise<void>;
  getOccupationStats: (maxCapacity: number) => { occupied: number; total: number };
}

export const useAgendaStore = create<AgendaState>((set, get) => ({
  // Initial state
  orders: [],
  isLoading: false,
  error: null,

  // Fetch agenda (simulated with mock data filtered by date and venture)
  fetchAgenda: async (date: Date) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 300));

      const currentUser = mockGetCurrentUser();
      const dateStr = toISODate(date);

      // Dynamically resolve venture IDs for the current user
      const ventureIds = currentUser ? getVentureIdsByUserId(currentUser.id) : [];

      const filtered =
        ventureIds.length > 0
          ? getMockAgendaOrders(ventureIds).filter(
              (o) => toISODate(o.zzz_reservation?.zzz_service_date || new Date()) === dateStr,
            )
          : [];

      set({ orders: filtered, isLoading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error("Error fetching agenda", { error: errorMessage });
      set({ error: "Failed to fetch agenda", isLoading: false });
    }
  },

  // Calculate occupation stats for current orders in state
  getOccupationStats: (maxCapacity: number) => {
    const totalOccupied = get().orders.reduce((sum, order) => {
      const itemsSum = order.zzz_items?.reduce((iSum, item) => iSum + item.zzz_quantity, 0) || 0;
      return sum + itemsSum;
    }, 0);
    return {
      occupied: totalOccupied,
      total: maxCapacity,
    };
  },
}));
