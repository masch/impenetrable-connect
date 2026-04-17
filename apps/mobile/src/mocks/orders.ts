/**
 * Mock data for tourist orders
 * Shared between catalog and order services during development
 */

import { Order } from "@repo/shared";
import {
  EMPANADAS_CARNE_DOCENA,
  ASADO_POLLO,
  EMPANADAS_VERDURA_DOCENA,
  DESAYUNO,
  MERIENDA,
} from "./catalog";
import { getMockUserId, DEFAULT_MOCK_USER_ID } from "./users";
import { logger } from "../services/logger.service";

// Helper to get a date relative to today
const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const today = daysFromNow(0);
const tomorrow = daysFromNow(1);
const dayAfterTomorrow = daysFromNow(2);
const yesterday = daysFromNow(-1);

// Initial set of mock orders - shows demo data when no user is logged in
const DEFAULT_MOCK_ORDERS: Order[] = [
  {
    id: 1,
    user_id: DEFAULT_MOCK_USER_ID,
    catalog_item_id: DESAYUNO.id,
    catalog_item: DESAYUNO,
    quantity: 1,
    price_at_purchase: 2500,
    confirmed_venture_id: null,
    service_date: today,
    time_of_day: "BREAKFAST",
    guest_count: 2,
    notes: "Sin azucar",
    global_status: "SEARCHING",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    confirmed_at: null,
    created_at: today,
    notify_whatsapp: true,
  },
  {
    id: 2,
    user_id: DEFAULT_MOCK_USER_ID,
    catalog_item_id: ASADO_POLLO.id,
    catalog_item: ASADO_POLLO,
    quantity: 1,
    price_at_purchase: 4500,
    confirmed_venture_id: 1,
    service_date: today,
    time_of_day: "LUNCH",
    guest_count: 4,
    notes: null,
    global_status: "CONFIRMED",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    confirmed_at: new Date("2026-04-11T14:30:00Z"),
    created_at: new Date("2026-04-09T09:00:00Z"),
    notify_whatsapp: false,
  },
  {
    id: 3,
    user_id: DEFAULT_MOCK_USER_ID,
    catalog_item_id: MERIENDA.id,
    catalog_item: MERIENDA,
    quantity: 2,
    price_at_purchase: 19000,
    confirmed_venture_id: 2,
    service_date: tomorrow,
    time_of_day: "SNACK",
    guest_count: 4,
    notes: null,
    global_status: "CONFIRMED",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    confirmed_at: tomorrow,
    created_at: tomorrow,
    notify_whatsapp: false,
  },
  {
    id: 4,
    user_id: DEFAULT_MOCK_USER_ID,
    catalog_item_id: ASADO_POLLO.id,
    catalog_item: ASADO_POLLO,
    quantity: 1,
    price_at_purchase: 4500,
    confirmed_venture_id: 1,
    service_date: dayAfterTomorrow,
    time_of_day: "DINNER",
    guest_count: 4,
    notes: null,
    global_status: "CONFIRMED",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    confirmed_at: dayAfterTomorrow,
    created_at: dayAfterTomorrow,
    notify_whatsapp: false,
  },
  {
    id: 5,
    user_id: DEFAULT_MOCK_USER_ID,
    catalog_item_id: EMPANADAS_CARNE_DOCENA.id,
    catalog_item: EMPANADAS_CARNE_DOCENA,
    quantity: 1,
    price_at_purchase: 3500,
    confirmed_venture_id: 2,
    service_date: yesterday,
    time_of_day: "DINNER",
    guest_count: 3,
    notes: null,
    global_status: "COMPLETED",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: new Date("2026-04-05T21:00:00Z"),
    confirmed_at: new Date("2026-04-04T10:00:00Z"),
    created_at: new Date("2026-04-02T15:00:00Z"),
    notify_whatsapp: true,
  },
  {
    id: 6,
    user_id: DEFAULT_MOCK_USER_ID,
    catalog_item_id: EMPANADAS_VERDURA_DOCENA.id,
    catalog_item: EMPANADAS_VERDURA_DOCENA,
    quantity: 1,
    price_at_purchase: 3500,
    confirmed_venture_id: 2,
    service_date: today,
    time_of_day: "DINNER",
    guest_count: 3,
    notes: null,
    global_status: "EXPIRED",
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    confirmed_at: null,
    created_at: new Date("2026-04-02T15:00:00Z"),
    notify_whatsapp: true,
  },
];

/**
 * Shared in-memory state for orders
 * Uses global naming to ensure consistency across multiple module instances if they occur
 */
// Define the shape of our global state
const GLOBAL_ORDERS_KEY = "__REWILDING_MOCK_ORDERS_STATE__";

// Initialize global orders state if not already present
// Using type assertion to avoid explicit 'any' while maintaining the global singleton
const ordersStateContainer = globalThis as unknown as { [GLOBAL_ORDERS_KEY]: { orders: Order[] } };

if (!ordersStateContainer[GLOBAL_ORDERS_KEY]) {
  ordersStateContainer[GLOBAL_ORDERS_KEY] = {
    orders: [...DEFAULT_MOCK_ORDERS],
  };
}

const ordersState = ordersStateContainer[GLOBAL_ORDERS_KEY];

// Fallback for user ID to ensure visibility in mock mode
const getEffectiveUserId = () => {
  return getMockUserId();
};

/**
 * Get orders for current user
 */
export function getMockOrders(): Order[] {
  const userId = getEffectiveUserId();
  return ordersState.orders.filter((o: Order) => o.user_id === userId);
}

export const MOCK_ORDERS: Order[] = [];

/**
 * Add an order to the mock collection
 */
export function addMockOrder(order: Omit<Order, "id" | "user_id">) {
  const newOrder: Order = {
    id: Date.now(),
    user_id: getEffectiveUserId(),
    ...order,
  };
  ordersState.orders = [newOrder, ...ordersState.orders];
  logger.info("[MOCK API] Created order from reservation:", newOrder);

  // DEBUG: Direct alert to see if we reached this point
  // alert("Saving to memory...");

  return newOrder;
}

/**
 * Update a mock order with new data (Immutable update with numeric coercion)
 */
export function updateMockOrder(id: number, updates: Partial<Order>) {
  // Global access to maintain state across different instances of this same file
  const container = globalThis as unknown as { [GLOBAL_ORDERS_KEY]: { orders: Order[] } };
  const ordersState = container[GLOBAL_ORDERS_KEY];

  ordersState.orders = ordersState.orders.map((o: Order) =>
    Number(o.id) === Number(id) ? { ...o, ...updates } : o,
  );

  console.log(`[MOCK] Updated order ${id} (new array reference created)`, new Date().toISOString());
}

export const getMockOrderById = (id: number): Order | undefined => {
  const container = globalThis as unknown as { [GLOBAL_ORDERS_KEY]: { orders: Order[] } };
  const ordersState = container[GLOBAL_ORDERS_KEY];
  const order = ordersState.orders.find((o: Order) => Number(o.id) === Number(id));
  return order;
};

/**
 * Update an order status
 */
export function updateMockOrderStatus(id: number, status: Order["global_status"]) {
  const container = globalThis as unknown as { [GLOBAL_ORDERS_KEY]: { orders: Order[] } };
  const ordersState = container[GLOBAL_ORDERS_KEY];
  const order = ordersState.orders.find((o: Order) => Number(o.id) === Number(id));
  if (order) {
    order.global_status = status;
  }
}
