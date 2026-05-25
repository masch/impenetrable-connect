import { eq, and, desc, inArray, sql, type SQL } from "drizzle-orm";
import { type Db } from "../db";
import {
  orders,
  orderItems,
  reservations,
  ventures,
  productCategories,
  products,
} from "../db/schema";
import type {
  CreateOrderInput,
  UpdateOrderInput,
  UpdateOrderStatusInput,
  OrderStatus,
} from "@repo/shared";
import { UserRole } from "@repo/shared";
import {
  HTTP_BAD_REQUEST,
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND,
  HTTP_CONFLICT,
} from "../constants/http-status";

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  SEARCHING: ["OFFER_PENDING", "EXPIRED", "CANCELLED"],
  OFFER_PENDING: ["CONFIRMED", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  COMPLETED: [],
  NO_SHOW: [],
  CANCELLED: [],
  EXPIRED: [],
} as const;

const TERMINAL_STATUSES: Set<OrderStatus> = new Set([
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
  "EXPIRED",
]);

const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

const SINGLE_RESULT_LIMIT = 1;

export class OrderService {
  // -- TRANSITION VALIDATION (stateless utility) --
  static isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
    const allowed = ORDER_STATUS_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  static isTerminal(status: OrderStatus): boolean {
    return TERMINAL_STATUSES.has(status);
  }

  // -- CREATE (transactional: order + items) --
  static async create(db: Db, userId: string, input: CreateOrderInput) {
    return db.transaction(async (tx) => {
      // 1. Validate reservation exists, belongs to user, and is not cancelled
      const [reservation] = await tx
        .select()
        .from(reservations)
        .where(eq(reservations.zzz_id, input.zzz_reservation_id))
        .limit(SINGLE_RESULT_LIMIT);

      if (!reservation) {
        throw new OrderServiceError("Not Found", "Reservation not found", HTTP_NOT_FOUND);
      }
      if (reservation.zzz_user_id !== userId) {
        throw new OrderServiceError(
          "Forbidden",
          "Order must belong to your reservation",
          HTTP_FORBIDDEN,
        );
      }
      if (reservation.zzz_status === "CANCELLED") {
        throw new OrderServiceError(
          "Conflict",
          "Cannot create orders on a cancelled reservation",
          HTTP_CONFLICT,
        );
      }

      // 1.5 Validate category exists
      const [category] = await tx
        .select()
        .from(productCategories)
        .where(eq(productCategories.zzz_id, input.zzz_product_category_id))
        .limit(SINGLE_RESULT_LIMIT);

      if (!category) {
        throw new OrderServiceError("Not Found", "Product category not found", HTTP_NOT_FOUND);
      }

      // Fetch active, unpaused ventures for categoryId ordered by cascade_order ASC
      const availableVentures = await tx
        .select()
        .from(ventures)
        .where(
          and(
            eq(ventures.zzz_product_category_id, input.zzz_product_category_id),
            eq(ventures.zzz_project_id, category.zzz_project_id),
            eq(ventures.zzz_is_active, true),
            eq(ventures.zzz_is_paused, false),
          ),
        )
        .orderBy(ventures.zzz_cascade_order);

      // Find matching venture based on capacity
      let matchedVentureId: number | null = null;
      for (const venture of availableVentures) {
        const [occupationRow] = await tx
          .select({
            occupied: sql<number>`COALESCE(SUM(${reservations.zzz_guest_count}), 0)::int`,
          })
          .from(orders)
          .innerJoin(reservations, eq(orders.zzz_reservation_id, reservations.zzz_id))
          .where(
            and(
              eq(orders.zzz_confirmed_venture_id, venture.id),
              eq(reservations.zzz_service_at, reservation.zzz_service_at),
              eq(orders.zzz_global_status, "CONFIRMED"),
            ),
          );

        const occupied = occupationRow?.occupied ?? 0;
        if (occupied + reservation.zzz_guest_count <= venture.zzz_max_capacity) {
          matchedVentureId = venture.id;
          break;
        }
      }

      // Determine initial order fields
      const status: OrderStatus = matchedVentureId !== null ? "OFFER_PENDING" : "EXPIRED";
      const cancelReason = matchedVentureId === null ? ("NO_VENTURE_AVAILABLE" as const) : null;

      // 2. Insert the order row
      const [order] = await tx
        .insert(orders)
        .values({
          zzz_reservation_id: input.zzz_reservation_id,
          zzz_product_category_id: input.zzz_product_category_id,
          zzz_notes: input.zzz_notes ?? null,
          zzz_notify_whatsapp: input.zzz_notify_whatsapp ?? false,
          zzz_global_status: status,
          zzz_current_offer_venture_id: matchedVentureId,
          zzz_cancel_reason: cancelReason,
        })
        .returning();

      // 3. Snapshot prices from products table
      const productIds = input.zzz_items.map((i) => i.zzz_catalog_item_id);
      const foundProducts = await tx
        .select()
        .from(products)
        .where(inArray(products.zzz_id, productIds));

      if (foundProducts.length !== productIds.length) {
        const foundIds = new Set(foundProducts.map((p) => p.zzz_id));
        const missing = productIds.filter((id) => !foundIds.has(id));
        throw new OrderServiceError(
          "Not Found",
          `Catalog items not found: ${missing.join(", ")}`,
          HTTP_NOT_FOUND,
        );
      }

      const priceMap = new Map(foundProducts.map((p) => [p.zzz_id, p.zzz_price]));
      const itemsToInsert = input.zzz_items.map((item) => ({
        zzz_order_id: order.zzz_id,
        zzz_catalog_item_id: item.zzz_catalog_item_id,
        zzz_quantity: item.zzz_quantity,
        zzz_price: priceMap.get(item.zzz_catalog_item_id)!,
        zzz_notes: item.zzz_notes ?? null,
      }));

      // 4. Insert order items
      const insertedItems = await tx.insert(orderItems).values(itemsToInsert).returning();

      return { ...order, zzz_items: insertedItems, zzz_reservation: reservation };
    });
  }

