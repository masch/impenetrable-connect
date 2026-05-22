import {
  Venture,
  CreateVentureInput,
  UpdateVentureInput,
  MOCK_VENTURES,
  MOCK_VENTURE_MEMBERS,
} from "@repo/shared";
import env from "../config/env";
import { logger } from "./logger.service";
import { mapNetworkError, handleResponse } from "./api-utils";

const MOCK_DELAY_MS = 500;
const MOCK_CREATE_DELAY_MS = 800;
const MOCK_MUTATION_DELAY_MS = 600;
const HTTP_NOT_FOUND = 404;
const ID_OFFSET = 1;
const NOT_FOUND_INDEX = -1;

/**
 * Venture Service Interface
 * Defines all CRUD operations for ventures.
 */
export interface VentureServiceInterface {
  getVentures(): Promise<Venture[]>;
  getVentureById(id: number): Promise<Venture | null>;
  createVenture(venture: CreateVentureInput): Promise<Venture>;
  updateVenture(id: number, venture: UpdateVentureInput): Promise<Venture>;
  deleteVenture(id: number): Promise<boolean>;
  getVenturesByUserId(userId: string): Promise<Venture[]>;
  // Legacy method - kept for backward compatibility
  getVentureByUserId(userId: string): Promise<Venture | null>;
}

// Internal mock state to allow updates during the session
const mockVentures: Venture[] = [...MOCK_VENTURES];
let nextId = Math.max(...MOCK_VENTURES.map((v) => v.id)) + ID_OFFSET;

/**
 * 🛠️ MOCK Implementation
 */
export const MockVentureService: VentureServiceInterface = {
  getVentures: async () => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
    logger.info("[MOCK API] Fetched all ventures:", { count: mockVentures.length });
    return [...mockVentures];
  },

  getVentureById: async (id: number) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
    const venture = mockVentures.find((v) => v.id === id) || null;
    if (venture) {
      logger.info(`[MOCK API] Found venture ${id}:`, { name: venture.name });
    } else {
      logger.info(`[MOCK API] Venture ${id} not found`);
    }
    return venture;
  },

  createVenture: async (venture: CreateVentureInput) => {
    await new Promise((r) => setTimeout(r, MOCK_CREATE_DELAY_MS));

    const newVenture: Venture = {
      ...venture,
      id: nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
      zzz_members: [],
    };

    mockVentures.push(newVenture);
    logger.info("[MOCK API] Created venture:", newVenture);
    return newVenture;
  },

  updateVenture: async (id: number, data: UpdateVentureInput) => {
    await new Promise((r) => setTimeout(r, MOCK_MUTATION_DELAY_MS));

    const index = mockVentures.findIndex((v) => v.id === id);
    if (index === NOT_FOUND_INDEX) throw new Error("Venture not found");

    const updatedVenture = {
      ...mockVentures[index],
      ...data,
      updatedAt: new Date(),
    };

    mockVentures[index] = updatedVenture;

    logger.info(`[MOCK API] Updated venture ${id}:`, data as unknown as Record<string, unknown>);
    return updatedVenture;
  },

  deleteVenture: async (id: number) => {
    await new Promise((r) => setTimeout(r, MOCK_MUTATION_DELAY_MS));

    const index = mockVentures.findIndex((v) => v.id === id);
    if (index === NOT_FOUND_INDEX) {
      logger.info(`[MOCK API] Venture ${id} not found for deletion`);
      return false;
    }

    mockVentures.splice(index, 1);
    logger.info(`[MOCK API] Deleted venture ${id}`);
    return true;
  },

  getVenturesByUserId: async (userId: string) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));

    // Find all memberships
    const ventureIds = MOCK_VENTURE_MEMBERS.filter((m) => m.userId === userId).map(
      (m) => m.ventureId,
    );
    if (ventureIds.length === 0) return [];

    // Find all ventures
    return mockVentures.filter((v) => ventureIds.includes(v.id));
  },

  getVentureByUserId: async (userId: string) => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));

    // Find membership
    const membership = MOCK_VENTURE_MEMBERS.find((m) => m.userId === userId);
    if (!membership) return null;

    // Find venture
    return mockVentures.find((v) => v.id === membership.ventureId) || null;
  },
};

/**
 * 📡 REST API Implementation
 */
export const RestVentureService: VentureServiceInterface = {
  getVentures: async () => {
    try {
      const response = await fetch(`${env.API_URL}/ventures`);
      return handleResponse<Venture[]>(response, "errors.venture.fetch_failed");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  getVentureById: async (id: number) => {
    try {
      const response = await fetch(`${env.API_URL}/ventures/${id}`);
      if (response.status === HTTP_NOT_FOUND) return null;
      return handleResponse<Venture>(response, "errors.venture.fetch_failed");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  createVenture: async (venture: CreateVentureInput) => {
    try {
      const response = await fetch(`${env.API_URL}/ventures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venture),
      });
      return handleResponse<Venture>(response, "errors.venture.create_failed");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  updateVenture: async (id: number, data: UpdateVentureInput) => {
    try {
      const response = await fetch(`${env.API_URL}/ventures/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse<Venture>(response, "errors.venture.save_error");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  deleteVenture: async (id: number) => {
    try {
      const response = await fetch(`${env.API_URL}/ventures/${id}`, {
        method: "DELETE",
      });
      return response.ok;
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  getVenturesByUserId: async (userId: string) => {
    try {
      const response = await fetch(`${env.API_URL}/ventures?userId=${userId}`);
      return handleResponse<Venture[]>(response, "errors.venture.fetch_failed");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },

  getVentureByUserId: async (userId: string) => {
    try {
      const response = await fetch(`${env.API_URL}/ventures?userId=${userId}`);
      if (response.status === HTTP_NOT_FOUND) return null;
      return handleResponse<Venture | null>(response, "errors.no_venture_found");
    } catch (error) {
      throw mapNetworkError(error);
    }
  },
};

/**
 * Smart Switch
 */
export const VentureService = env.USE_MOCKS ? MockVentureService : RestVentureService;
