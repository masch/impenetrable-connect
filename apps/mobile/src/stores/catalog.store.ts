/**
 * Catalog Store (Zustand)
 * Manages tourist services and service categories.
 * The UI consumes this store, oblivious to whether the data comes from a mock or a real API.
 */

import { create } from "zustand";
import { CatalogServiceItem, Order, CatalogService } from "../services/catalog.service";
import { logger } from "../services/logger.service";
import { ServiceMoment } from "@repo/shared";

interface CatalogState {
  // Services data
  services: CatalogServiceItem[];
  selectedService: CatalogServiceItem | null;

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
    zzz_items: Array<{ zzz_catalog_item_id: number; zzz_quantity: number }>,
    guestCount: number,
    zzz_notes?: string,
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
      const services = await CatalogService.getServices();
      set({ services, isLoading: false });
    } catch (err: unknown) {
      logger.error("Error fetching services", err);
      set({ error: "Failed to fetch services", isLoading: false });
    }
  },

  // Fetch services by category ID
  fetchServicesByCategory: async (categoryId: number) => {
    set({ isLoading: true, error: null });
    try {
      const services = await CatalogService.getServicesByCategory(categoryId);
      set({ services, isLoading: false });
    } catch (err: unknown) {
      logger.error(`Error fetching services for category: ${categoryId}`, err);
      set({ error: "Failed to fetch services", isLoading: false });
    }
  },

  // Select a service by ID
  selectService: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const service = await CatalogService.getServiceById(id);
      set({ selectedService: service, isLoading: false });
    } catch (err: unknown) {
      logger.error(`Error fetching service with ID: ${id}`, err);
      set({ error: "Service not found", isLoading: false });
    }
  },

  // Clear selected service
  clearSelectedService: () => {
    set({ selectedService: null });
  },

  // Place a new order
  placeOrder: async (date, moment, items, guestCount, notes) => {
    set({ isSaving: true, error: null });
    try {
      const newOrder = await CatalogService.placeOrder(date, moment, items, guestCount, notes);
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
      const orders = await CatalogService.getOrders();
      set({ orders, isLoading: false });
    } catch (err: unknown) {
      logger.error("Error fetching orders", err);
      set({ error: "Failed to fetch orders", isLoading: false });
    }
  },
}));
