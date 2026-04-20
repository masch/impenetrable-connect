import { Order, Reservation } from "@repo/shared";
import { getMockUserId } from "./users";
import { logger } from "../services/logger.service";
import { INITIAL_MOCK_ORDERS, MOCK_RESERVATIONS } from "./orders.data";
import { MOCK_CATALOG_ITEMS } from "./catalog";
import { MOCK_USERS } from "./users.data";
import { MOCK_VENTURES } from "./ventures.data";

/**
 * Mock services for orders
 * Consumes centralized data from orders.data.ts
 */

// Shared in-memory state for orders and reservations
const GLOBAL_ORDERS_KEY = "__IMPENETRABLE_MOCK_ORDERS_STATE__";

// Initialize global orders state if not already present
const ordersStateContainer = globalThis as unknown as {
  [GLOBAL_ORDERS_KEY]: { orders: Order[]; reservations: Reservation[] };
};

if (!ordersStateContainer[GLOBAL_ORDERS_KEY]) {
  ordersStateContainer[GLOBAL_ORDERS_KEY] = {
    orders: [...INITIAL_MOCK_ORDERS],
    reservations: [...MOCK_RESERVATIONS],
  };
}
const ordersState = ordersStateContainer[GLOBAL_ORDERS_KEY];

// Get all reservations (open reservations with no items yet)
export function getMockReservations(): Reservation[] {
  const userId = getEffectiveUserId();
  return ordersState.reservations.filter((r: Reservation) => r.user_id === userId);
}

// Fallback for user ID to ensure visibility in mock mode
const getEffectiveUserId = () => {
  return getMockUserId();
};

/**
 * Get all mock orders in the state (unfiltered)
 */
export function getAllMockOrders(): Order[] {
  return ordersState.orders.map((order) => {
    const reservation = ordersState.reservations.find((r) => r.id === order.reservation_id);
    const enrichedReservation = reservation
      ? { ...reservation, user: MOCK_USERS.find((u) => u.id === reservation.user_id) }
      : undefined;

    const enrichedItems = (order.items || []).map((item) => ({
      ...item,
      catalog_item: MOCK_CATALOG_ITEMS[item.catalog_item_id],
    }));

    const confirmedVenture = order.confirmed_venture_id
      ? MOCK_VENTURES.find((v) => v.id === order.confirmed_venture_id)
      : undefined;

    const currentOfferVenture = order.current_offer_venture_id
      ? MOCK_VENTURES.find((v) => v.id === order.current_offer_venture_id)
      : undefined;

    return {
      ...order,
      reservation: enrichedReservation,
      items: enrichedItems,
      confirmed_venture: confirmedVenture,
      current_offer_venture: currentOfferVenture,
    };
  });
}

/**
 * Get mock orders for the current user (filtered)
 */
export function getMockOrders(): Order[] {
  const userId = getEffectiveUserId();

  // Filter orders by checking their reservation's user_id
  const orders = ordersState.orders.filter((o: Order) => {
    const reservation = ordersState.reservations.find((r) => r.id === o.reservation_id);
    return reservation?.user_id === userId;
  });

  return orders.map((order) => {
    const reservation = ordersState.reservations.find((r) => r.id === order.reservation_id);
    const enrichedReservation = reservation
      ? { ...reservation, user: MOCK_USERS.find((u) => u.id === reservation.user_id) }
      : undefined;

    const enrichedItems = (order.items || []).map((item) => ({
      ...item,
      catalog_item: MOCK_CATALOG_ITEMS[item.catalog_item_id],
    }));

    const confirmedVenture = order.confirmed_venture_id
      ? MOCK_VENTURES.find((v) => v.id === order.confirmed_venture_id)
      : undefined;

    const currentOfferVenture = order.current_offer_venture_id
      ? MOCK_VENTURES.find((v) => v.id === order.current_offer_venture_id)
      : undefined;

    return {
      ...order,
      reservation: enrichedReservation,
      items: enrichedItems,
      confirmed_venture: confirmedVenture,
      current_offer_venture: currentOfferVenture,
    };
  });
}

/**
 * Add an order to the mock collection
 */
export function addMockOrder(order: Omit<Order, "id">) {
  const newOrder: Order = {
    id: Date.now(),
    ...order,
  };
  ordersState.orders = [newOrder, ...ordersState.orders];
  logger.info("[MOCK API] Created order from reservation:", { ...newOrder });
  return newOrder;
}

/**
 * Update a mock order with new data
 */
export function updateMockOrder(id: number, updates: Partial<Order>) {
  ordersState.orders = ordersState.orders.map((o: Order) =>
    Number(o.id) === Number(id) ? { ...o, ...updates } : o,
  );
  logger.info(`[MOCK] Updated order ${id} (new array reference created)`);
}

/**
 * Get a single order by ID
 */
export const getMockOrderById = (id: number): Order | undefined => {
  return ordersState.orders.find((o: Order) => Number(o.id) === Number(id));
};

/**
 * Update an order status
 */
export function updateMockOrderStatus(id: number, status: Order["global_status"]) {
  ordersState.orders = ordersState.orders.map((o: Order) =>
    Number(o.id) === Number(id) ? { ...o, global_status: status } : o,
  );
  logger.info(`[MOCK] Updated order status ${id} to ${status}`);
}
