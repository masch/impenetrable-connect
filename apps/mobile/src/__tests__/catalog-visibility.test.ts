import { CatalogService } from "../services/catalog.service";
import { mockSetCurrentUser } from "../services/auth-state";
import { MOCK_USERS } from "@repo/shared";

describe("Catalog Visibility Integration", () => {
  const touristUser = MOCK_USERS.find((u) => u.role === "TOURIST")!;

  beforeEach(() => {
    mockSetCurrentUser(touristUser);
  });

  it("should make a new order visible in the order list after placement", async () => {
    const initialOrders = await CatalogService.getOrders();
    const initialCount = initialOrders.length;

    // Place a new order
    const date = new Date();
    const moment = "BREAKFAST";
    const items = [{ zzz_catalog_item_id: 1, zzz_quantity: 1 }];

    const newOrder = await CatalogService.placeOrder(date, moment, items, "Test order");

    expect(newOrder).toBeDefined();
    expect(newOrder.zzz_id).toBeDefined();

    // Verify it appears in the orders list
    const updatedOrders = await CatalogService.getOrders();

    // THIS IS EXPECTED TO FAIL BEFORE THE FIX
    const foundOrder = updatedOrders.find((o) => o.zzz_id === newOrder.zzz_id);
    expect(foundOrder).toBeDefined();
    expect(updatedOrders.length).toBe(initialCount + 1);
  });
});
