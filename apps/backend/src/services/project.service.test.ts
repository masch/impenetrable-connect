import { describe, expect, it } from "bun:test";
import { ProjectService } from "./project.service";
import { type Db } from "../db";

describe("ProjectService", () => {
  const mockProject = {
    zzz_id: 1,
    zzz_name: "Test Project",
    zzz_default_language: "es",
    zzz_supported_languages: ["es"] as string[],
    zzz_cascade_timeout_minutes: 30,
    zzz_max_cascade_attempts: 10,
    zzz_is_active: true,
    zzzCreatedAt: new Date(),
    zzzUpdatedAt: new Date(),
    zzzDeletedAt: null as Date | null,
  };

  it("should get all projects ordered correctly", async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          orderBy: () => Promise.resolve([mockProject]),
        }),
      }),
    } as unknown as Db;

    const result = await ProjectService.getAll(mockDb);
    expect(result).toEqual([mockProject]);
  });

  it("should get a project by ID", async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => Promise.resolve([mockProject]),
          }),
        }),
      }),
    } as unknown as Db;

    const result = await ProjectService.getById(mockDb, 1);
    expect(result).toEqual(mockProject);
  });

  it("should get the first active project", async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            orderBy: () => ({
              limit: () => Promise.resolve([mockProject]),
            }),
          }),
        }),
      }),
    } as unknown as Db;

    const result = await ProjectService.getFirstActive(mockDb);
    expect(result).toEqual(mockProject);
  });

  it("should create a project and return it", async () => {
    const mockDb = {
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([mockProject]),
        }),
      }),
    } as unknown as Db;

    const result = await ProjectService.create(mockDb, {
      zzz_name: "Test Project",
      zzz_default_language: "es",
      zzz_supported_languages: ["es"],
    });
    expect(result).toEqual(mockProject);
  });
});
