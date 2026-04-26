/**
 * Catalog Service - Tourist Services
 * Follows the mock + REST switch pattern from project.service.ts
 *
 * Uses @repo/shared CatalogItem + Order types aligned with OpenSpec entities.
 * placeOrder() builds an Order directly — there is no intermediate Reservation entity in the DB yet.
 */

import { z } from "zod";

import type { Order, Reservation, ServiceMoment } from "@repo/shared";
import { ServiceMomentSchema } from "@repo/shared";
import { MOCK_CATALOG_SERVICES, type CatalogServiceItem } from "../mocks/catalog";
import {
  addMockOrder,
  addMockReservation,
  getMockOrders,
  updateMockOrder,
  updateMockReservation,
} from "../mocks/orders";
import { isMockUserLoggedIn, getMockUserId } from "../mocks/users";
import { logger } from "./logger.service";
import env from "../config/env";
import { toISODate } from "../logic/formatters";

// Re-export for convenience
export type { CatalogServiceItem };
export type { Order };

// Validation schemas for booking operations
export const BookingInputSchema = z.object({
  serviceId: z.number(),
  moment: ServiceMomentSchema,
  zzz_quantity: z.number().min(1).max(20),
  date: z.date(),
  zzz_notes: z.string().optional(),
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
    items: Array<{ zzz_catalog_item_id: number; zzz_quantity: number }>,
    guestCount: number,
    notes?: string,
  ): Promise<Order>;
  updateOrder(id: number, input: Partial<BookingInput>): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getOrders(userId?: string): Promise<Order[]>;
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
    return mockServices.find((s) => s.zzz_id === id) || null;
  },

  getServicesByCategory: async (categoryId: number) => {
    await new Promise((r) => setTimeout(r, 600));
    return mockServices.filter((s) => s.zzz_catalog_category_id === categoryId);
  },

  placeOrder: async (
    date: Date,
    moment: ServiceMoment,
    items: Array<{ zzz_catalog_item_id: number; zzz_quantity: number }>,
    guestCount: number,
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
    const firstService = mockServices.find((s) => s.zzz_id === items[0].zzz_catalog_item_id);
    if (!firstService) throw new Error("Service not found");

    const orderId = Date.now();
    const reservation = addMockReservation({
      zzz_user_id: isMockUserLoggedIn() ? getMockUserId() : "unknown",
      zzz_service_date: date,
      zzz_time_of_day: moment,
      zzz_status: "CREATED",
      zzz_guest_count: guestCount,
      zzz_created_at: new Date(),
    });

    const newOrder: Order = {
      zzz_id: orderId,
      zzz_reservation_id: reservation.zzz_id,
      zzz_catalog_type_id: firstService.zzz_catalog_category_id,
      zzz_confirmed_venture_id: null,
      zzz_notes: notes ?? null,
      zzz_global_status: "SEARCHING",
      zzz_cancel_reason: null,
      zzz_items: items.map((item) => {
        const s = mockServices.find((service) => service.zzz_id === item.zzz_catalog_item_id);
        return {
          zzz_id: Math.floor(Math.random() * 100000),
          zzz_order_id: orderId,
          zzz_catalog_item_id: item.zzz_catalog_item_id,
          zzz_quantity: item.zzz_quantity,
          zzz_price: s?.zzz_price || 0,
        };
      }),
      zzz_cancelled_at: null,
      zzz_completed_at: null,
      zzz_confirmed_at: null,
      zzz_created_at: new Date(),
      zzz_notify_whatsapp: false,
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
    const order = existingOrders.find((o) => Number(o.zzz_id) === Number(id));
    if (!order) throw new Error("Order not found");

    const updates: Partial<Order> = {};
    if (input.zzz_quantity) {
      // Update quantity in items (assuming single item for now in mock)
      if (order.zzz_items && order.zzz_items.length > 0) {
        updates.zzz_items = order.zzz_items.map((item) => ({
          ...item,
          zzz_quantity: input.zzz_quantity!,
        }));
      }
    }
    if (input.zzz_notes !== undefined) {
      updates.zzz_notes = input.zzz_notes;
    }
    if (input.date || input.moment) {
      // In a real system, we might move the order to a different reservation
      // or update the existing one. For mocks, we'll handle this by updating the reservation.
      const { getMockOrderById } = await import("../mocks/orders");
      const foundOrder = getMockOrderById(Number(id));
      if (foundOrder?.zzz_reservation_id) {
        // This is a bit of a shortcut for the mock, updating the reservation in state
        const reservationUpdates: Partial<Reservation> = {};
        if (input.date) reservationUpdates.zzz_service_date = input.date;
        if (input.moment) reservationUpdates.zzz_time_of_day = input.moment;

        updateMockReservation(foundOrder.zzz_reservation_id, reservationUpdates);
      }
    }

    updateMockOrder(Number(id), updates);
    return { ...order, ...updates };
  },

  updateOrderStatus: async (id: number, status: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const existingOrders = getMockOrders();
    const order = existingOrders.find((o) => Number(o.zzz_id) === Number(id));
    if (!order) throw new Error("Order not found");

    const updates: Partial<Order> = { zzz_global_status: status as Order["zzz_global_status"] };
    if (status === "CONFIRMED") {
      updates.zzz_confirmed_at = new Date();
    }

    updateMockOrder(Number(id), updates);
    return { ...order, ...updates };
  },

  getOrders: async (userId?: string) => {
    await new Promise((r) => setTimeout(r, 500));
    return getMockOrders(userId);
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

  placeOrder: async (date, moment, items, guestCount, notes) => {
    const response = await fetch(`${env.API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zzz_reservation_id: 0,
        zzz_guest_count: guestCount,
        zzz_time_of_day: moment,
        zzz_service_date: toISODate(date),
        zzz_notes: notes ?? null,
        zzz_items: items,
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
        zzz_notes: input.zzz_notes,
      }),
    });
    if (!response.ok) throw new Error("API error updating order");
    return response.json();
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await fetch(`${env.API_URL}/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("API error updating status");
    return response.json();
  },

  getOrders: async (userId?: string) => {
    const url = userId ? `${env.API_URL}/orders?userId=${userId}` : `${env.API_URL}/orders`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("API error fetching orders");
    return response.json();
  },
};

/**
 * EXPORT: The smart switch
 */
export const CatalogService = env.USE_MOCKS ? MockCatalogService : RestCatalogService;