  // -- GET BY ID --
  static async getById(db: Db, id: string) {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.zzz_id, id))
      .limit(SINGLE_RESULT_LIMIT);
    return order;
  }

  // -- LIST (with role-scoped filters) --
  static async getAll(
    db: Db,
    filters: { status?: OrderStatus; reservation_id?: string; limit?: number; offset?: number },
    userRole: UserRole,
    userId: string,
  ) {
    const limit = Math.min(filters.limit ?? PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const offset = filters.offset ?? 0;

    const conditions: SQL[] = [];

    // Role scoping
    if (userRole === UserRole.TOURIST) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${sql.raw("impenetrable_connect.reservations")} r
          WHERE r.zzz_id = ${orders.zzz_reservation_id}
            AND r.zzz_user_id = ${userId}
        )`,
      );
    } else if (userRole === UserRole.ENTREPRENEUR) {
      conditions.push(
        sql`(
          ${orders.zzz_confirmed_venture_id} IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM ${sql.raw("impenetrable_connect.venture_members")} vm
            WHERE vm.venture_id = ${orders.zzz_confirmed_venture_id}
              AND vm.user_id = ${userId}
          )
        ) OR (
          ${orders.zzz_current_offer_venture_id} IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM ${sql.raw("impenetrable_connect.venture_members")} vm
            WHERE vm.venture_id = ${orders.zzz_current_offer_venture_id}
              AND vm.user_id = ${userId}
          )
        )`,
      );
    }

    // Optional filters
    if (filters.status) {
      conditions.push(eq(orders.zzz_global_status, filters.status));
    }
    if (filters.reservation_id) {
      conditions.push(eq(orders.zzz_reservation_id, filters.reservation_id));
    }

    const query = db.select().from(orders);
    const finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;
    const results = await finalQuery.orderBy(desc(orders.zzzCreatedAt)).limit(limit).offset(offset);

    // Populate zzz_reservation for each order so the mobile app can filter
    // by zzz_service_at and group by moment without extra API calls.
    const reservationIds = results
      .map((o) => o.zzz_reservation_id)
      .filter((id): id is string => !!id);

    const reservationMap = new Map<string, typeof reservations.$inferSelect>();
    if (reservationIds.length > 0) {
      const reservationRows = await db
        .select()
        .from(reservations)
        .where(inArray(reservations.zzz_id, reservationIds));
      for (const r of reservationRows) {
        reservationMap.set(r.zzz_id, r);
      }
    }

    // Populate zzz_items with product catalog data for the ReservartionCard display.
    const orderIds = results.map((o) => o.zzz_id);
    const itemsByOrderId = new Map<string, (typeof orderItems.$inferSelect)[]>();
    const productMap = new Map<number, typeof products.$inferSelect>();

    if (orderIds.length > 0) {
      const itemRows = await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.zzz_order_id, orderIds));

      const catalogIds = [...new Set(itemRows.map((i) => i.zzz_catalog_item_id))];
      if (catalogIds.length > 0) {
        const productRows = await db
          .select()
          .from(products)
          .where(inArray(products.zzz_id, catalogIds));
        for (const p of productRows) {
          productMap.set(p.zzz_id, p);
        }
      }

      for (const item of itemRows) {
        const existing = itemsByOrderId.get(item.zzz_order_id) ?? [];
        existing.push(item);
        itemsByOrderId.set(item.zzz_order_id, existing);
      }
    }

    return results.map((order) => {
      const rawItems = itemsByOrderId.get(order.zzz_id) ?? [];
      const enrichedItems = rawItems.map((item) => {
        const product = productMap.get(item.zzz_catalog_item_id);
        return {
          ...item,
          zzz_price: Number(item.zzz_price),
          zzz_catalog_item: product
            ? {
                zzz_id: product.zzz_id,
                zzz_product_category_id: product.zzz_product_category_id,
                zzz_name_i18n: product.zzz_name_i18n,
                zzz_description_i18n: product.zzz_description_i18n,
                zzz_price: Number(product.zzz_price),
                zzz_max_participants: product.zzz_max_participants,
                zzz_image_url: product.zzz_image_url,
                zzz_global_pause: product.zzz_global_pause,
                zzz_service_moments: product.zzz_service_moments,
              }
            : undefined,
        };
      });

      return {
        ...order,
        zzz_items: enrichedItems,
        zzz_reservation: reservationMap.get(order.zzz_reservation_id) ?? null,
      };
    });
  }

  // -- UPDATE metadata --
  static async update(db: Db, id: string, input: UpdateOrderInput) {
    const updateData: Record<string, unknown> = {};
    if (input.zzz_notes !== undefined) updateData.zzz_notes = input.zzz_notes;
    if (input.zzz_notify_whatsapp !== undefined)
      updateData.zzz_notify_whatsapp = input.zzz_notify_whatsapp;

    // Reject update if order is in terminal state
    const [current] = await db
      .select()
      .from(orders)
      .where(eq(orders.zzz_id, id))
      .limit(SINGLE_RESULT_LIMIT);
    if (!current) return undefined;
    if (this.isTerminal(current.zzz_global_status)) {
      throw new OrderServiceError(
        "Bad Request",
        "Cannot update a terminal order",
        HTTP_BAD_REQUEST,
      );
    }

    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.zzz_id, id))
      .returning();
    return updated;
  }

  // -- UPDATE STATUS (with transition validation + timestamp side effects) --
  static async updateStatus(
    db: Db,
    id: string,
    input: UpdateOrderStatusInput,
    _userId: string,
    _userRole: UserRole,
  ) {
    return db.transaction(async (tx) => {
      // Read current state INSIDE the transaction (avoids race conditions)
      const [current] = await tx
        .select()
        .from(orders)
        .where(eq(orders.zzz_id, id))
        .limit(SINGLE_RESULT_LIMIT);

      if (!current) {
        throw new OrderServiceError("Not Found", "Order not found", HTTP_NOT_FOUND);
      }

      const fromStatus = current.zzz_global_status;
      const toStatus = input.zzz_global_status;

      // Validate transition
      if (!this.isValidTransition(fromStatus, toStatus)) {
        throw new OrderServiceError(
          "Bad Request",
          `Invalid status transition from ${fromStatus} to ${toStatus}`,
          HTTP_BAD_REQUEST,
        );
      }

      // Side effects: set domain timestamps based on target status
      const setData: Record<string, unknown> = {
        zzz_global_status: toStatus,
      };

      if (toStatus === "CONFIRMED") {
        setData.zzz_confirmed_at = new Date();
      }
      if (toStatus === "CANCELLED") {
        setData.zzz_cancelled_at = new Date();
        setData.zzz_cancel_reason = input.zzz_cancel_reason;
      }
      if (toStatus === "COMPLETED") {
        setData.zzz_completed_at = new Date();
      }
      // EXPIRED and NO_SHOW: no domain timestamp set (only audit updated_at)

      const [updated] = await tx
        .update(orders)
        .set(setData)
        .where(eq(orders.zzz_id, id))
        .returning();

      return updated;
    });
  }

  // -- GET BY RESERVATION --
  static async getByReservationId(db: Db, reservationId: string) {
    return db
      .select()
      .from(orders)
      .where(eq(orders.zzz_reservation_id, reservationId))
      .orderBy(desc(orders.zzzCreatedAt));
  }
}

// Simple error class to carry HTTP status codes from service to route
export class OrderServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number,
  ) {
    super(message);
    this.name = "OrderServiceError";
  }
}
