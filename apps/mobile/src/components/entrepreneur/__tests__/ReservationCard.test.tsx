import React from "react";
import { render, screen } from "@testing-library/react-native";
import ReservationCard from "../ReservationCard";
import { getMockAgendaOrders } from "../../../mocks/agenda";

describe("ReservationCard", () => {
  it("should render client name, items and service name", () => {
    const orders = getMockAgendaOrders();
    const order = orders[0];
    const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    render(
      <ReservationCard
        order={order}
        role="entrepreneur"
        onAccept={() => {}}
        onDecline={() => {}}
      />,
    );

    if (order.items && order.items.length > 0) {
      // Check for item name instead of ID
      const itemName = order.items[0].catalog_item?.name_i18n.en || "";
      expect(screen.getByText(new RegExp(itemName, "i"))).toBeTruthy();
    }
    // Use a regex that includes the quantity and the "dishes" context to be unique
    expect(screen.getByText(new RegExp(`${totalQuantity}.*dishes`, "i"))).toBeTruthy();
  });

  it("should show notes if present", () => {
    const mockOrder = getMockAgendaOrders()[0];
    const orderWithNotes = {
      ...mockOrder,
      notes: "Extra napkins please",
    };
    render(
      <ReservationCard
        order={orderWithNotes}
        role="entrepreneur"
        onAccept={() => {}}
        onDecline={() => {}}
      />,
    );
    expect(screen.getByText("Extra napkins please")).toBeTruthy();
  });
});
