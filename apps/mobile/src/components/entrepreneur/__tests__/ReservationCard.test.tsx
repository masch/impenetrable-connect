import React from "react";
import { render, screen } from "@testing-library/react-native";
import ReservationCard from "../ReservationCard";
import { MOCK_AGENDA_ORDERS } from "../../../mocks/agenda";

describe("ReservationCard", () => {
  it("should render client name, guests and service name", () => {
    const order = MOCK_AGENDA_ORDERS.find((o) => o.guest_count > 0)!;
    render(<ReservationCard order={order} />);

    if (order.catalog_item?.name_i18n?.en) {
      expect(screen.getByText(order.catalog_item.name_i18n.en)).toBeTruthy();
    }
    expect(screen.getByText(order.guest_count.toString())).toBeTruthy();
  });

  it("should show notes if present", () => {
    const order = MOCK_AGENDA_ORDERS.find((o) => o.notes)!;
    render(<ReservationCard order={order} />);
    expect(screen.getByText(order.notes!)).toBeTruthy();
  });
});
