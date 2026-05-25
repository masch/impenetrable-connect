import { describe, expect, it, beforeAll, beforeEach, spyOn } from "bun:test";
import app from "../app";
import { sign } from "hono/jwt";
import * as dbFactory from "../db/index";
import { resetDbCache } from "../middleware/db";

describe("Ventures API", () => {
  const TEST_ENV = {
    DATABASE_URL: "postgres://localhost:5432/db",
    JWT_SECRET: "test-secret",
  };

  let token: string;

  /**
   * Creates a thenable query builder that handles where()/orderBy() chaining.
   * Drizzle query builders are thenable objects with chainable methods.
   * This mock mimics that pattern for select queries.
   */
  const createQueryBuilder = (result: unknown[]) => {
    const builder = {
      where: () => builder,
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
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([{ id: 1, name: "Test Venture AI", zzz_is_active: true }]),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    }),
  };

  beforeEach(() => {
    resetDbCache();
  });

  beforeAll(async () => {
    // Mock the DB factory to return a fake drizzle client
    spyOn(dbFactory, "createDb").mockReturnValue(
      mockDb as unknown as ReturnType<typeof dbFactory.createDb>,
    );

    token = await sign(
      { sub: "1", role: "admin", exp: Math.floor(Date.now() / 1000) + 3600 },
      TEST_ENV.JWT_SECRET,
    );
  });

  it("should return 200 OK and an array of ventures", async () => {
    const res = await app.request(
      "/v1/ventures",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      TEST_ENV,
    );

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);

    if (body.length > 0) {
      expect(body[0]).toHaveProperty("id");
      expect(body[0]).toHaveProperty("name");
    }
  });

  it("should create a new venture and return 201 Created", async () => {
    const newVentureData = {
      name: "Test Venture AI",
      ownerId: "123e4567-e89b-12d3-a456-426614174000",
      zzz_project_id: 1,
      zzz_max_capacity: 10,
      zzz_is_active: true,
      zzz_product_category_id: 1,
    };

    const res = await app.request(
      "/v1/ventures",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newVentureData),
      },
      TEST_ENV,
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("id");
    expect(body.name).toBe(newVentureData.name);
  });

  it("should return 400 Bad Request when validation fails", async () => {
    const invalidData = {
      name: "", // Empty name
      ownerId: "not-a-uuid", // Invalid UUID
      zzz_project_id: -1, // Invalid project ID
    };

    const res = await app.request(
      "/v1/ventures",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invalidData),
      },
      TEST_ENV,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
  });

  it("should return 500 Internal Server Error when database fails", async () => {
    // Override mock for this specific test
    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      insert: () => ({
        values: () => ({
          returning: () => Promise.reject(new Error("Database crash")),
        }),
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const ventureData = {
      name: "Failing Venture",
      ownerId: "123e4567-e89b-12d3-a456-426614174000",
      zzz_project_id: 1,
      zzz_product_category_id: 1,
    };

    const res = await app.request(
      "/v1/ventures",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ventureData),
      },
      TEST_ENV,
    );

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal Server Error");

    // Restore original mock
    createDbSpy.mockRestore();
  });

  it("should update a venture and return 200 OK", async () => {
    // Override mock to return updated venture
    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () =>
              Promise.resolve([
                {
                  id: 42,
                  name: "Updated Venture Name",
                  ownerId: "123e4567-e89b-12d3-a456-426614174000",
                  zzz_max_capacity: 20,
                  zzz_cascade_order: 1,
                  zzz_is_paused: false,
                  zzz_is_active: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  zzz_project_id: 1,
                },
              ]),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const updateData = {
      name: "Updated Venture Name",
      zzz_max_capacity: 20,
    };

    const res = await app.request(
      "/v1/ventures/42",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      },
      TEST_ENV,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("id", 42);
    expect(body.name).toBe("Updated Venture Name");
    expect(body.zzz_max_capacity).toBe(20);

    createDbSpy.mockRestore();
  });

  it("should return 404 when updating non-existent venture", async () => {
    // Override mock to return empty result (venture not found)
    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([]),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const res = await app.request(
      "/v1/ventures/999",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: "Non-existent" }),
      },
      TEST_ENV,
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not Found");

    createDbSpy.mockRestore();
  });

  it("should return 400 when updating with invalid payload", async () => {
    const res = await app.request(
      "/v1/ventures/42",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: "" }), // Invalid: empty string
      },
      TEST_ENV,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
  });

  it("should delete a venture and return 204 No Content", async () => {
    // Override mock to return deleted venture
    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () =>
              Promise.resolve([{ id: 42, name: "Deleted Venture", zzz_is_active: false }]),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const res = await app.request(
      "/v1/ventures/42",
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
      TEST_ENV,
    );

    expect(res.status).toBe(204);
    expect(res.headers.get("content-type")).toBeNull();

    createDbSpy.mockRestore();
  });

  it("should return 404 when deleting non-existent venture", async () => {
    // Override mock to return empty result (venture not found)
    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([]),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const res = await app.request(
      "/v1/ventures/999",
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
      TEST_ENV,
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not Found");

    createDbSpy.mockRestore();
  });

  it("should return 200 and empty array when user has no venture memberships", async () => {
    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue(
      mockDb as unknown as ReturnType<typeof dbFactory.createDb>,
    );

    const res = await app.request(
      "/v1/ventures?userId=123e4567-e89b-12d3-a456-426614174000",
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

  it("should return 200 and ventures when user has memberships", async () => {
    let callCount = 0;

    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      select: () => ({
        from: () => {
          const currentResult =
            callCount === 0
              ? [{ ventureId: 1 }]
              : [
                  {
                    id: 1,
                    name: "Parador Don Esteban",
                    ownerId: "123e4567-e89b-12d3-a456-426614174000",
                    zzz_is_active: true,
                  },
                ];
          callCount++;

          return {
            where: () => ({
              orderBy: () => Promise.resolve(currentResult),
              then: (resolve: (v: unknown) => unknown) => resolve(currentResult),
              catch: (reject: (e: Error) => unknown) =>
                Promise.resolve(currentResult).catch(reject),
            }),
            orderBy: () => Promise.resolve(currentResult),
            then: (resolve: (v: unknown) => unknown) => resolve(currentResult),
            catch: (reject: (e: Error) => unknown) => Promise.resolve(currentResult).catch(reject),
          };
        },
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const res = await app.request(
      "/v1/ventures?userId=123e4567-e89b-12d3-a456-426614174000",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      TEST_ENV,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].name).toBe("Parador Don Esteban");

    createDbSpy.mockRestore();
  });

  it("should return 500 when database fails on membership query", async () => {
    const createDbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      select: () => ({
        from: () => {
          throw new Error("Database crash");
        },
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    const res = await app.request(
      "/v1/ventures?userId=123e4567-e89b-12d3-a456-426614174000",
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
