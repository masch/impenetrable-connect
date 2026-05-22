import { create } from "zustand";
import { Venture, CreateVentureInput, UpdateVentureInput } from "@repo/shared";
import { VentureService } from "../services/venture.service";
import { logger } from "../services/logger.service";
import { mapNetworkError } from "../services/api-utils";

interface VentureState {
  ventures: Venture[];
  userVentures: Venture[];
  selectedVenture: Venture | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchVentures: () => Promise<void>;
  fetchVenturesByUserId: (userId: string) => Promise<void>;
  selectVenture: (id: number) => Promise<void>;
  createVenture: (venture: CreateVentureInput) => Promise<Venture | null>;
  updateVenture: (id: number, venture: UpdateVentureInput) => Promise<Venture | null>;
  deleteVenture: (id: number) => Promise<boolean>;
  setSelectedVenture: (venture: Venture | null) => void;
}

/**
 * Venture Store (Zustand)
 * Centralizes venture state management, replacing scattered direct service calls.
 * Works with both mock and REST service implementations.
 */
export const useVentureStore = create<VentureState>((set, get) => ({
  ventures: [],
  userVentures: [],
  selectedVenture: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchVentures: async () => {
    set({ isLoading: true, error: null });
    try {
      const ventures = await VentureService.getVentures();
      set({ ventures, isLoading: false });
    } catch (err: unknown) {
      logger.error("Error fetching ventures", err);
      set({ error: mapNetworkError(err).message, isLoading: false });
    }
  },

  fetchVenturesByUserId: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const userVentures = await VentureService.getVenturesByUserId(userId);
      set({ userVentures, isLoading: false });
    } catch (err: unknown) {
      logger.error("Error fetching ventures by user", err);
      set({ error: mapNetworkError(err).message, isLoading: false });
    }
  },

  selectVenture: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const venture = await VentureService.getVentureById(id);
      set({ selectedVenture: venture, isLoading: false });
    } catch (err: unknown) {
      logger.error(`Error fetching venture with ID: ${id}`, err);
      set({ error: "Venture not found", isLoading: false });
    }
  },

  createVenture: async (venture: CreateVentureInput) => {
    set({ isSaving: true, error: null });
    try {
      const newVenture = await VentureService.createVenture(venture);
      const currentVentures = get().ventures;
      set({ ventures: [...currentVentures, newVenture], isSaving: false });
      return newVenture;
    } catch (err: unknown) {
      logger.error("Error creating venture", err);
      set({ error: "Failed to create venture", isSaving: false });
      return null;
    }
  },

  updateVenture: async (id: number, venture: UpdateVentureInput) => {
    set({ isSaving: true, error: null });
    try {
      const updatedVenture = await VentureService.updateVenture(id, venture);
      const currentVentures = get().ventures;
      const updatedList = currentVentures.map((v) => (v.id === id ? updatedVenture : v));
      set({ ventures: updatedList, selectedVenture: updatedVenture, isSaving: false });
      return updatedVenture;
    } catch (err: unknown) {
      logger.error(`Error updating venture with ID: ${id}`, err);
      set({ error: "Failed to update venture", isSaving: false });
      return null;
    }
  },

  deleteVenture: async (id: number) => {
    set({ isSaving: true, error: null });
    try {
      const success = await VentureService.deleteVenture(id);
      if (success) {
        const currentVentures = get().ventures;
        set({
          ventures: currentVentures.filter((v) => v.id !== id),
          selectedVenture: null,
          isSaving: false,
        });
      } else {
        set({ isSaving: false });
      }
      return success;
    } catch (err: unknown) {
      logger.error(`Error deleting venture with ID: ${id}`, err);
      set({ error: "Failed to delete venture", isSaving: false });
      return false;
    }
  },

  setSelectedVenture: (venture: Venture | null) => {
    set({ selectedVenture: venture });
  },
}));
