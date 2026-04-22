import { describe, it, expect } from "bun:test";
import { VentureMemberSchema } from "../venture-member";

describe("VentureMemberSchema", () => {
  it("should validate a valid venture member", () => {
    const validMember = {
      id: 1,
      ventureId: 10,
      userId: "123e4567-e89b-12d3-a456-426614174000",
      role: "MANAGER",
    };
    expect(VentureMemberSchema.parse(validMember)).toEqual(validMember);
  });

  it("should fail with invalid userId (not a uuid)", () => {
    const invalidMember = {
      id: 1,
      ventureId: 10,
      userId: "not-a-uuid",
      role: "MANAGER",
    };
    expect(() => VentureMemberSchema.parse(invalidMember)).toThrow();
  });
});
