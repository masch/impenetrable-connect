/**
 * Catalog Service - Tourist Services
 * Follows the mock + REST switch pattern from project.service.ts
 *
 * Uses @repo/shared CatalogItem + Order types aligned with OpenSpec entities.
 * placeOrder() builds an Order directly — there is no intermediate Reservation entity in the DB yet.
 */

import { z } from "zod";

import type { Order, ServiceMoment } from "@repo/shared";
import { ServiceMomentSchema } from "@repo/shared";
import { MOCK_CATALOG_SERVICES, type CatalogServiceItem } from "../mocks/catalog";
import { addMockOrder, getMockOrders, updateMockOrder } from "../mocks/orders";
import { isMockUserLoggedIn } from "../mocks/users";
import { logger } from "./logger.service";
import env from "../config/env";

// Re-export for convenience
export type { CatalogServiceItem };
export type { Order };

// Validation schemas for booking operations
export const BookingInputSchema = z.object({
  serviceId: z.number(),
  moment: ServiceMomentSchema,
  quantity: z.number().min(1).max(20),
  date: z.date(),
  notes: z.string().optional(),
});

export type BookingInput = z.infer<typeof BookingInputSchema>;

/**
 * Common interface for catalog service implementations
 */
export interface CatalogServiceInterface {
  getServices(): Promise<CatalogServiceItem[]>;
  getServiceById(id: number): Promise<CatalogServiceItem | null>;
  getServicesByCategory(categoryId: number): Promise<CatalogServiceItem[]>;
  placeOrder(
    date: Date,
    moment: ServiceMoment,
    items: Array<{ catalog_item_id: number; quantity: number }>,
    notes?: string,
  ): Promise<Order>;
  updateOrder(id: number, input: Partial<BookingInput>): Promise<Order>;
  getOrders(): Promise<Order[]>;
}

/**
 * 🛠️ MOCK Implementation (Used during design/MVP phase)
 */
const mockServices = [...MOCK_CATALOG_SERVICES];

const MockCatalogService: CatalogServiceInterface = {
  getServices: async () => {
    await new Promise((r) => setTimeout(r, 800));
    return [...mockServices];
  },

  getServiceById: async (id: number) => {
    await new Promise((r) => setTimeout(r, 500));
    return mockServices.find((s) => s.id === id) || null;
  },

  getServicesByCategory: async (categoryId: number) => {
    await new Promise((r) => setTimeout(r, 600));
    return mockServices.filter((s) => s.catalog_category_id === categoryId);
  },

  placeOrder: async (
    date: Date,
    moment: ServiceMoment,
    items: Array<{ catalog_item_id: number; quantity: number }>,
    notes?: string,
  ) => {
    // Require user to be logged in
    if (!isMockUserLoggedIn()) {
      throw new Error("User must be logged in to place an order");
    }

    await new Promise((r) => setTimeout(r, 800));

    if (items.length === 0) {
      throw new Error("Cannot place an order without items");
    }

    // Use the first item's category as the order's primary category (MVP constraint)
    const firstService = mockServices.find((s) => s.id === items[0].catalog_item_id);
    if (!firstService) throw new Error("Service not found");

    const orderId = Date.now();

    const newOrder: Order = {
      id: orderId,
      reservation_id: Math.floor(Math.random() * 100000),
      catalog_type_id: firstService.catalog_category_id,
      confirmed_venture_id: null,
      notes: notes ?? null,
      global_status: "SEARCHING",
      cancel_reason: null,
      items: items.map((item) => {
        const s = mockServices.find((service) => service.id === item.catalog_item_id);
        return {
          id: Math.floor(Math.random() * 100000),
          order_id: orderId,
          catalog_item_id: item.catalog_item_id,
          quantity: item.quantity,
          price: s?.price || 0,
        };
      }),
      cancelled_at: null,
      completed_at: null,
      confirmed_at: null,
      created_at: new Date(),
      notify_whatsapp: false,
    };

    addMockOrder(newOrder);
    logger.info(
      "[MOCK API] Placed multi-item order:",
      newOrder as unknown as Record<string, unknown>,
    );
    return newOrder;
  },

  updateOrder: async (id: number, input: Partial<BookingInput>) => {
    await new Promise((r) => setTimeout(r, 600));

    const existingOrders = getMockOrders();
    const order = existingOrders.find((o) => Number(o.id) === Number(id));
    if (!order) throw new Error("Order not found");

    const updates: Partial<Order> = {};
    if (input.quantity) {
      // Update quantity in items (assuming single item for now in mock)
      if (order.items && order.items.length > 0) {
        updates.items = order.items.map((item) => ({
          ...item,
          quantity: input.quantity!,
        }));
      }
    }
    if (input.notes !== undefined) {
      updates.notes = input.notes;
    }
    if (input.date || input.moment) {
      // In a real system, we might move the order to a different reservation
      // or update the existing one. For mocks, we'll handle this by updating the reservation.
      const { getMockOrderById } = await import("../mocks/orders");
      const order = getMockOrderById(Number(id));
      if (order?.reservation_id) {
        // This is a bit of a shortcut for the mock, updating the reservation in state
        const { getMockReservations } = await import("../mocks/orders");
        const reservations = getMockReservations();
        const res = reservations.find((r) => r.id === order.reservation_id);
        if (res) {
          if (input.date) res.service_date = input.date;
          if (input.moment) res.time_of_day = input.moment;
        }
      }
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

  getServicesByCategory: async (categoryId: number) => {
    const response = await fetch(`${env.API_URL}/services?category_id=${categoryId}`);
    if (!response.ok) throw new Error("API error fetching services by category");
    return response.json();
  },

  placeOrder: async (date, moment, items, notes) => {
    const response = await fetch(`${env.API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservation_id: 0,
        catalog_category_id: 1, // Example ID
        time_of_day: moment,
        service_date: date.toISOString().split("T")[0],
        notes: notes ?? null,
        items: items,
      }),
    });
    if (!response.ok) throw new Error("API error placing order");
    return response.json();
  },

  updateOrder: async (id: number, input: Partial<BookingInput>) => {
    const response = await fetch(`${env.API_URL}/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: input.notes,
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
