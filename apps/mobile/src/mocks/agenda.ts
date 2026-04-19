import { Order } from "@repo/shared";
import { MARIA_VENTURE_ID } from "./orders.data";
import { getAllMockOrders } from "./orders";

export { MARIA_VENTURE_ID };

/**
 * Mock data for entrepreneur agenda
 */

/**
 * Orders specifically for the agenda view.
 * Uses a function to ensure we always get the latest state from the mock system.
 */
export function getMockAgendaOrders(): Order[] {
  return getAllMockOrders().filter(
    (order) =>
      order.confirmed_venture_id === MARIA_VENTURE_ID ||
      (order.global_status === "OFFER_PENDING" &&
        order.current_offer_venture_id === MARIA_VENTURE_ID),
  );
}
