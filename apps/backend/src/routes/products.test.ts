import { describe, expect, it, beforeAll, beforeEach, spyOn } from "bun:test";
import app from "../app";
import { sign } from "hono/jwt";
import * as dbFactory from "../db/index";
import { resetDbCache } from "../middleware/db";

describe("Products API", () => {
  const TEST_ENV = {
    DATABASE_URL: "postgres://localhost:5432/db",
    JWT_SECRET: "test-secret",
  };

  let token: string;

  const mockCategories = [
    {
      zzz_id: 1,
      zzz_project_id: 1,
      zzz_name_i18n: { es: "Comidas", en: "Meals" },
      zzz_description_i18n: { es: "Platos principales", en: "Main courses" },
      zzz_is_active: true,
      zzzCreatedAt: new Date(),
      zzzUpdatedAt: new Date(),
      zzzDeletedAt: null,
    },
  ];

  const mockItems = [
    {
      zzz_id: 1,
      zzz_product_category_id: 1,
      zzz_name_i18n: { es: "Milanesa napolitana", en: "Milanesa napolitana" },
      zzz_description_i18n: {
        es: "Milanesa de carne con salsa de tomate, jamón, muzzarella y papas fritas",
        en: "Breaded beef cutlet with tomato sauce, ham, mozzarella and french fries",
      },
      zzz_price: 8500,
      zzz_max_participants: 2,
      zzz_image_url: null,
      zzz_global_pause: false,
      zzz_service_moments: ["LUNCH", "DINNER"],
      zzzCreatedAt: new Date(),
      zzzUpdatedAt: new Date(),
      zzzDeletedAt: null,
    },
  ];

  /**
   * Creates a thenable query builder for select chain.
   */
  const createQueryBuilder = (result: unknown[]) => {
    const builder = {
      where: () => Promise.resolve(result),
      orderBy: () => Promise.resolve(result),
      then: (resolve: (v: unknown) => unknown) => resolve(result),
      catch: (reject: (e: Error) => unknown) => Promise.resolve(result).catch(reject),
    };
    return builder;
  };

  const mockDb = {
    select: () => ({
      from: () => createQueryBuilder([]),
    }),
  };

  beforeEach(() => {
    resetDbCache();
  });

  beforeAll(async () => {
    spyOn(dbFactory, "createDb").mockReturnValue(
      mockDb as unknown as ReturnType<typeof dbFactory.createDb>,
    );

    token = await sign(
      { sub: "1", role: "admin", exp: Math.floor(Date.now() / 1000) + 3600 },
      TEST_ENV.JWT_SECRET,
    );
  });

  it("should return 200 OK with products for a valid project", async () => {
    let queryCount = 0;

    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      select: () => ({
        from: () => {
          queryCount++;
          const result = queryCount === 1 ? mockCategories : mockItems;
          return {
            where: () => Promise.resolve(result),
            then: (resolve: (v: unknown) => unknown) => resolve(result),
            catch: (reject: (e: Error) => unknown) => Promise.resolve(result).catch(reject),
          };
        },
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const res = await app.request(
      "/v1/products?projectId=1",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      TEST_ENV,
    );

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);

    const item = body[0];
    expect(item).toHaveProperty("zzz_id", 1);
    expect(item).toHaveProperty("zzz_name_i18n");
    expect(item.zzz_name_i18n.es).toBe("Milanesa napolitana");
    expect(item).toHaveProperty("zzz_price", 8500);
    expect(item).toHaveProperty("zzz_max_participants", 2);
    expect(item).toHaveProperty("zzz_service_moments");
    expect(item.zzz_service_moments).toContain("LUNCH");

    // Category should be populated
    expect(item).toHaveProperty("zzz_category");
    expect(item.zzz_category).toHaveProperty("zzz_name_i18n");
    expect(item.zzz_category.zzz_name_i18n.es).toBe("Comidas");

    createDbSpy.mockRestore();
  });

  it("should return empty array when project has no products", async () => {
    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      select: () => ({
        from: () => ({
          where: () => Promise.resolve([]),
          then: (resolve: (v: unknown) => unknown) => resolve([]),
          catch: (reject: (e: Error) => unknown) => Promise.resolve([]).catch(reject),
        }),
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const res = await app.request(
      "/v1/products?projectId=999",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      TEST_ENV,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);

    createDbSpy.mockRestore();
  });

  it("should return 400 for invalid project ID", async () => {
    const res = await app.request(
      "/v1/products?projectId=invalid",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      TEST_ENV,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid project ID");
  });

  it("should return 401 without auth token", async () => {
    const res = await app.request("/v1/products?projectId=1", {}, TEST_ENV);

    expect(res.status).toBe(401);
  });

  it("should return 500 when database fails", async () => {
    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      select: () => ({
        from: () => {
          throw new Error("Database crash");
        },
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const res = await app.request(
      "/v1/products?projectId=1",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      TEST_ENV,
    );

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal Server Error");

    createDbSpy.mockRestore();
  });
});
