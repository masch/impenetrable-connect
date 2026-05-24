import { describe, expect, it } from "bun:test";
import {
  ReservationService,
  ReservationValidationError,
  ReservationAccessError,
} from "./reservation.service";
import { type Db } from "../db";

describe("ReservationService", () => {
  const mockReservation = {
    zzz_id: "550e8400-e29b-41d4-a716-446655440000",
    zzz_user_id: "user-1",
    zzz_service_at: new Date("2026-06-15T10:00:00.000Z"),
    zzz_time_of_day: "LUNCH" as const,
    zzz_status: "CREATED" as const,
    zzz_guest_count: 4,
    zzzCreatedAt: new Date("2026-05-24T00:00:00.000Z"),
    zzzUpdatedAt: new Date("2026-05-24T00:00:00.000Z"),
    zzzDeletedAt: null as Date | null,
  };

  const validInput = {
    zzz_service_at: "2026-06-15T10:00:00Z",
    zzz_time_of_day: "LUNCH" as const,
    zzz_guest_count: 4,
  };

  const createListBuilder = (result: unknown[]) => {
    const builder = {
      where: () => builder,
      orderBy: () => builder,
      limit: () => builder,
      offset: () => Promise.resolve(result),
      then: (resolve: (v: unknown) => unknown) => resolve(result),
      catch: (reject: (e: Error) => unknown) => Promise.resolve(result).catch(reject),
    };
    return builder;
  };

  describe("create", () => {
    it("should create a reservation and return it", async () => {
      const mockDb = {
        insert: () => ({
          values: () => ({
            returning: () => Promise.resolve([mockReservation]),
          }),
        }),
      } as unknown as Db;

      const result = await ReservationService.create(mockDb, "user-1", validInput);
      expect(result).toEqual(mockReservation);
    });

    it("should use the provided user_id", async () => {
      let capturedValues: Record<string, unknown> = {};
      const mockDb = {
        insert: () => ({
          values: (vals: Record<string, unknown>) => {
            capturedValues = vals;
            return {
              returning: () => Promise.resolve([mockReservation]),
            };
          },
        }),
      } as unknown as Db;

      await ReservationService.create(mockDb, "custom-user-id", validInput);
      expect(capturedValues.zzz_user_id).toBe("custom-user-id");
    });

    it("should reject service_at in the past", async () => {
      const mockDb = {} as unknown as Db;
      const pastInput = { ...validInput, zzz_service_at: "2020-01-01T00:00:00Z" };

      await expect(ReservationService.create(mockDb, "user-1", pastInput)).rejects.toThrow(
        ReservationValidationError,
      );
      await expect(ReservationService.create(mockDb, "user-1", pastInput)).rejects.toThrow(
        "zzz_service_at must be in the future",
      );
    });

    it("should reject guest count above 99", async () => {
      const mockDb = {} as unknown as Db;
      const largeInput = { ...validInput, zzz_guest_count: 100 };

      await expect(ReservationService.create(mockDb, "user-1", largeInput)).rejects.toThrow(
        ReservationValidationError,
      );
      await expect(ReservationService.create(mockDb, "user-1", largeInput)).rejects.toThrow(
        "Guest count must be 99 or less",
      );
    });
  });

  describe("getById", () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockReservation]),
          }),
        }),
      }),
    } as unknown as Db;

    it("should return a reservation by UUID", async () => {
      const result = await ReservationService.getById(mockDb, mockReservation.zzz_id);
      expect(result).toEqual(mockReservation);
    });

    it("should return undefined when not found", async () => {
      const emptyDb = {
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([]),
            }),
          }),
        }),
      } as unknown as Db;

      const result = await ReservationService.getById(emptyDb, "nonexistent-uuid");
      expect(result).toBeUndefined();
    });

    describe("scoping", () => {
      it("should skip scoping when no userRole provided", async () => {
        const result = await ReservationService.getById(mockDb, mockReservation.zzz_id);
        expect(result).toEqual(mockReservation);
      });

      it("should allow TOURIST to access own reservation", async () => {
        const result = await ReservationService.getById(
          mockDb,
          mockReservation.zzz_id,
          "TOURIST" as never,
          mockReservation.zzz_user_id,
        );
        expect(result).toEqual(mockReservation);
      });

      it("should throw ReservationAccessError when TOURIST accesses another's reservation", async () => {
        await expect(
          ReservationService.getById(
            mockDb,
            mockReservation.zzz_id,
            "TOURIST" as never,
            "other-user",
          ),
        ).rejects.toThrow(ReservationAccessError);
      });

      it("should allow ADMIN to access any reservation", async () => {
        const result = await ReservationService.getById(
          mockDb,
          mockReservation.zzz_id,
          "ADMIN" as never,
          "other-user",
        );
        expect(result).toEqual(mockReservation);
      });

      it("should throw ReservationAccessError with default 'Forbidden' message", async () => {
        try {
          await ReservationService.getById(
            mockDb,
            mockReservation.zzz_id,
            "TOURIST" as never,
            "other-user",
          );
          expect.unreachable();
        } catch (error) {
          if (error instanceof ReservationAccessError) {
            expect(error.message).toBe("Forbidden");
          } else {
            throw error;
          }
        }
      });
    });
  });

  describe("getAll", () => {
    it("should return all reservations for ADMIN", async () => {
      const mockDb = {
        select: () => ({
          from: () => createListBuilder([mockReservation]),
        }),
      } as unknown as Db;

      const result = await ReservationService.getAll(mockDb, {}, "ADMIN" as never, "user-1");
      expect(result).toEqual([mockReservation]);
    });

    it("should filter by user_id for TOURIST", async () => {
      const mockDb = {
        select: () => ({
          from: () => createListBuilder([mockReservation]),
        }),
      } as unknown as Db;

      const result = await ReservationService.getAll(mockDb, {}, "TOURIST" as never, "user-1");
      expect(result).toEqual([mockReservation]);
    });

    it("should apply status filter when provided", async () => {
      const mockDb = {
        select: () => ({
          from: () => createListBuilder([mockReservation]),
        }),
      } as unknown as Db;

      const result = await ReservationService.getAll(
        mockDb,
        { status: "CREATED" },
        "ADMIN" as never,
        "user-1",
      );
      expect(result).toEqual([mockReservation]);
    });

    it("should apply limit and offset", async () => {
      const mockDb = {
        select: () => ({
          from: () => createListBuilder([mockReservation]),
        }),
      } as unknown as Db;

      const result = await ReservationService.getAll(
        mockDb,
        { limit: 5, offset: 10 },
        "ADMIN" as never,
        "user-1",
      );
      expect(result).toEqual([mockReservation]);
    });

    it("should default to limit 20 when not provided", async () => {
      let capturedLimit: number | undefined;
      let capturedOffset: number | undefined;

      const mockDb = {
        select: () => ({
          from: () => {
            const builder = {
              where: () => builder,
              orderBy: () => builder,
              limit: (l: number) => {
                capturedLimit = l;
                return builder;
              },
              offset: (o: number) => {
                capturedOffset = o;
                return Promise.resolve([mockReservation]);
              },
              then: (resolve: (v: unknown) => unknown) => resolve([mockReservation]),
              catch: (reject: (e: Error) => unknown) =>
                Promise.resolve([mockReservation]).catch(reject),
            };
            return builder;
          },
        }),
      } as unknown as Db;

      await ReservationService.getAll(mockDb, {}, "ADMIN" as never, "user-1");
      expect(capturedLimit).toBe(20);
      expect(capturedOffset).toBe(0);
    });

    it("should cap limit at 100", async () => {
      let capturedLimit: number | undefined;

      const mockDb = {
        select: () => ({
          from: () => {
            const builder = {
              where: () => builder,
              orderBy: () => builder,
              limit: (l: number) => {
                capturedLimit = l;
                return builder;
              },
              offset: (_o: number) => {
                return Promise.resolve([mockReservation]);
              },
              then: (resolve: (v: unknown) => unknown) => resolve([mockReservation]),
              catch: (_reject: (e: Error) => unknown) =>
                Promise.resolve([mockReservation]).catch(_reject),
            };
            return builder;
          },
        }),
      } as unknown as Db;

      await ReservationService.getAll(mockDb, { limit: 200 }, "ADMIN" as never, "user-1");
      expect(capturedLimit).toBe(100);
    });

    it("should return empty array when no matches", async () => {
      const mockDb = {
        select: () => ({
          from: () => createListBuilder([]),
        }),
      } as unknown as Db;

      const result = await ReservationService.getAll(
        mockDb,
        { status: "CANCELLED" },
        "ADMIN" as never,
        "user-1",
      );
      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    const updateInput = {
      zzz_guest_count: 6,
    };

    const selectChain = (result: unknown[]) => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(result),
        }),
      }),
    });

    it("should update reservation metadata", async () => {
      const updatedReservation = { ...mockReservation, zzz_guest_count: 6 };
      const mockDb = {
        select: () => selectChain([mockReservation]),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: () => Promise.resolve([updatedReservation]),
            }),
          }),
        }),
      } as unknown as Db;

      const result = await ReservationService.update(mockDb, mockReservation.zzz_id, updateInput);
      expect(result).toEqual(updatedReservation);
      expect(result?.zzz_guest_count).toBe(6);
    });

    it("should return undefined when not found", async () => {
      const mockDb = {
        select: () => selectChain([]),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: () => Promise.resolve([]),
            }),
          }),
        }),
      } as unknown as Db;

      const result = await ReservationService.update(mockDb, "nonexistent-uuid", updateInput);
      expect(result).toBeUndefined();
    });

    it("should reject update of cancelled reservation", async () => {
      const cancelledReservation = { ...mockReservation, zzz_status: "CANCELLED" };
      const mockDb = {
        select: () => selectChain([cancelledReservation]),
      } as unknown as Db;

      await expect(
        ReservationService.update(mockDb, mockReservation.zzz_id, updateInput),
      ).rejects.toThrow(ReservationValidationError);
      await expect(
        ReservationService.update(mockDb, mockReservation.zzz_id, updateInput),
      ).rejects.toThrow("Cannot update a cancelled reservation");
    });

    it("should reject update with past service_at", async () => {
      const mockDb = {
        select: () => selectChain([mockReservation]),
      } as unknown as Db;

      await expect(
        ReservationService.update(mockDb, mockReservation.zzz_id, {
          zzz_service_at: "2020-01-01T00:00:00Z",
        }),
      ).rejects.toThrow(ReservationValidationError);
      await expect(
        ReservationService.update(mockDb, mockReservation.zzz_id, {
          zzz_service_at: "2020-01-01T00:00:00Z",
        }),
      ).rejects.toThrow("zzz_service_at must be in the future");
    });
  });
});
