import { describe, expect, it } from "bun:test";
import { OrderService, OrderServiceError } from "./order.service";
import { type Db } from "../db";
import {
  reservations,
  productCategories,
  ventures,
  products,
  orders,
  orderItems,
} from "../db/schema";

describe("OrderService", () => {
  const mockOrder = {
    zzz_id: "550e8400-e29b-41d4-a716-446655440000",
    zzz_reservation_id: "550e8400-e29b-41d4-a716-446655440001",
    zzz_product_category_id: 1,
    zzz_confirmed_venture_id: null,
    zzz_notes: null,
    zzz_global_status: "SEARCHING" as const,
    zzz_cancel_reason: null,
    zzz_cancelled_at: null as Date | null,
    zzz_completed_at: null as Date | null,
    zzz_confirmed_at: null as Date | null,
    zzz_current_offer_venture_id: null,
    zzz_notify_whatsapp: false,
    zzzCreatedAt: new Date("2026-05-24T00:00:00.000Z"),
    zzzUpdatedAt: new Date("2026-05-24T00:00:00.000Z"),
    zzzDeletedAt: null as Date | null,
  };

  const mockReservation = {
    zzz_id: "550e8400-e29b-41d4-a716-446655440001",
    zzz_user_id: "user-1",
    zzz_status: "CREATED" as const,
    zzz_guest_count: 2,
    zzz_service_at: new Date("2026-05-25T12:00:00.000Z"),
    zzz_time_of_day: "LUNCH" as const,
    zzzCreatedAt: new Date("2026-05-24T00:00:00.000Z"),
    zzzUpdatedAt: new Date("2026-05-24T00:00:00.000Z"),
    zzzDeletedAt: null as Date | null,
  };

  // --- Helpers ---

  const createListBuilder = (result: unknown[]) => {
    const builder: Record<string, unknown> = {
      where: () => builder,
      orderBy: () => builder,
      limit: () => builder,
      offset: () => Promise.resolve(result),
      then: (resolve: (v: unknown) => unknown) => resolve(result),
      catch: (_reject: (e: Error) => unknown) => Promise.resolve(result).catch(_reject),
    };
    return builder;
  };

  const createWhereChain = (result: unknown[]) => {
    const p = Promise.resolve(result);
    return {
      limit: () => p,
      orderBy: () => p,
      then: p.then.bind(p),
      catch: p.catch.bind(p),
    };
  };

  // --- Static Utility Methods ---

  describe("isValidTransition", () => {
    it("should return true for valid transitions", () => {
      expect(OrderService.isValidTransition("SEARCHING", "OFFER_PENDING")).toBe(true);
      expect(OrderService.isValidTransition("SEARCHING", "EXPIRED")).toBe(true);
      expect(OrderService.isValidTransition("SEARCHING", "CANCELLED")).toBe(true);
      expect(OrderService.isValidTransition("OFFER_PENDING", "CONFIRMED")).toBe(true);
      expect(OrderService.isValidTransition("OFFER_PENDING", "CANCELLED")).toBe(true);
      expect(OrderService.isValidTransition("OFFER_PENDING", "EXPIRED")).toBe(true);
      expect(OrderService.isValidTransition("CONFIRMED", "COMPLETED")).toBe(true);
      expect(OrderService.isValidTransition("CONFIRMED", "NO_SHOW")).toBe(true);
      expect(OrderService.isValidTransition("CONFIRMED", "CANCELLED")).toBe(true);
    });

    it("should return false for invalid transitions", () => {
      expect(OrderService.isValidTransition("SEARCHING", "CONFIRMED")).toBe(false);
      expect(OrderService.isValidTransition("SEARCHING", "COMPLETED")).toBe(false);
      expect(OrderService.isValidTransition("SEARCHING", "NO_SHOW")).toBe(false);
      expect(OrderService.isValidTransition("OFFER_PENDING", "SEARCHING")).toBe(false);
      expect(OrderService.isValidTransition("OFFER_PENDING", "COMPLETED")).toBe(false);
      expect(OrderService.isValidTransition("OFFER_PENDING", "NO_SHOW")).toBe(false);
      expect(OrderService.isValidTransition("CONFIRMED", "SEARCHING")).toBe(false);
      expect(OrderService.isValidTransition("CONFIRMED", "OFFER_PENDING")).toBe(false);
      expect(OrderService.isValidTransition("CONFIRMED", "EXPIRED")).toBe(false);
    });

    it("should return false for transitions from terminal states", () => {
      expect(OrderService.isValidTransition("COMPLETED", "CONFIRMED")).toBe(false);
      expect(OrderService.isValidTransition("CANCELLED", "SEARCHING")).toBe(false);
      expect(OrderService.isValidTransition("NO_SHOW", "CONFIRMED")).toBe(false);
      expect(OrderService.isValidTransition("EXPIRED", "OFFER_PENDING")).toBe(false);
    });
  });

  describe("isTerminal", () => {
    it("should return true for terminal statuses", () => {
      expect(OrderService.isTerminal("COMPLETED")).toBe(true);
      expect(OrderService.isTerminal("NO_SHOW")).toBe(true);
      expect(OrderService.isTerminal("CANCELLED")).toBe(true);
      expect(OrderService.isTerminal("EXPIRED")).toBe(true);
    });

    it("should return false for non-terminal statuses", () => {
      expect(OrderService.isTerminal("SEARCHING")).toBe(false);
      expect(OrderService.isTerminal("OFFER_PENDING")).toBe(false);
      expect(OrderService.isTerminal("CONFIRMED")).toBe(false);
    });
  });

  // --- Query Methods ---

  describe("getById", () => {
    it("should return an order by UUID", async () => {
      const mockDb = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([mockOrder]),
            }),
          }),
        }),
      } as unknown as Db;

      const result = await OrderService.getById(mockDb, mockOrder.zzz_id);
      expect(result).toEqual(mockOrder);
    });

    it("should return undefined when not found", async () => {
      const mockDb = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      } as unknown as Db;

      const result = await OrderService.getById(mockDb, "nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getAll", () => {
    // Shared mockDB factory for getAll tests.
    // Returns a mock that handles:
    //  - orders table → [mockOrder]
    //  - reservations table → [mockReservation]
    //  - orderItems table → [mockOrderItem]
    //  - products table → [mockCatalogProduct]
    const mockCatalogProduct = {
      zzz_id: 1,
      zzz_product_category_id: 1,
      zzz_name_i18n: { en: "Test Product", es: "Producto de Prueba" },
      zzz_description_i18n: null as Record<string, string> | null,
      zzz_price: 25_000,
      zzz_max_participants: 4,
      zzz_image_url: null as string | null,
      zzz_global_pause: false,
      zzz_service_moments: null as string[] | null,
      zzzCreatedAt: new Date("2026-05-24T00:00:00.000Z"),
      zzzUpdatedAt: new Date("2026-05-24T00:00:00.000Z"),
      zzzDeletedAt: null as Date | null,
    };

    const mockOrderItem = {
      zzz_id: "item-1",
      zzz_order_id: mockOrder.zzz_id,
      zzz_catalog_item_id: 1,
      zzz_quantity: 2,
      zzz_price: 25_000,
      zzz_notes: null as string | null,
      zzzCreatedAt: new Date("2026-05-24T00:00:00.000Z"),
      zzzUpdatedAt: new Date("2026-05-24T00:00:00.000Z"),
      zzzDeletedAt: null as Date | null,
    };

    const mockDbFactory = () =>
      ({
        select: () => ({
          from: (table: unknown) => {
            if (table === orderItems) {
              return createListBuilder([mockOrderItem]);
            }
            if (table === products) {
              return createListBuilder([mockCatalogProduct]);
            }
            if (table === reservations) {
              return createListBuilder([mockReservation]);
            }
            return createListBuilder([mockOrder]);
          },
        }),
      }) as unknown as Db;

    const enrichedItem = {
      ...mockOrderItem,
      zzz_price: 25_000,
      zzz_catalog_item: {
        zzz_id: mockCatalogProduct.zzz_id,
        zzz_product_category_id: mockCatalogProduct.zzz_product_category_id,
        zzz_name_i18n: mockCatalogProduct.zzz_name_i18n,
        zzz_description_i18n: mockCatalogProduct.zzz_description_i18n,
        zzz_price: mockCatalogProduct.zzz_price,
        zzz_max_participants: mockCatalogProduct.zzz_max_participants,
        zzz_image_url: mockCatalogProduct.zzz_image_url,
        zzz_global_pause: mockCatalogProduct.zzz_global_pause,
        zzz_service_moments: mockCatalogProduct.zzz_service_moments,
      },
    };

    const expectedOrder = {
      ...mockOrder,
      zzz_reservation: mockReservation,
      zzz_items: [enrichedItem],
    };

    it("should return all orders for ADMIN", async () => {
      const result = await OrderService.getAll(mockDbFactory(), {}, "ADMIN" as never, "user-1");
      expect(result).toEqual([expectedOrder]);
    });

    it("should filter by reservation for TOURIST", async () => {
      const result = await OrderService.getAll(mockDbFactory(), {}, "TOURIST" as never, "user-1");
      expect(result).toEqual([expectedOrder]);
    });

    it("should filter by venture for ENTREPRENEUR", async () => {
      const result = await OrderService.getAll(
        mockDbFactory(),
        {},
        "ENTREPRENEUR" as never,
        "user-1",
      );
      expect(result).toEqual([expectedOrder]);
    });

    it("should apply status filter", async () => {
      const result = await OrderService.getAll(
        mockDbFactory(),
        { status: "SEARCHING" },
        "ADMIN" as never,
        "user-1",
      );
      expect(result).toEqual([expectedOrder]);
    });

    it("should apply reservation_id filter", async () => {
      const result = await OrderService.getAll(
        mockDbFactory(),
        { reservation_id: "res-1" },
        "ADMIN" as never,
        "user-1",
      );
      expect(result).toEqual([expectedOrder]);
    });

    it("should return empty array when no orders match", async () => {
      const emptyDb = {
        select: () => ({
          from: () => createListBuilder([]),
        }),
      } as unknown as Db;

      const result = await OrderService.getAll(emptyDb, {}, "ADMIN" as never, "user-1");
      expect(result).toEqual([]);
    });

    it("should return order with empty zzz_items when no order_items exist", async () => {
      const noItemsDb = {
        select: () => ({
          from: (table: unknown) => {
            if (table === orderItems) {
              return createListBuilder([]);
            }
            if (table === products) {
              return createListBuilder([]);
            }
            if (table === reservations) {
              return createListBuilder([mockReservation]);
            }
            return createListBuilder([mockOrder]);
          },
        }),
      } as unknown as Db;

      const result = await OrderService.getAll(noItemsDb, {}, "ADMIN" as never, "user-1");
      expect(result).toHaveLength(1);
      expect(result[0].zzz_items).toEqual([]);
      expect(result[0].zzz_reservation).toEqual(mockReservation);
    });

    it("should set zzz_catalog_item to undefined when product not found in catalog", async () => {
      const unknownProductItem = {
        ...mockOrderItem,
        zzz_catalog_item_id: 999,
      };

      const missingProductDb = {
        select: () => ({
          from: (table: unknown) => {
            if (table === orderItems) {
              return createListBuilder([unknownProductItem]);
            }
            if (table === products) {
              return createListBuilder([]);
            }
            if (table === reservations) {
              return createListBuilder([mockReservation]);
            }
            return createListBuilder([mockOrder]);
          },
        }),
      } as unknown as Db;

      const result = await OrderService.getAll(missingProductDb, {}, "ADMIN" as never, "user-1");
      expect(result).toHaveLength(1);
      expect(result[0].zzz_items).toHaveLength(1);
      expect(result[0].zzz_items[0].zzz_catalog_item_id).toBe(999);
      expect(result[0].zzz_items[0].zzz_catalog_item).toBeUndefined();
    });
  });

  describe("update", () => {
    it("should update notes and notify_whatsapp", async () => {
      const updatedOrder = { ...mockOrder, zzz_notes: "New notes", zzz_notify_whatsapp: true };
      const mockDb = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([mockOrder]),
            }),
          }),
        }),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: () => Promise.resolve([updatedOrder]),
            }),
          }),
        }),
      } as unknown as Db;

      const result = await OrderService.update(mockDb, mockOrder.zzz_id, {
        zzz_notes: "New notes",
        zzz_notify_whatsapp: true,
      });
      expect(result).toEqual(updatedOrder);
      expect(result?.zzz_notes).toBe("New notes");
    });

    it("should return undefined when not found", async () => {
      const mockDb = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      } as unknown as Db;

      const result = await OrderService.update(mockDb, "nonexistent", {
        zzz_notes: "test",
      });
      expect(result).toBeUndefined();
    });

    it("should reject update on terminal status order", async () => {
      const terminalOrder = { ...mockOrder, zzz_global_status: "COMPLETED" as const };
      const mockDb = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([terminalOrder]),
            }),
          }),
        }),
      } as unknown as Db;

      await expect(
        OrderService.update(mockDb, mockOrder.zzz_id, { zzz_notes: "test" }),
      ).rejects.toThrow(OrderServiceError);
      await expect(
        OrderService.update(mockDb, mockOrder.zzz_id, { zzz_notes: "test" }),
      ).rejects.toThrow("Cannot update a terminal order");
    });
  });

  describe("getByReservationId", () => {
    it("should return orders for a given reservation", async () => {
      const mockDb = {
        select: () => ({
          from: () => createListBuilder([mockOrder]),
        }),
      } as unknown as Db;

      const result = await OrderService.getByReservationId(mockDb, "res-1");
      expect(result).toEqual([mockOrder]);
    });

    it("should return empty array when no orders", async () => {
      const mockDb = {
        select: () => ({
          from: () => createListBuilder([]),
        }),
      } as unknown as Db;

      const result = await OrderService.getByReservationId(mockDb, "nonexistent");
      expect(result).toEqual([]);
    });
  });

  // --- Transactional Methods ---

  describe("create", () => {
    const validInput = {
      zzz_reservation_id: "550e8400-e29b-41d4-a716-446655440001",
      zzz_product_category_id: 1,
      zzz_notify_whatsapp: false,
      zzz_items: [
        { zzz_catalog_item_id: 1, zzz_quantity: 2 },
        { zzz_catalog_item_id: 2, zzz_quantity: 1 },
      ],
    };

    const mockProduct1 = { zzz_id: 1, zzz_price: 25.0 };
    const mockProduct2 = { zzz_id: 2, zzz_price: 15.0 };

    const createTxDb = (
      reservationResult: unknown[],
      productResult: unknown[],
      options?: {
        orderResult?: unknown[];
        itemResult?: unknown[];
        categoryResult?: unknown[];
        venturesResult?: unknown[];
        occupiedCount?: number;
      },
    ) => {
      const mockTx = {
        select: (_fields?: unknown) => {
          return {
            from: (table: unknown) => {
              return {
                innerJoin: (_joinTable: unknown, _joinCond: unknown) => {
                  return {
                    where: () => {
                      return Promise.resolve([{ occupied: options?.occupiedCount ?? 0 }]);
                    },
                  };
                },
                where: () => {
                  let result: unknown[] = [];
                  if (table === reservations) {
                    result = reservationResult;
                  } else if (table === productCategories) {
                    result = options?.categoryResult ?? [{ zzz_id: 1, zzz_project_id: 1 }];
                  } else if (table === ventures) {
                    const list = (options?.venturesResult as Record<string, unknown>[]) ?? [
                      {
                        id: 1,
                        name: "Venture 1",
                        zzz_max_capacity: 10,
                        zzz_cascade_order: 0,
                        zzz_is_active: true,
                        zzz_is_paused: false,
                        zzz_product_category_id: 1,
                        zzz_project_id: 1,
                      },
                    ];
                    result = list.filter(
                      (v: Record<string, unknown>) =>
                        v.zzz_is_active === true && v.zzz_is_paused === false,
                    );
                  } else if (table === products) {
                    result = productResult;
                  }
                  return createWhereChain(result);
                },
              };
            },
          };
        },
        insert: (insertTable: unknown) => {
          return {
            values: (vals: unknown) => {
              return {
                returning: () => {
                  if (insertTable === orders) {
                    const createdOrder = {
                      ...mockOrder,
                      ...(vals as Record<string, unknown>),
                      zzz_id: mockOrder.zzz_id,
                    };
                    return Promise.resolve([createdOrder]);
                  } else {
                    const items = Array.isArray(vals) ? (vals as unknown[]) : [vals];
                    const createdItems = items.map((item: unknown, i: number) => ({
                      ...(item as Record<string, unknown>),
                      zzz_id: `item-${i}`,
                    }));
                    return Promise.resolve(createdItems);
                  }
                },
              };
            },
          };
        },
      };

      return {
        transaction: async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      } as unknown as Db;
    };

    it("should create order + items in a transaction and assign to available venture", async () => {
      const mockDb = createTxDb([mockReservation], [mockProduct1, mockProduct2]);

      const result = await OrderService.create(mockDb, "user-1", validInput);
      expect(result).toBeDefined();
      expect(result.zzz_global_status).toBe("OFFER_PENDING");
      expect(result.zzz_current_offer_venture_id).toBe(1);
      expect(result.zzz_items).toHaveLength(2);
    });

    it("should preserve zzz_notes on each item when creating an order", async () => {
      const inputWithNotes = {
        ...validInput,
        zzz_items: [
          { zzz_catalog_item_id: 1, zzz_quantity: 2, zzz_notes: "Sin cebolla" },
          { zzz_catalog_item_id: 2, zzz_quantity: 1, zzz_notes: "Bien cocida" },
        ],
      };

      const mockDb = createTxDb([mockReservation], [mockProduct1, mockProduct2]);

      const result = await OrderService.create(mockDb, "user-1", inputWithNotes);

      expect(result.zzz_items).toHaveLength(2);
      expect(result.zzz_items[0].zzz_notes).toBe("Sin cebolla");
      expect(result.zzz_items[1].zzz_notes).toBe("Bien cocida");
    });

    it("should reject if reservation does not exist", async () => {
      const mockDb = createTxDb([], []);
      await expect(OrderService.create(mockDb, "user-1", validInput)).rejects.toThrow(
        "Reservation not found",
      );
    });

    it("should reject if reservation belongs to different user", async () => {
      const otherReservation = { ...mockReservation, zzz_user_id: "other-user" };
      const mockDb = createTxDb([otherReservation], []);
      await expect(OrderService.create(mockDb, "user-1", validInput)).rejects.toThrow(
        "Order must belong to your reservation",
      );
    });

    it("should reject if reservation is cancelled", async () => {
      const cancelledReservation = {
        ...mockReservation,
        zzz_status: "CANCELLED" as const,
      };
      const mockDb = createTxDb([cancelledReservation], []);
      await expect(OrderService.create(mockDb, "user-1", validInput)).rejects.toThrow(
        "Cannot create orders on a cancelled reservation",
      );
    });

    it("should snapshot prices from catalog", async () => {
      const priceProducts = [
        { zzz_id: 1, zzz_price: 25.0 },
        { zzz_id: 2, zzz_price: 15.0 },
      ];
      const mockDb = createTxDb([mockReservation], priceProducts);

      const result = await OrderService.create(mockDb, "user-1", validInput);

      expect(result.zzz_items).toHaveLength(2);
      expect(result.zzz_items[0].zzz_price).toBe(25.0);
      expect(result.zzz_items[1].zzz_price).toBe(15.0);
    });

    it("should reject if catalog item not found (rollback)", async () => {
      const mockDb = createTxDb([mockReservation], [mockProduct1]);

      await expect(OrderService.create(mockDb, "user-1", validInput)).rejects.toThrow(
        "Catalog items not found",
      );
    });

    it("should auto-expire order if no ventures are found", async () => {
      const mockDb = createTxDb([mockReservation], [mockProduct1, mockProduct2], {
        venturesResult: [],
      });

      const result = await OrderService.create(mockDb, "user-1", validInput);
      expect(result.zzz_global_status).toBe("EXPIRED");
      expect(result.zzz_cancel_reason).toBe("NO_VENTURE_AVAILABLE");
      expect(result.zzz_current_offer_venture_id).toBeNull();
    });

    it("should skip paused/inactive ventures and match active ones", async () => {
      const customVentures = [
        {
          id: 1,
          name: "Venture 1 (Paused)",
          zzz_max_capacity: 10,
          zzz_cascade_order: 0,
          zzz_is_active: true,
          zzz_is_paused: true,
          zzz_product_category_id: 1,
          zzz_project_id: 1,
        },
        {
          id: 2,
          name: "Venture 2 (Active)",
          zzz_max_capacity: 10,
          zzz_cascade_order: 1,
          zzz_is_active: true,
          zzz_is_paused: false,
          zzz_product_category_id: 1,
          zzz_project_id: 1,
        },
      ];
      const mockDb = createTxDb([mockReservation], [mockProduct1, mockProduct2], {
        venturesResult: customVentures,
      });

      const result = await OrderService.create(mockDb, "user-1", validInput);
      expect(result.zzz_global_status).toBe("OFFER_PENDING");
      // Should match venture 2 since venture 1 is paused
      expect(result.zzz_current_offer_venture_id).toBe(2);
    });

    it("should auto-expire order if venture is over capacity", async () => {
      const customReservation = {
        ...mockReservation,
        zzz_guest_count: 5,
      };
      // Guest count is 5, venture capacity is 10.
      // If occupied count is 6, total is 11 > 10, so capacity check fails!
      const mockDb = createTxDb([customReservation], [mockProduct1, mockProduct2], {
        occupiedCount: 6,
      });

      const result = await OrderService.create(mockDb, "user-1", validInput);
      expect(result.zzz_global_status).toBe("EXPIRED");
      expect(result.zzz_cancel_reason).toBe("NO_VENTURE_AVAILABLE");
      expect(result.zzz_current_offer_venture_id).toBeNull();
    });
  });

  describe("updateStatus", () => {
    const createUpdateStatusTxDb = (currentOrder: unknown) => {
      let capturedSetData: Record<string, unknown> = {};

      const mockTx = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve(currentOrder ? [currentOrder] : []),
            }),
          }),
        }),
        update: () => ({
          set: (data: Record<string, unknown>) => {
            capturedSetData = data;
            return {
              where: () => ({
                returning: () =>
                  Promise.resolve(
                    currentOrder ? [{ ...(currentOrder as object), ...capturedSetData }] : [],
                  ),
              }),
            };
          },
        }),
      };

      return {
        transaction: async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      } as unknown as Db;
    };

    it("should apply valid transition SEARCHING -> OFFER_PENDING", async () => {
      const mockDb = createUpdateStatusTxDb(mockOrder);

      const result = await OrderService.updateStatus(
        mockDb,
        mockOrder.zzz_id,
        { zzz_global_status: "OFFER_PENDING" },
        "user-1",
        "ADMIN" as never,
      );
      expect(result.zzz_global_status).toBe("OFFER_PENDING");
    });

    it("should reject invalid transition", async () => {
      const mockDb = createUpdateStatusTxDb(mockOrder);
      const promise = OrderService.updateStatus(
        mockDb,
        mockOrder.zzz_id,
        { zzz_global_status: "CONFIRMED" },
        "user-1",
        "ADMIN" as never,
      );

      await expect(promise).rejects.toThrow(OrderServiceError);
      await expect(promise).rejects.toThrow(
        "Invalid status transition from SEARCHING to CONFIRMED",
      );
    });

    it("should reject transition from terminal state", async () => {
      const terminalOrder = { ...mockOrder, zzz_global_status: "COMPLETED" as const };
      const mockDb = createUpdateStatusTxDb(terminalOrder);
      const promise = OrderService.updateStatus(
        mockDb,
        mockOrder.zzz_id,
        { zzz_global_status: "CONFIRMED" },
        "user-1",
        "ADMIN" as never,
      );

      await expect(promise).rejects.toThrow(OrderServiceError);
      await expect(promise).rejects.toThrow(
        "Invalid status transition from COMPLETED to CONFIRMED",
      );
    });

    it("should set confirmed_at on CONFIRMED transition", async () => {
      const offerPendingOrder = {
        ...mockOrder,
        zzz_global_status: "OFFER_PENDING" as const,
      };
      let capturedSetData: Record<string, unknown> = {};

      const mockTx = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([offerPendingOrder]),
            }),
          }),
        }),
        update: () => ({
          set: (data: Record<string, unknown>) => {
            capturedSetData = data;
            return {
              where: () => ({
                returning: () =>
                  Promise.resolve([
                    {
                      ...offerPendingOrder,
                      ...data,
                      zzz_global_status: "CONFIRMED",
                    },
                  ]),
              }),
            };
          },
        }),
      };

      const mockDb = {
        transaction: async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      } as unknown as Db;

      const result = await OrderService.updateStatus(
        mockDb,
        mockOrder.zzz_id,
        { zzz_global_status: "CONFIRMED" },
        "user-1",
        "ADMIN" as never,
      );

      expect(result.zzz_global_status).toBe("CONFIRMED");
      expect(capturedSetData.zzz_confirmed_at).toBeInstanceOf(Date);
      expect(capturedSetData.zzz_cancelled_at).toBeUndefined();
      expect(capturedSetData.zzz_completed_at).toBeUndefined();
    });

    it("should set cancelled_at + cancel_reason on CANCELLED transition", async () => {
      const offerPendingOrder = {
        ...mockOrder,
        zzz_global_status: "OFFER_PENDING" as const,
      };
      let capturedSetData: Record<string, unknown> = {};

      const mockTx = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([offerPendingOrder]),
            }),
          }),
        }),
        update: () => ({
          set: (data: Record<string, unknown>) => {
            capturedSetData = data;
            return {
              where: () => ({
                returning: () =>
                  Promise.resolve([
                    {
                      ...offerPendingOrder,
                      ...data,
                      zzz_global_status: "CANCELLED",
                    },
                  ]),
              }),
            };
          },
        }),
      };

      const mockDb = {
        transaction: async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      } as unknown as Db;

      const result = await OrderService.updateStatus(
        mockDb,
        mockOrder.zzz_id,
        { zzz_global_status: "CANCELLED", zzz_cancel_reason: "BY_TOURIST" },
        "user-1",
        "ADMIN" as never,
      );

      expect(result.zzz_global_status).toBe("CANCELLED");
      expect(capturedSetData.zzz_cancelled_at).toBeInstanceOf(Date);
      expect(capturedSetData.zzz_cancel_reason).toBe("BY_TOURIST");
    });

    it("should set completed_at on COMPLETED transition", async () => {
      const confirmedOrder = {
        ...mockOrder,
        zzz_global_status: "CONFIRMED" as const,
      };
      let capturedSetData: Record<string, unknown> = {};

      const mockTx = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([confirmedOrder]),
            }),
          }),
        }),
        update: () => ({
          set: (data: Record<string, unknown>) => {
            capturedSetData = data;
            return {
              where: () => ({
                returning: () =>
                  Promise.resolve([
                    {
                      ...confirmedOrder,
                      ...data,
                      zzz_global_status: "COMPLETED",
                    },
                  ]),
              }),
            };
          },
        }),
      };

      const mockDb = {
        transaction: async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx),
      } as unknown as Db;

      const result = await OrderService.updateStatus(
        mockDb,
        mockOrder.zzz_id,
        { zzz_global_status: "COMPLETED" },
        "user-1",
        "ADMIN" as never,
      );

      expect(result.zzz_global_status).toBe("COMPLETED");
      expect(capturedSetData.zzz_completed_at).toBeInstanceOf(Date);
      expect(capturedSetData.zzz_cancelled_at).toBeUndefined();
      expect(capturedSetData.zzz_confirmed_at).toBeUndefined();
    });
  });
});
