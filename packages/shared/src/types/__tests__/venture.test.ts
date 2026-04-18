import { VentureSchema } from "../venture";

describe("VentureSchema", () => {
  it("should validate a venture with members", () => {
    const ventureWithMembers = {
      id: 1,
      catalog_type_id: 10,
      name: "Parador A",
      address: "Calle 123",
      latitude: -24.5,
      longitude: -60.2,
      role_type_id: 1,
      max_capacity: 20,
      is_paused: false,
      is_active: true,
      members: [
        { id: 1, venture_id: 1, user_id: "550e8400-e29b-41d4-a716-446655440000", role: "MANAGER" },
      ],
    };
    const result = VentureSchema.parse(ventureWithMembers);
    expect(result.members).toHaveLength(1);
    expect(result.members?.[0].role).toBe("MANAGER");
  });

  it("should validate a venture with empty members array", () => {
    const ventureWithEmptyMembers = {
      id: 1,
      catalog_type_id: 10,
      name: "Parador A",
      address: "Calle 123",
      latitude: -24.5,
      longitude: -60.2,
      role_type_id: 1,
      max_capacity: 20,
      is_paused: false,
      is_active: true,
      members: [],
    };
    const result = VentureSchema.parse(ventureWithEmptyMembers);
    expect(result.members).toHaveLength(0);
  });
});
