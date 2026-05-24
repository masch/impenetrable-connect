import { eq, and, desc, sql, type SQL } from "drizzle-orm";
import { type Db } from "../db";
import { reservations } from "../db/schema";
import type {
  CreateReservationInput,
  UpdateReservationInput,
  ReservationStatus,
} from "@repo/shared";
import { UserRole } from "@repo/shared";

export class ReservationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationValidationError";
  }
}

export class ReservationAccessError extends Error {
  constructor(message: string = "Forbidden") {
    super(message);
    this.name = "ReservationAccessError";
  }
}

const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

const SINGLE_RESULT_LIMIT = 1;
const MAX_GUEST_COUNT = 99;
const RESERVATION_STATUS_CANCELLED: ReservationStatus = "CANCELLED";

export class ReservationService {
  static async create(db: Db, userId: string, input: CreateReservationInput) {
    // Business validation
    const serviceDate = new Date(input.zzz_service_at);
    if (serviceDate <= new Date()) {
      throw new ReservationValidationError("zzz_service_at must be in the future");
    }
    if (input.zzz_guest_count > MAX_GUEST_COUNT) {
      throw new ReservationValidationError("Guest count must be 99 or less");
    }

    const [reservation] = await db
      .insert(reservations)
      .values({
        zzz_user_id: userId,
        zzz_service_at: serviceDate,
        zzz_time_of_day: input.zzz_time_of_day,
        zzz_guest_count: input.zzz_guest_count,
      })
      .returning();
    return reservation;
  }

  static async getById(db: Db, id: string, userRole?: UserRole, userId?: string) {
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.zzz_id, id))
      .limit(SINGLE_RESULT_LIMIT);

    if (!reservation || !userRole) {
      return reservation;
    }

    // Role-based scoping for single-resource access
    if (userRole === UserRole.TOURIST && reservation.zzz_user_id !== userId) {
      throw new ReservationAccessError();
    }

    return reservation;
  }

  static async getAll(
    db: Db,
    filters: { status?: string; limit?: number; offset?: number },
    userRole: UserRole,
    userId: string,
  ) {
    const limit = Math.min(filters.limit ?? PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const offset = filters.offset ?? 0;

    const conditions: SQL[] = [];

    if (userRole === UserRole.TOURIST) {
      conditions.push(eq(reservations.zzz_user_id, userId));
    } else if (userRole === UserRole.ENTREPRENEUR) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${sql.raw("impenetrable_connect.orders")} o
          LEFT JOIN ${sql.raw("impenetrable_connect.venture_members")} vm
            ON (o.zzz_confirmed_venture_id = vm.venture_id OR o.zzz_current_offer_venture_id = vm.venture_id)
          WHERE o.zzz_reservation_id = ${reservations.zzz_id}
            AND vm.user_id = ${userId}
        )`,
      );
    }

    if (filters.status) {
      conditions.push(eq(reservations.zzz_status, filters.status as ReservationStatus));
    }

    const query = db.select().from(reservations);
    const finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;
    return finalQuery.orderBy(desc(reservations.zzzCreatedAt)).limit(limit).offset(offset);
  }

  static async update(db: Db, id: string, input: UpdateReservationInput) {
    // Fetch current state for business validation
    const [current] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.zzz_id, id))
      .limit(SINGLE_RESULT_LIMIT);

    if (!current) {
      return undefined;
    }

    // Business validation
    if (current.zzz_status === RESERVATION_STATUS_CANCELLED) {
      throw new ReservationValidationError("Cannot update a cancelled reservation");
    }
    if (input.zzz_service_at && new Date(input.zzz_service_at) <= new Date()) {
      throw new ReservationValidationError("zzz_service_at must be in the future");
    }

    const updateData: Record<string, unknown> = {};
    if (input.zzz_service_at !== undefined)
      updateData.zzz_service_at = new Date(input.zzz_service_at);
    if (input.zzz_time_of_day !== undefined) updateData.zzz_time_of_day = input.zzz_time_of_day;
    if (input.zzz_guest_count !== undefined) updateData.zzz_guest_count = input.zzz_guest_count;

    const [updated] = await db
      .update(reservations)
      .set(updateData)
      .where(eq(reservations.zzz_id, id))
      .returning();
    return updated;
  }
}
