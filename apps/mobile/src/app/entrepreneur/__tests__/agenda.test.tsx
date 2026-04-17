import React from "react";
import { render, screen } from "@testing-library/react-native";
import AgendaScreen from "../agenda";
import { useAgendaStore } from "../../../stores/agenda.store";

// Mock the store to control data
jest.mock("../../../stores/agenda.store");
const mockedUseAgendaStore = jest.mocked(useAgendaStore);

describe("AgendaScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAgendaStore.mockImplementation((selector) => {
      const state = {
        orders: [],
        isLoading: false,
        error: null,
        fetchAgenda: jest.fn(),
        getOccupationStats: () => ({ occupied: 0, total: 20 }),
      };
      return typeof selector === "function" ? selector(state) : state;
    });
  });

  it("should render the screen title", () => {
    render(<AgendaScreen />);
    expect(screen.getByText("agenda.title")).toBeTruthy();
  });

  it("should call fetchAgenda on mount", () => {
    const fetchAgenda = jest.fn();
    mockedUseAgendaStore.mockImplementation((selector) => {
      const state = {
        orders: [],
        isLoading: false,
        error: null,
        fetchAgenda,
        getOccupationStats: () => ({ occupied: 0, total: 20 }),
      };
      return typeof selector === "function" ? selector(state) : state;
    });

    render(<AgendaScreen />);
    expect(fetchAgenda).toHaveBeenCalled();
  });
});
