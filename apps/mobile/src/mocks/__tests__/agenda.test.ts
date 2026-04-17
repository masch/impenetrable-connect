import { MOCK_AGENDA_ORDERS } from "../agenda";

describe("Agenda Mocks", () => {
  it("should have at least one order for today", () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayOrders = MOCK_AGENDA_ORDERS.filter(
      (o) => o.service_date.toISOString().split("T")[0] === todayStr,
    );
    expect(todayOrders.length).toBeGreaterThan(0);
  });

  it("should have orders for different moments of the day", () => {
    const moments = new Set(MOCK_AGENDA_ORDERS.map((o) => o.time_of_day));
    expect(moments.has("BREAKFAST")).toBe(true);
    expect(moments.has("LUNCH")).toBe(true);
    expect(moments.has("DINNER")).toBe(true);
  });
});
