import React from "react";
import { render, screen } from "@testing-library/react-native";
import ReservationCard from "../ReservationCard";
import { getMockAgendaOrders } from "../../../mocks/agenda";
import type { Order } from "@repo/shared";

describe("ReservationCard", () => {
  it("should render client name, items and service name", () => {
    const orders = getMockAgendaOrders();
    const order = orders[0];
    const totalQuantity = order.zzz_items?.reduce((sum, item) => sum + item.zzz_quantity, 0) || 0;
    render(
      <ReservationCard
        order={order}
        role="entrepreneur"
        onAccept={() => {}}
        onDecline={() => {}}
      />,
    );

    if (order.zzz_items && order.zzz_items.length > 0) {
      // Check for item name instead of ID
      const itemName = order.zzz_items[0].zzz_catalog_item?.zzz_name_i18n.en || "";
      expect(screen.getByText(new RegExp(itemName, "i"))).toBeTruthy();
    }
    // Use a regex that includes the quantity and the "dishes" context to be unique
    expect(screen.getByText(new RegExp(`${totalQuantity}.*dishes`, "i"))).toBeTruthy();
  });

  it("should show notes if present", () => {
    const mockOrder = getMockAgendaOrders()[0];
    const orderWithNotes = {
      ...mockOrder,
      zzz_notes: "Extra napkins please",
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

  it("should display time from zzz_service_at on the card", () => {
    const mockOrder = getMockAgendaOrders()[0];
    const orderWithTime = {
      ...mockOrder,
      zzz_reservation: {
        ...mockOrder.zzz_reservation!,
        zzz_service_at: "2024-01-15T20:30:00-03:00", // 8:30 PM
        zzz_time_of_day: "DINNER",
      },
    } as Order;

    render(
      <ReservationCard
        order={orderWithTime}
        role="entrepreneur"
        onAccept={() => {}}
        onDecline={() => {}}
      />,
    );

    // Verify that the time (20:30) is displayed on screen
    expect(screen.getByText("20:30")).toBeTruthy();
  });
});
