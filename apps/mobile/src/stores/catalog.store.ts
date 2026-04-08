/**
 * Catalog Store (Zustand)
 * Manages tourist services and reservations
 * The UI consumes this store, oblivious to whether the data comes from a mock or a real API.
 */

import { create } from "zustand";
import {
  CatalogServiceItem,
  Reservation,
  CreateReservationInput,
  CatalogService,
} from "../services/catalog.service";
import { logger } from "../services/logger.service";

interface CatalogState {
  // Services data
  services: CatalogServiceItem[];
  selectedService: CatalogServiceItem | null;

  // Reservations data
  reservations: Reservation[];

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions - Services
  fetchServices: () => Promise<void>;
  fetchServicesByCategory: (catalogTypeId: number) => Promise<void>;
  selectService: (id: number) => Promise<void>;
  clearSelectedService: () => void;

  // Actions - Reservations
  createReservation: (reservation: CreateReservationInput) => Promise<Reservation | null>;
  fetchReservations: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  // Initial state
  services: [],
  selectedService: null,
  reservations: [],
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

  // Create a reservation
  createReservation: async (reservation: CreateReservationInput) => {
    set({ isSaving: true, error: null });
    try {
      const newReservation = await CatalogService.createReservation(reservation);
      const currentReservations = get().reservations;
      set({ reservations: [...currentReservations, newReservation], isSaving: false });
      return newReservation;
    } catch (err) {
      logger.error("Error creating reservation", err);
      set({ error: "Failed to create reservation", isSaving: false });
      return null;
    }
  },

  // Fetch all reservations
  fetchReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      const reservations = await CatalogService.getReservations();
      set({ reservations, isLoading: false });
    } catch (err) {
      logger.error("Error fetching reservations", err);
      set({ error: "Failed to fetch reservations", isLoading: false });
    }
  },
}));
