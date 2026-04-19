import { useAgendaStore } from "../agenda.store";
import { getMockAgendaOrders } from "../../mocks/agenda";

describe("Agenda Store", () => {
  beforeEach(() => {
    // Reset store state if needed, though Zustand persists between tests unless cleared
    useAgendaStore.setState({ orders: [], isLoading: false, error: null });
  });

  it("should fetch agenda orders for a specific date", async () => {
    const store = useAgendaStore.getState();
    const today = new Date();

    await store.fetchAgenda(today);

    // Note: if this fails, check if the mock data dates match today
    expect(useAgendaStore.getState().orders.length).toBeGreaterThan(0);
    expect(useAgendaStore.getState().isLoading).toBe(false);
  });

  it("should calculate occupation stats correctly", async () => {
    // Setup state
    useAgendaStore.setState({ orders: getMockAgendaOrders() });

    const stats = useAgendaStore.getState().getOccupationStats(20); // Max capacity 20

    // Today in mocks has several orders for Maria's venture totaling 8 guests (4 + 1 + 3)
    expect(stats.occupied).toBe(8);
    expect(stats.total).toBe(20);
  });
});
