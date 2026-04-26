import { getMockOrders } from "../orders";
import { authService } from "../../services/auth.service";
import {
  MOCK_USER_ENTREPRENEUR_WITH_ORDERS,
  MOCK_USER_ENTREPRENEUR_WITHOUT_ORDERS,
} from "@repo/shared";

describe("Order Mocks Filtering", () => {
  it("should return pending orders only for the owner venture (Maria)", async () => {
    // Maria owns Parador Don Esteban (ID 1)
    await authService.login({
      email: MOCK_USER_ENTREPRENEUR_WITH_ORDERS.email!,
      password: "password123",
    });

    const orders = getMockOrders();
    const pendingOrder = orders.find((o) => o.zzz_id === 2);

    expect(pendingOrder).toBeDefined();
    expect(pendingOrder?.zzz_global_status).toBe("OFFER_PENDING");
  });

  it("should NOT return pending orders for a different entrepreneur (José)", async () => {
    // José owns Parador Bermejito (ID 2)
    await authService.login({
      email: MOCK_USER_ENTREPRENEUR_WITHOUT_ORDERS.email!,
      password: "password123",
    });

    const orders = getMockOrders();
    const pendingOrder = orders.find((o) => o.zzz_id === 2);

    // This is the moment of truth
    expect(pendingOrder).toBeUndefined();
  });

  it("should handle sequential logins for different owners correctly", async () => {
    // Maria (Venture 1) should see her order
    await authService.login({
      email: MOCK_USER_ENTREPRENEUR_WITH_ORDERS.email!,
      password: "password123",
    });
    const mariaOrders = getMockOrders();
    expect(mariaOrders.some((o) => o.zzz_id === 2)).toBe(true);

    // José (Venture 2) should NOT see Maria's orders
    await authService.login({
      email: MOCK_USER_ENTREPRENEUR_WITHOUT_ORDERS.email!,
      password: "password123",
    });
    const joseOrders = getMockOrders();
    expect(joseOrders.some((o) => o.zzz_id === 2)).toBe(false);
  });

  it("should allow a second owner of the same venture (Pedro) to see the same orders", async () => {
    // Pedro is also an owner of Venture 1 (Don Esteban)
    await authService.login({ email: "pedro@don-esteban.com", password: "password123" });

    const orders = getMockOrders();
    const pendingOrder = orders.find((o) => o.zzz_id === 2);

    expect(pendingOrder).toBeDefined();
    expect(pendingOrder?.zzz_global_status).toBe("OFFER_PENDING");
  });

  it("should return empty list when no user is logged in (no fallback)", async () => {
    await authService.logout();
    const orders = getMockOrders();
    expect(orders.length).toBe(0);
  });
});
