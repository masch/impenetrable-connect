import { getMockAgendaOrders } from "../agenda";
import { toISODate } from "../../logic/formatters";

describe("Agenda Mocks", () => {
  it("should have at least one order for today", () => {
    const todayStr = toISODate(new Date());
    const todayOrders = getMockAgendaOrders().filter(
      (o) => toISODate(o.reservation?.service_date || new Date()) === todayStr,
    );
    expect(todayOrders.length).toBeGreaterThan(0);
  });

  it("should have orders for different moments of the day", () => {
    const moments = new Set(getMockAgendaOrders().map((o) => o.reservation?.time_of_day));
    expect(moments.has("BREAKFAST")).toBe(true);
    expect(moments.has("DINNER")).toBe(true);
  });
});
