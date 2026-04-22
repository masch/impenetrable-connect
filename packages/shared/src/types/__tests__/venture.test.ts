import { describe, it, expect } from "bun:test";
import { VentureSchema } from "../venture";

describe("VentureSchema", () => {
  const now = new Date();
  it("should validate a venture with members", () => {
    const ventureWithMembers = {
      id: 1,
      name: "Parador A",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
      zzz_max_capacity: 20,
      zzz_is_paused: false,
      zzz_is_active: true,
      createdAt: now,
      updatedAt: now,
      zzz_members: [
        {
          id: 1,
          ventureId: 1,
          userId: "550e8400-e29b-41d4-a716-446655440000",
          role: "MANAGER",
        },
      ],
    };
    const result = VentureSchema.parse(ventureWithMembers);
    expect(result.zzz_members).toHaveLength(1);
    expect(result.zzz_members?.[0].role).toBe("MANAGER");
  });

  it("should validate a venture with empty members array", () => {
    const ventureWithEmptyMembers = {
      id: 1,
      name: "Parador A",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
      zzz_max_capacity: 20,
      zzz_is_paused: false,
      zzz_is_active: true,
      createdAt: now,
      updatedAt: now,
      zzz_members: [],
    };
    const result = VentureSchema.parse(ventureWithEmptyMembers);
    expect(result.zzz_members).toHaveLength(0);
  });
});
