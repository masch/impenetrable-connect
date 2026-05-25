import { describe, expect, it, beforeAll, beforeEach, afterAll, spyOn } from "bun:test";
import app from "../app";
import { sign } from "hono/jwt";
import * as dbFactory from "../db/index";
import { resetDbCache } from "../middleware/db";

const MOCK_PROJECT = {
  zzz_id: 1,
  zzz_name: "Test Project AI",
  zzz_default_language: "en",
  zzz_supported_languages: ["en", "es"],
  zzz_cascade_timeout_minutes: 45,
  zzz_max_cascade_attempts: 5,
  zzz_is_active: true,
  zzz_timezone: "America/Argentina/Buenos_Aires",
  zzz_created_at: new Date(),
  zzz_updated_at: new Date(),
};

describe("Projects API", () => {
  const TEST_ENV = {
    DATABASE_URL: "postgres://localhost:5432/db",
    JWT_SECRET: "test-secret",
  };

  let token: string;
  let dbSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    resetDbCache();
  });

  beforeAll(async () => {
    // Shared from() result that supports both where/limit chains and orderBy
    const fromResult = {
      where: () => ({
        limit: () => Promise.resolve([MOCK_PROJECT]),
      }),
      orderBy: () => Promise.resolve([]),
    };

    // Mock the DB factory to return a fake drizzle client
    dbSpy = spyOn(dbFactory, "createDb").mockReturnValue({
      select: () => ({
        from: () => fromResult,
      }),
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([MOCK_PROJECT]),
        }),
      }),
    } as unknown as ReturnType<typeof dbFactory.createDb>);

    token = await sign(
      { sub: "1", role: "admin", exp: Math.floor(Date.now() / 1000) + 3600 },
      TEST_ENV.JWT_SECRET,
    );
  });

  afterAll(() => {
    dbSpy.mockRestore();
  });

  it("should return 200 OK and an array of projects", async () => {
    const res = await app.request(
      "/v1/projects",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      TEST_ENV,
    );

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);

    if (body.length > 0) {
      expect(body[0]).toHaveProperty("zzz_id");
      expect(body[0]).toHaveProperty("zzz_name");
      expect(body[0]).toHaveProperty("zzz_default_language");
    }
  });

  it("should create a new project and return 201 Created", async () => {
    const newProjectData = {
      zzz_name: "Test Project AI",
      zzz_default_language: "en",
      zzz_supported_languages: ["en", "es"],
      zzz_cascade_timeout_minutes: 45,
      zzz_max_cascade_attempts: 5,
      zzz_is_active: true,
      zzz_timezone: "America/Argentina/Buenos_Aires",
    };

    const res = await app.request(
      "/v1/projects",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProjectData),
      },
      TEST_ENV,
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("zzz_id");
    expect(body.zzz_name).toBe(newProjectData.zzz_name);
  });

  it("should return 400 Bad Request when validation fails", async () => {
    const invalidData = {
      zzz_name: "A", // Too short (min 2)
      zzz_default_language: "it", // Not supported in LanguageSchema
    };

    const res = await app.request(
      "/v1/projects",
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

  it("should return 400 when default_language is not in supported_languages", async () => {
    const inconsistentData = {
      zzz_name: "Inconsistent Project",
      zzz_default_language: "en",
      zzz_supported_languages: ["es"], // Missing 'en'
      zzz_timezone: "America/Argentina/Buenos_Aires",
    };

    const res = await app.request(
      "/v1/projects",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inconsistentData),
      },
      TEST_ENV,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
  });

  it("should return a project by ID", async () => {
    const res = await app.request(
      "/v1/projects/1",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      TEST_ENV,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.zzz_id).toBe(1);
    expect(body.zzz_name).toBe("Test Project AI");
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

    const projectData = {
      zzz_name: "Failing Project",
      zzz_default_language: "en",
      zzz_supported_languages: ["en"],
      zzz_timezone: "America/Argentina/Buenos_Aires",
    };

    const res = await app.request(
      "/v1/projects",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      },
      TEST_ENV,
    );

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal Server Error");

    // Restore original mock
    createDbSpy.mockRestore();
  });
});
