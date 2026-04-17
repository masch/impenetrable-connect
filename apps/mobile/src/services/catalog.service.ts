/**
 * Catalog Service - Tourist Services
 * Follows the mock + REST switch pattern from project.service.ts
 *
 * Uses @repo/shared CatalogItem + Order types aligned with OpenSpec entities.
 * createReservation() builds an Order directly — there is no intermediate Reservation entity.
 */

import { z } from "zod";
import type { ZodIssue, ZodSchema } from "zod";
import type { Order } from "@repo/shared";
import { TimeOfDaySchema } from "@repo/shared";
import { MOCK_CATALOG_SERVICES, type CatalogServiceItem } from "../mocks/catalog";
import { addMockOrder, getMockOrders, updateMockOrder } from "../mocks/orders";
import { getMockUserId, isMockUserLoggedIn } from "../mocks/users";
import { logger } from "./logger.service";
import env from "../config/env";

// Re-export for convenience
export type { CatalogServiceItem };
export type { Order };

// Validation schemas for catalog operations
export const CreateReservationSchema = z.object({
  serviceId: z.number(),
  momentOfDay: TimeOfDaySchema,
  quantity: z.number().min(1).max(20),
  date: z.date(),
  notes: z.string().optional(),
});

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;

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
  createReservation(reservation: CreateReservationInput): Promise<Order>;
  updateReservation(id: number, reservation: Partial<CreateReservationInput>): Promise<Order>;
  getOrders(): Promise<Order[]>;
}

/**
 * 🛠️ MOCK Implementation (Used during design/MVP phase)
 */
const mockServices = [...MOCK_CATALOG_SERVICES];
// NOTE: This is a shallow copy for read-only access, not state mutation
// Mock services and state management handled via mocks/orders.ts helper functions

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
    // Require user to be logged in
    if (!isMockUserLoggedIn()) {
      throw new Error("User must be logged in to create a reservation");
    }

    await new Promise((r) => setTimeout(r, 800));
    const validated = validateData(reservation, CreateReservationSchema);
    const service = mockServices.find((s) => s.id === validated.serviceId);

    if (!service) {
      throw new Error("Service not found");
    }

    const newOrder: Order = {
      id: Date.now(),
      user_id: getMockUserId(), // use shared mock user state
      catalog_item_id: service.id,
      catalog_item: service,
      quantity: validated.quantity,
      price_at_purchase: service.price * validated.quantity,
      confirmed_venture_id: null,
      service_date: validated.date,
      time_of_day: validated.momentOfDay,
      guest_count: validated.quantity,
      notes: validated.notes ?? null,
      global_status: "SEARCHING",
      cancel_reason: null,
      cancelled_at: null,
      completed_at: null,
      confirmed_at: null,
      created_at: new Date(),
      notify_whatsapp: false,
    };

    addMockOrder(newOrder);
    logger.info(
      "[MOCK API] Created order from reservation:",
      newOrder as unknown as Record<string, unknown>,
    );
    return newOrder;
  },

  updateReservation: async (id: number, reservation: Partial<CreateReservationInput>) => {
    await new Promise((r) => setTimeout(r, 600));

    const existingOrders = getMockOrders();
    const order = existingOrders.find((o) => Number(o.id) === Number(id));
    if (!order) throw new Error("Order not found");

    const updates: Partial<Order> = {};
    if (reservation.quantity) {
      updates.quantity = reservation.quantity;
      updates.guest_count = reservation.quantity;
      const servicePrice = order.catalog_item?.price || 0;
      updates.price_at_purchase = servicePrice * reservation.quantity;
    }
    if (reservation.notes !== undefined) {
      updates.notes = reservation.notes;
    }
    if (reservation.date) {
      updates.service_date = reservation.date;
    }
    if (reservation.momentOfDay) {
      updates.time_of_day = reservation.momentOfDay;
    }

    updateMockOrder(Number(id), updates);

    return { ...order, ...updates };
  },

  getOrders: async () => {
    await new Promise((r) => setTimeout(r, 500));
    return getMockOrders();
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
    const response = await fetch(`${env.API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        catalog_item_id: reservation.serviceId,
        time_of_day: reservation.momentOfDay,
        guest_count: reservation.quantity,
        quantity: reservation.quantity,
        service_date: reservation.date ?? new Date().toISOString().split("T")[0],
        notes: reservation.notes ?? null,
      }),
    });
    if (!response.ok) throw new Error("API error creating order");
    return response.json();
  },

  updateReservation: async (id: number, reservation: Partial<CreateReservationInput>) => {
    const response = await fetch(`${env.API_URL}/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity: reservation.quantity,
        notes: reservation.notes,
      }),
    });
    if (!response.ok) throw new Error("API error updating order");
    return response.json();
  },

  getOrders: async () => {
    const response = await fetch(`${env.API_URL}/orders`);
    if (!response.ok) throw new Error("API error fetching orders");
    return response.json();
  },
};

/**
 * EXPORT: The smart switch
 */
export const CatalogService = env.USE_MOCKS ? MockCatalogService : RestCatalogService;
