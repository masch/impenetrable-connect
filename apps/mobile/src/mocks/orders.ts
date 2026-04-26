import { Order, Reservation, MOCK_USERS, MOCK_VENTURES, UserRole } from "@repo/shared";
import { getMockUserId } from "./users";
import { logger } from "../services/logger.service";
import { INITIAL_MOCK_ORDERS, MOCK_RESERVATIONS } from "./orders.data";
import { MOCK_CATALOG_ITEMS } from "./catalog";
import { mockGetCurrentUser } from "../services/auth-state";
import { getVentureIdsByUserId } from "./venture-members";

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

// Get all reservations (open reservations with no zzz_items yet)
export function getMockReservations(): Reservation[] {
  const userId = getEffectiveUserId();
  return ordersState.reservations.filter((r: Reservation) => r.zzz_user_id === userId);
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
    const reservation = ordersState.reservations.find((r) => r.zzz_id === order.zzz_reservation_id);
    const enrichedReservation = reservation
      ? {
          ...reservation,
          zzz_user: MOCK_USERS.find((u) => u.id === reservation.zzz_user_id),
        }
      : undefined;

    const enrichedItems = (order.zzz_items || []).map((item) => ({
      ...item,
      zzz_catalog_item: MOCK_CATALOG_ITEMS[item.zzz_catalog_item_id],
    }));

    const confirmedVenture = order.zzz_confirmed_venture_id
      ? MOCK_VENTURES.find((v) => v.id === order.zzz_confirmed_venture_id)
      : undefined;

    const currentOfferVenture = order.zzz_current_offer_venture_id
      ? MOCK_VENTURES.find((v) => v.id === order.zzz_current_offer_venture_id)
      : undefined;

    return {
      ...order,
      zzz_reservation: enrichedReservation,
      zzz_items: enrichedItems,
      zzz_confirmed_venture: confirmedVenture,
      zzz_current_offer_venture: currentOfferVenture,
    };
  });
}

/**
 * Get mock orders for the current user (filtered)
 */
export function getMockOrders(overrideUserId?: string): Order[] {
  // If no override provided, try to get the current user WITHOUT fallback
  const user = mockGetCurrentUser();
  const userId = overrideUserId || user?.id;

  if (!userId) {
    logger.debug("getMockOrders called without userId, returning empty");
    return [];
  }

  // Find user directly in MOCK_USERS
  const currentUser = MOCK_USERS.find((u) => u.id === userId);
  const isEntrepreneur = currentUser?.role === UserRole.ENTREPRENEUR;

  let orders;
  if (isEntrepreneur) {
    const ventureIds = getVentureIdsByUserId(userId);
    orders = ordersState.orders.filter(
      (o: Order) =>
        (o.zzz_confirmed_venture_id && ventureIds.includes(o.zzz_confirmed_venture_id)) ||
        (o.zzz_current_offer_venture_id && ventureIds.includes(o.zzz_current_offer_venture_id)),
    );
  } else {
    // Filter orders by checking their reservation's user_id (Tourist view)
    orders = ordersState.orders.filter((o: Order) => {
      const reservation = ordersState.reservations.find(
        (r: Reservation) => r.zzz_id === o.zzz_reservation_id,
      );
      return reservation?.zzz_user_id === userId;
    });
  }

  return orders.map((order) => {
    const reservation = ordersState.reservations.find((r) => r.zzz_id === order.zzz_reservation_id);
    const enrichedReservation = reservation
      ? {
          ...reservation,
          zzz_user: MOCK_USERS.find((u) => u.id === reservation.zzz_user_id),
        }
      : undefined;

    const enrichedItems = (order.zzz_items || []).map((item) => ({
      ...item,
      zzz_catalog_item: MOCK_CATALOG_ITEMS[item.zzz_catalog_item_id],
    }));

    const confirmedVenture = order.zzz_confirmed_venture_id
      ? MOCK_VENTURES.find((v) => v.id === order.zzz_confirmed_venture_id)
      : undefined;

    const currentOfferVenture = order.zzz_current_offer_venture_id
      ? MOCK_VENTURES.find((v) => v.id === order.zzz_current_offer_venture_id)
      : undefined;

    return {
      ...order,
      zzz_reservation: enrichedReservation,
      zzz_items: enrichedItems,
      zzz_confirmed_venture: confirmedVenture,
      zzz_current_offer_venture: currentOfferVenture,
    };
  });
}

/**
 * Add an order to the mock collection
 */
export function addMockOrder(order: Omit<Order, "zzz_id">) {
  const newOrder: Order = {
    zzz_id: Date.now(),
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
    Number(o.zzz_id) === Number(id) ? { ...o, ...updates } : o,
  );
  logger.info(`[MOCK] Updated order ${id} (new array reference created)`);
}

/**
 * Get a single order by ID
 */
export const getMockOrderById = (id: number): Order | undefined => {
  return ordersState.orders.find((o: Order) => Number(o.zzz_id) === Number(id));
};

/**
 * Update an order status
 */
export function updateMockOrderStatus(id: number, status: Order["zzz_global_status"]) {
  ordersState.orders = ordersState.orders.map((o: Order) =>
    Number(o.zzz_id) === Number(id) ? { ...o, zzz_global_status: status } : o,
  );
  logger.info(`[MOCK] Updated order status ${id} to ${status}`);
}

/**
 * Add a reservation to the mock collection
 */
export function addMockReservation(reservation: Omit<Reservation, "zzz_id">): Reservation {
  const newReservation: Reservation = {
    zzz_id: Math.floor(Math.random() * 100000),
    ...reservation,
  };
  ordersState.reservations = [newReservation, ...ordersState.reservations];
  logger.info("[MOCK API] Created reservation:", { ...newReservation });
  return newReservation;
}

/**
 * Update a mock reservation with new data
 */
export function updateMockReservation(id: number, updates: Partial<Reservation>) {
  ordersState.reservations = ordersState.reservations.map((r: Reservation) =>
    Number(r.zzz_id) === Number(id) ? { ...r, ...updates } : r,
  );
  logger.info(`[MOCK] Updated reservation ${id} (new array reference created)`);
}
