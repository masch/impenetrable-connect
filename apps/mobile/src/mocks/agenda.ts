import { Order, MOCK_VENTURE_WITH_ORDERS } from "@repo/shared";
import { getAllMockOrders } from "./orders";

export { MOCK_VENTURE_WITH_ORDERS };

/**
 * Mock data for entrepreneur agenda
 */

/**
 * Orders specifically for the agenda view.
 * Uses a function to ensure we always get the latest state from the mock system.
 */
export function getMockAgendaOrders(ventureIds: number[] = [MOCK_VENTURE_WITH_ORDERS.id]): Order[] {
  return getAllMockOrders().filter(
    (order) =>
      (order.zzz_confirmed_venture_id && ventureIds.includes(order.zzz_confirmed_venture_id)) ||
      (order.zzz_global_status === "OFFER_PENDING" &&
        order.zzz_current_offer_venture_id &&
        ventureIds.includes(order.zzz_current_offer_venture_id)),
  );
}
