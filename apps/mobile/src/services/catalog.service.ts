/**
 * Catalog Service - Tourist Services
 * Follows the mock + REST switch pattern from project.service.ts
 *
 * Uses @repo/shared CatalogItem type aligned with OpenSpec Catalog_Item entity
 */

import { z } from "zod";
import type { ZodIssue, ZodSchema } from "zod";
import { MOCK_CATALOG_SERVICES, type CatalogServiceItem } from "../mocks/catalog";
import { logger } from "./logger.service";
import env from "../config/env";

// Re-export for convenience
export type { CatalogServiceItem };

// Validation schemas for catalog operations
export const CreateReservationSchema = z.object({
  serviceId: z.number(),
  momentOfDay: z.enum(["Desayuno", "Almuerzo", "Merienda", "Cena"]),
  quantity: z.number().min(1).max(20),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;

export interface Reservation {
  id: number;
  serviceId: number;
  serviceName: string;
  momentOfDay: string;
  quantity: number;
  date: string;
  notes?: string;
  createdAt: string;
}

/**
 * Validate data using Zod schemas
 */
function validateData<S extends ZodSchema>(data: unknown, schema: S): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues
      .map((i: ZodIssue) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
}

/**
 * Common interface for catalog service implementations
 */
export interface CatalogServiceInterface {
  getServices(): Promise<CatalogServiceItem[]>;
  getServiceById(id: number): Promise<CatalogServiceItem | null>;
  getServicesByCategory(catalogTypeId: number): Promise<CatalogServiceItem[]>;
  createReservation(reservation: CreateReservationInput): Promise<Reservation>;
  getReservations(): Promise<Reservation[]>;
}

/**
 * 🛠️ MOCK Implementation (Used during design/MVP phase)
 */
const mockServices = [...MOCK_CATALOG_SERVICES];
let mockReservations: Reservation[] = [];
let nextReservationId = 1;

const MockCatalogService: CatalogServiceInterface = {
  getServices: async () => {
    await new Promise((r) => setTimeout(r, 800));
    return [...mockServices];
  },

  getServiceById: async (id: number) => {
    await new Promise((r) => setTimeout(r, 500));
    return mockServices.find((s) => s.id === id) || null;
  },

  getServicesByCategory: async (catalogTypeId: number) => {
    await new Promise((r) => setTimeout(r, 600));
    return mockServices.filter((s) => s.catalog_type_id === catalogTypeId);
  },

  createReservation: async (reservation: CreateReservationInput) => {
    await new Promise((r) => setTimeout(r, 800));
    const validated = validateData(reservation, CreateReservationSchema);
    const service = mockServices.find((s) => s.id === validated.serviceId);

    if (!service) {
      throw new Error("Service not found");
    }

    // Get localized name from name_i18n
    const serviceName = service.name_i18n.es || service.name_i18n.en || "Sin nombre";

    const newReservation: Reservation = {
      id: nextReservationId++,
      serviceId: validated.serviceId,
      serviceName,
      momentOfDay: validated.momentOfDay,
      quantity: validated.quantity,
      date: validated.date || new Date().toISOString().split("T")[0],
      notes: validated.notes,
      createdAt: new Date().toISOString(),
    };

    mockReservations = [...mockReservations, newReservation];
    logger.info(
      "[MOCK API] Created reservation:",
      newReservation as unknown as Record<string, unknown>,
    );
    return newReservation;
  },

  getReservations: async () => {
    await new Promise((r) => setTimeout(r, 500));
    return [...mockReservations];
  },
};

/**
 * 📡 REST API Implementation (Future)
 */
const RestCatalogService: CatalogServiceInterface = {
  getServices: async () => {
    const response = await fetch(`${env.API_URL}/services`);
    if (!response.ok) throw new Error("API error fetching services");
    return response.json();
  },

  getServiceById: async (id: number) => {
    const response = await fetch(`${env.API_URL}/services/${id}`);
    if (!response.ok) throw new Error("API error fetching service by ID");
    return response.json();
  },

  getServicesByCategory: async (catalogTypeId: number) => {
    const response = await fetch(`${env.API_URL}/services?catalog_type_id=${catalogTypeId}`);
    if (!response.ok) throw new Error("API error fetching services by category");
    return response.json();
  },

  createReservation: async (reservation: CreateReservationInput) => {
    const response = await fetch(`${env.API_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservation),
    });
    if (!response.ok) throw new Error("API error creating reservation");
    return response.json();
  },

  getReservations: async () => {
    const response = await fetch(`${env.API_URL}/reservations`);
    if (!response.ok) throw new Error("API error fetching reservations");
    return response.json();
  },
};

/**
 * EXPORT: The smart switch
 */
export const CatalogService = env.USE_MOCKS ? MockCatalogService : RestCatalogService;
