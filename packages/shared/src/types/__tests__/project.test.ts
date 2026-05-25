import { describe, expect, it } from "bun:test";
import { CreateProjectSchema, ProjectSchema } from "../project";

describe("ProjectSchema Validation", () => {
  const validProjectData = {
    zzz_name: "Test Project",
    zzz_default_language: "es" as const,
    zzz_supported_languages: ["es", "en"] as const,
    zzz_cascade_timeout_minutes: 30,
    zzz_max_cascade_attempts: 10,
    zzz_is_active: true,
    zzz_timezone: "America/Argentina/Buenos_Aires",
  };

  it("should validate a valid project payload", () => {
    const result = CreateProjectSchema.safeParse(validProjectData);
    expect(result.success).toBe(true);
  });

  it("should validate other valid timezones like UTC or New York", () => {
    const utcResult = CreateProjectSchema.safeParse({
      ...validProjectData,
      zzz_timezone: "UTC",
    });
    expect(utcResult.success).toBe(true);

    const nyResult = CreateProjectSchema.safeParse({
      ...validProjectData,
      zzz_timezone: "America/New_York",
    });
    expect(nyResult.success).toBe(true);
  });

  it("should reject when timezone is missing", () => {
    const { zzz_timezone: _, ...missingTimezone } = validProjectData;
    const result = CreateProjectSchema.safeParse(missingTimezone);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("zzz_timezone");
    }
  });

  it("should reject an invalid timezone identifier", () => {
    const result = CreateProjectSchema.safeParse({
      ...validProjectData,
      zzz_timezone: "Invalid/Time_Zone_Identifier",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid IANA timezone identifier");
    }
  });

  it("should reject empty timezone string", () => {
    const result = CreateProjectSchema.safeParse({
      ...validProjectData,
      zzz_timezone: "",
    });
    expect(result.success).toBe(false);
  });
});
