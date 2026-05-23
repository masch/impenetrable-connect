import { asc, desc, eq, inArray } from "drizzle-orm";
import { type Db } from "../db";
import { ventures, ventureMembers } from "../db/schema";
import { type CreateVentureInput, type UpdateVentureInput } from "@repo/shared";

export class VentureService {
  /**
   * Returns all ventures ordered by active status (desc) then name (asc).
   */
  static async getAll(db: Db) {
    return db.select().from(ventures).orderBy(desc(ventures.zzz_is_active), asc(ventures.name));
  }

  /**
   * Returns ventures where the user is a member, ordered by active status (desc) then name (asc).
   */
  static async getByUserId(db: Db, userId: string) {
    const memberships = await db
      .select({ ventureId: ventureMembers.ventureId })
      .from(ventureMembers)
      .where(eq(ventureMembers.userId, userId));

    if (memberships.length === 0) {
      return [];
    }

    const ventureIds = memberships.map((m) => m.ventureId);

    return db
      .select()
      .from(ventures)
      .where(inArray(ventures.id, ventureIds))
      .orderBy(desc(ventures.zzz_is_active), asc(ventures.name));
  }

  /**
   * Creates a new venture and returns the created record.
   */
  static async create(db: Db, input: CreateVentureInput) {
    const [newVenture] = await db.insert(ventures).values(input).returning();
    return newVenture;
  }

  /**
   * Updates an existing venture by ID. Returns updated record, or undefined if not found.
   */
  static async update(db: Db, id: number, input: UpdateVentureInput) {
    const [updated] = await db.update(ventures).set(input).where(eq(ventures.id, id)).returning();
    return updated;
  }

  /**
   * Soft-deletes a venture (sets zzz_is_active to false and zzzDeletedAt).
   * Returns deleted record, or undefined if not found.
   */
  static async softDelete(db: Db, id: number) {
    const [deleted] = await db
      .update(ventures)
      .set({ zzz_is_active: false, zzzDeletedAt: new Date() })
      .where(eq(ventures.id, id))
      .returning();
    return deleted;
  }
}
