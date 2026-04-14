/**
 * Catalog Store (Zustand)
 * Manages tourist services and reservations
 * The UI consumes this store, oblivious to whether the data comes from a mock or a real API.
 */

import { create } from "zustand";
import {
  CatalogServiceItem,
  Order,
  CreateReservationInput,
  CatalogService,
} from "../services/catalog.service";
import { logger } from "../services/logger.service";

interface CatalogState {
  // Services data
  services: CatalogServiceItem[];
  selectedService: CatalogServiceItem | null;

  // Orders created from reservations
  orders: Order[];

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions - Services
  fetchServices: () => Promise<void>;
  fetchServicesByCategory: (catalogTypeId: number) => Promise<void>;
  selectService: (id: number) => Promise<void>;
  clearSelectedService: () => void;

  // Actions - Orders
  createReservation: (reservation: CreateReservationInput) => Promise<Order | null>;
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
    } catch (err) {
      logger.error("Error fetching services", err);
      set({ error: "Failed to fetch services", isLoading: false });
    }
  },

  // Fetch services by catalog_type_id (1 = Gastronomy, 2 = Excursions)
  fetchServicesByCategory: async (catalogTypeId: number) => {
    set({ isLoading: true, error: null });
    try {
      const services = await CatalogService.getServicesByCategory(catalogTypeId);
      set({ services, isLoading: false });
    } catch (err) {
      logger.error(`Error fetching services for catalog_type_id: ${catalogTypeId}`, err);
      set({ error: "Failed to fetch services", isLoading: false });
    }
  },

  // Select a service by ID
  selectService: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const service = await CatalogService.getServiceById(id);
      set({ selectedService: service, isLoading: false });
    } catch (err) {
      logger.error(`Error fetching service with ID: ${id}`, err);
      set({ error: "Service not found", isLoading: false });
    }
  },

  // Clear selected service
  clearSelectedService: () => {
    set({ selectedService: null });
  },

  // Create an Order from a reservation input
  createReservation: async (reservation: CreateReservationInput) => {
    set({ isSaving: true, error: null });
    try {
      const newOrder = await CatalogService.createReservation(reservation);
      const currentOrders = get().orders;
      set({ orders: [...currentOrders, newOrder], isSaving: false });

      // Sync with orders store - MUST be done in useEffect, not during render
      // The caller should use useEffect to sync after the order is created
      // useOrdersStore.getState().addOrder(newOrder);

      return newOrder;
    } catch (err) {
      logger.error("Error creating order", err);
      set({ error: "Failed to create order", isSaving: false });
      return null;
    }
  },

  // Fetch all orders for this user
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await CatalogService.getOrders();
      set({ orders, isLoading: false });
    } catch (err) {
      logger.error("Error fetching orders", err);
      set({ error: "Failed to fetch orders", isLoading: false });
    }
  },
}));
