/**
 * Catalog Store (Zustand)
 * Manages tourist services and service categories.
 * The UI consumes this store, oblivious to whether the data comes from a mock or a real API.
 */

import { create } from "zustand";
import type { ServiceMoment, HourMinute, Order } from "@repo/shared";
import type { ProductItem } from "../services/product.service";
import { ProductService } from "../services/product.service";
import { logger } from "../services/logger.service";

export interface CatalogState {
  // Services data
  services: ProductItem[];
  selectedService: ProductItem | null;

  // Orders created during the session
  orders: Order[];

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions - Services
  fetchServices: () => Promise<void>;
  fetchServicesByCategory: (categoryId: number) => Promise<void>;
  selectService: (zzz_id: number) => Promise<void>;
  clearSelectedService: () => void;

  // Actions - Orders
  placeOrder: (
    date: Date,
    moment: ServiceMoment,
    items: Array<{ zzz_catalog_item_id: number; zzz_quantity: number; zzz_notes?: string }>,
    guestCount: number,
    time: HourMinute,
    notes?: string,
  ) => Promise<Order | null>;
  fetchOrders: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  // Initial state
  services: [],
  selectedService: null,
  orders: [],
  isLoading: false,
  isSaving: false,
  error: null,

  // Fetch all services
  fetchServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const services = await ProductService.getServices();
      set({ services, isLoading: false });
    } catch (err: unknown) {
      logger.error("Error fetching services", {
        error: err instanceof Error ? err.message : String(err),
      });
      set({ error: "Failed to fetch services", isLoading: false });
    }
  },

  // Fetch services by category ID
  fetchServicesByCategory: async (categoryId: number) => {
    set({ isLoading: true, error: null });
    try {
      const services = await ProductService.getServicesByCategory(categoryId);
      set({ services, isLoading: false });
    } catch (err: unknown) {
      logger.error(`Error fetching services for category: ${categoryId}`, {
        error: err instanceof Error ? err.message : String(err),
      });
      set({ error: "Failed to fetch services", isLoading: false });
    }
  },

  // Select a service by ID
  selectService: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const service = await ProductService.getServiceById(id);
      set({ selectedService: service, isLoading: false });
    } catch (err: unknown) {
      logger.error(`Error fetching service with ID: ${id}`, {
        error: err instanceof Error ? err.message : String(err),
      });
      set({ error: "Service not found", isLoading: false });
    }
  },

  // Clear selected service
  clearSelectedService: () => {
    set({ selectedService: null });
  },

  // Place a new order
  placeOrder: async (
    date: Date,
    moment: ServiceMoment,
    items: Array<{ zzz_catalog_item_id: number; zzz_quantity: number; zzz_notes?: string }>,
    guestCount: number,
    time: HourMinute,
    notes?: string,
  ) => {
    set({ isSaving: true, error: null });
    try {
      const newOrder = await ProductService.placeOrder(
        date,
        moment,
        items,
        guestCount,
        notes,
        time,
      );
      const currentOrders = get().orders;
      if (newOrder) {
        set({ orders: [...currentOrders, newOrder], isSaving: false });
      } else {
        set({ isSaving: false });
      }

      return newOrder;
    } catch (err: unknown) {
      logger.error("Error placing order", err);
      set({ error: "Failed to place order", isSaving: false });
      return null;
    }
  },

  // Fetch all orders for this user
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await ProductService.getOrders();
      set({ orders, isLoading: false });
    } catch (err: unknown) {
      logger.error("Error fetching orders", err);
      set({ error: "Failed to fetch orders", isLoading: false });
    }
  },
}));
