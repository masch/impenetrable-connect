import { describe, expect, it, beforeEach, spyOn } from "bun:test";
import app from "../app";
import * as dbFactory from "../db/index";
import { resetDbCache } from "../middleware/db";

describe("Services API", () => {
  const TEST_ENV = {
    DATABASE_URL: "postgres://localhost:5432/db",
    JWT_SECRET: "test-secret",
  };

  const mockProject = {
    zzz_id: 1,
    zzz_name: "Active Project",
    zzz_is_active: true,
  };

  const mockCategories = [
    {
      zzz_id: 1,
      zzz_project_id: 1,
      zzz_name_i18n: { es: "Comidas", en: "Meals" },
      zzz_description_i18n: { es: "Platos principales", en: "Main courses" },
      zzz_is_active: true,
    },
  ];

  const mockItems = [
    {
      zzz_id: 1,
      zzz_product_category_id: 1,
      zzz_name_i18n: { es: "Milanesa napolitana", en: "Milanesa napolitana" },
      zzz_price: 8500,
      zzz_max_participants: 2,
      zzz_global_pause: false,
    },
  ];

  beforeEach(() => {
    resetDbCache();
  });

  interface MockQueryBuilder {
    where: () => MockQueryBuilder;
    orderBy: () => MockQueryBuilder;
    limit: () => Promise<unknown[]>;
    then: (resolve: (v: unknown) => unknown) => unknown;
    catch: (reject: (e: Error) => unknown) => unknown;
  }

  const createQueryBuilder = (result: unknown[]): MockQueryBuilder => {
    const builder: MockQueryBuilder = {
      where: () => builder,
      orderBy: () => builder,
      limit: () => Promise.resolve(result),
      then: (resolve: (v: unknown) => unknown) => resolve(result),
      catch: (reject: (e: Error) => unknown) => Promise.resolve(result).catch(reject),
    };
    return builder;
  };

  it("should return 200 OK with services for the first active project", async () => {
    let queryCount = 0;

    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      select: () => ({
        from: () => {
          queryCount++;
          const result =
            queryCount === 1 ? [mockProject] : queryCount === 2 ? mockCategories : mockItems;
          return createQueryBuilder(result);
        },
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const res = await app.request("/v1/services", {}, TEST_ENV);

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0]).toHaveProperty("zzz_id", 1);
    expect(body[0].zzz_name_i18n.es).toBe("Milanesa napolitana");

    createDbSpy.mockRestore();
  });

  it("should return 200 and empty array when no active project exists", async () => {
    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      select: () => ({
        from: () => createQueryBuilder([]),
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const res = await app.request("/v1/services", {}, TEST_ENV);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);

    createDbSpy.mockRestore();
  });
});
