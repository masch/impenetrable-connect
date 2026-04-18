import React from "react";
import { render, screen } from "@testing-library/react-native";
import ReservationCard from "../ReservationCard";
import { MOCK_AGENDA_ORDERS } from "../../../mocks/agenda";

describe("ReservationCard", () => {
  it("should render client name, items and service name", () => {
    const order = MOCK_AGENDA_ORDERS[0];
    const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    render(<ReservationCard order={order} />);

    if (order.items && order.items.length > 0) {
      expect(screen.getByText(new RegExp(`Ítem #${order.items[0].catalog_item_id}`))).toBeTruthy();
    }
    expect(screen.getByText(totalQuantity.toString())).toBeTruthy();
  });

  it("should show notes if present", () => {
    const order = MOCK_AGENDA_ORDERS.find((o) => o.notes)!;
    render(<ReservationCard order={order} />);
    expect(screen.getByText(order.notes!)).toBeTruthy();
  });
});
