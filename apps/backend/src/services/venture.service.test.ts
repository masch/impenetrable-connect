import { describe, expect, it } from "bun:test";
import { VentureService } from "./venture.service";
import { type Db } from "../db";

describe("VentureService", () => {
  const mockVenture = {
    id: 1,
    name: "Test Venture",
    ownerId: "uuid-owner",
    zzz_project_id: 1,
    zzz_max_capacity: 10,
    zzz_cascade_order: 1,
    zzz_is_paused: false,
    zzz_is_active: true,
    zzz_product_category_id: 1,
    zzzCreatedAt: new Date(),
    zzzUpdatedAt: new Date(),
    zzzDeletedAt: null as Date | null,
  };

  it("should get all ventures ordered correctly", async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          orderBy: () => Promise.resolve([mockVenture]),
        }),
      }),
    } as unknown as Db;

    const result = await VentureService.getAll(mockDb);
    expect(result).toEqual([mockVenture]);
  });

  it("should get ventures by user ID", async () => {
    // Extend mockDb for subsequent query inside getByUserId
    const mockDbWithVentureList = {
      select: (arg?: unknown) => {
        if (arg && typeof arg === "object" && "ventureId" in arg) {
          return {
            from: () => ({
              where: () => Promise.resolve([{ ventureId: 1 }]),
            }),
          };
        }
        return {
          from: () => ({
            where: () => ({
              orderBy: () => Promise.resolve([mockVenture]),
            }),
          }),
        };
      },
    } as unknown as Db;

    const result = await VentureService.getByUserId(mockDbWithVentureList, "uuid-owner");
    expect(result).toEqual([mockVenture]);
  });

  it("should create a venture", async () => {
    const mockDb = {
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([mockVenture]),
        }),
      }),
    } as unknown as Db;

    const result = await VentureService.create(mockDb, {
      name: "Test Venture",
      ownerId: "uuid-owner",
      zzz_project_id: 1,
      zzz_max_capacity: 10,
      zzz_cascade_order: 1,
      zzz_is_paused: false,
      zzz_is_active: true,
      zzz_product_category_id: 1,
    });
    expect(result).toEqual(mockVenture);
  });

  it("should update a venture", async () => {
    const mockDb = {
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([mockVenture]),
          }),
        }),
      }),
    } as unknown as Db;

    const result = await VentureService.update(mockDb, 1, { name: "Updated Venture" });
    expect(result).toEqual(mockVenture);
  });

  it("should soft-delete a venture", async () => {
    const mockDb = {
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{ ...mockVenture, zzz_is_active: false }]),
          }),
        }),
      }),
    } as unknown as Db;

    const result = await VentureService.softDelete(mockDb, 1);
    expect(result?.zzz_is_active).toBe(false);
  });
});
