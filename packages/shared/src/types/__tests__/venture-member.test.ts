import { VentureMemberSchema } from "../venture-member";

describe("VentureMemberSchema", () => {
  it("should validate a valid venture member", () => {
    const validMember = {
      id: 1,
      venture_id: 10,
      user_id: "123e4567-e89b-12d3-a456-426614174000",
      role: "MANAGER",
    };
    expect(VentureMemberSchema.parse(validMember)).toEqual(validMember);
  });

  it("should fail with invalid user_id (not a uuid)", () => {
    const invalidMember = {
      id: 1,
      venture_id: 10,
      user_id: "not-a-uuid",
      role: "MANAGER",
    };
    expect(() => VentureMemberSchema.parse(invalidMember)).toThrow();
  });
});
