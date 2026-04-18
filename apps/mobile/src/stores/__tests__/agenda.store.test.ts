import { useAgendaStore } from "../agenda.store";
import { MOCK_AGENDA_ORDERS } from "../../mocks/agenda";

describe("Agenda Store", () => {
  beforeEach(() => {
    // Reset store state if needed, though Zustand persists between tests unless cleared
    useAgendaStore.setState({ orders: [], isLoading: false, error: null });
  });

  it("should fetch agenda orders for a specific date", async () => {
    const store = useAgendaStore.getState();
    const today = new Date();

    // RED: this will fail because fetchAgenda doesn't exist or doesn't return mock data yet
    await store.fetchAgenda(today);

    expect(useAgendaStore.getState().orders.length).toBeGreaterThan(0);
    expect(useAgendaStore.getState().isLoading).toBe(false);
  });

  it("should calculate occupation stats correctly", async () => {
    // Setup state
    useAgendaStore.setState({ orders: MOCK_AGENDA_ORDERS });

    const stats = useAgendaStore.getState().getOccupationStats(20); // Max capacity 20

    // Today in mocks has several orders for Maria's venture totaling 5 guests (3 + 1 + 1)
    expect(stats.occupied).toBe(5);
    expect(stats.total).toBe(20);
  });
});
