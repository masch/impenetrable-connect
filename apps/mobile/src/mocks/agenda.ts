import { Order } from "@repo/shared";
import { INITIAL_MOCK_ORDERS, MARIA_VENTURE_ID } from "./orders.data";

/**
 * Mock data for entrepreneur agenda
 * Refactored to use centralized data from orders.data.ts
 */

export { MARIA_VENTURE_ID };

/**
 * Orders specifically for the agenda view.
 * Historically this was a separate set of data, now it's a filtered view of the main mock orders.
 * We include orders that are confirmed for Maria's venture.
 */
export const MOCK_AGENDA_ORDERS: Order[] = INITIAL_MOCK_ORDERS.filter(
  (order) => order.confirmed_venture_id === MARIA_VENTURE_ID,
);
