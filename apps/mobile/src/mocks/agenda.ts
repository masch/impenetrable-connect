import { Order } from "@repo/shared";
import { MOCK_VENTURE_WITH_ORDERS } from "./ventures.data";
import { getAllMockOrders } from "./orders";

export { MOCK_VENTURE_WITH_ORDERS };

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
      order.confirmed_venture_id === MOCK_VENTURE_WITH_ORDERS.id ||
      (order.global_status === "OFFER_PENDING" &&
        order.current_offer_venture_id === MOCK_VENTURE_WITH_ORDERS.id),
  );
}
