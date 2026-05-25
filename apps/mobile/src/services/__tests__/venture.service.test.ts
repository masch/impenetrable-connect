import {
  MockVentureService,
  RestVentureService,
  VentureServiceInterface,
} from "../venture.service";
import { MOCK_VENTURES } from "@repo/shared";
import { CreateVentureInput } from "@repo/shared";

// Mock global fetch
globalThis.fetch = jest.fn();

describe("VentureServiceInterface", () => {
  it("should have all CRUD methods defined", () => {
    const interfaceMethods: (keyof VentureServiceInterface)[] = [
      "getVentures",
      "getVentureById",
      "createVenture",
      "updateVenture",
      "deleteVenture",
    ];

    for (const method of interfaceMethods) {
      expect(typeof (MockVentureService as unknown as Record<string, unknown>)[method]).toBe(
        "function",
      );
    }
  });
});

describe("VentureService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("MockVentureService", () => {
    describe("getVentures", () => {
      it("should return all mock ventures", async () => {
        const ventures = await MockVentureService.getVentures();
        expect(ventures).toBeDefined();
        expect(Array.isArray(ventures)).toBe(true);
        expect(ventures.length).toBeGreaterThan(0);
      });

      it("should return venture with expected structure", async () => {
        const ventures = await MockVentureService.getVentures();
        const venture = ventures[0];
        expect(venture).toHaveProperty("id");
        expect(venture).toHaveProperty("name");
        expect(venture).toHaveProperty("ownerId");
      });
    });

    describe("getVentureById", () => {
      it("should return venture when found", async () => {
        const venture = await MockVentureService.getVentureById(1);
        expect(venture).toBeDefined();
        expect(venture?.id).toBe(1);
        expect(venture?.name).toBe("Parador Don Esteban");
      });

      it("should return null when venture not found", async () => {
        const venture = await MockVentureService.getVentureById(9999);
        expect(venture).toBeNull();
      });
    });

    describe("createVenture", () => {
      it("should create and return new venture", async () => {
        const newVenture: CreateVentureInput = {
          name: "New Test Venture",
          ownerId: "entrepreneur_001",
          zzz_max_capacity: 30,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          zzz_project_id: 1,
          zzz_product_category_id: 1,
        };

        const created = await MockVentureService.createVenture(newVenture);
        expect(created).toBeDefined();
        expect(created.name).toBe("New Test Venture");
        expect(created.id).toBeDefined();
      });

      it("should include venture in getVentures after creation", async () => {
        const newVenture: CreateVentureInput = {
          name: "Added via createVenture",
          ownerId: "entrepreneur_001",
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          zzz_project_id: 1,
          zzz_product_category_id: 1,
        };

        await MockVentureService.createVenture(newVenture);
        const ventures = await MockVentureService.getVentures();
        const found = ventures.find((v) => v.name === "Added via createVenture");
        expect(found).toBeDefined();
      });
    });

    describe("deleteVenture", () => {
      it("should remove venture from list", async () => {
        // First create a venture to delete
        const newVenture: CreateVentureInput = {
          name: "To Be Deleted",
          ownerId: "entrepreneur_001",
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          zzz_project_id: 1,
          zzz_product_category_id: 1,
        };

        const created = await MockVentureService.createVenture(newVenture);
        const venturesBefore = await MockVentureService.getVentures();
        const beforeCount = venturesBefore.length;

        const result = await MockVentureService.deleteVenture(created.id);
        expect(result).toBe(true);

        const venturesAfter = await MockVentureService.getVentures();
        expect(venturesAfter.length).toBe(beforeCount - 1);
      });

      it("should return true when venture deleted", async () => {
        const newVenture: CreateVentureInput = {
          name: "Delete Success Test",
          ownerId: "entrepreneur_001",
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          zzz_project_id: 1,
          zzz_product_category_id: 1,
        };

        const created = await MockVentureService.createVenture(newVenture);
        const result = await MockVentureService.deleteVenture(created.id);
        expect(result).toBe(true);
      });
    });

    it("should find a venture by userId (Maria -> Parador Don Esteban)", async () => {
      const mariaId = "entrepreneur_001";
      const venture = await MockVentureService.getVentureByUserId(mariaId);
      expect(venture).toBeDefined();
      expect(venture?.name).toBe("Parador Don Esteban");
    });

    it("should find a venture by userId for a collaborator (Pedro -> Parador Don Esteban)", async () => {
      const pedroId = "entrepreneur_005";
      const venture = await MockVentureService.getVentureByUserId(pedroId);
      expect(venture).toBeDefined();
      expect(venture?.name).toBe("Parador Don Esteban");
      expect(venture?.id).toBe(1);
    });

    it("should update venture capacity", async () => {
      const ventureId = 1;
      const newCapacity = 42;
      const updated = await MockVentureService.updateVenture(ventureId, {
        zzz_max_capacity: newCapacity,
      });

      expect(updated.zzz_max_capacity).toBe(newCapacity);

      // Verify persistence in mock state
      const mariaId = "entrepreneur_001";
      const venture = await MockVentureService.getVentureByUserId(mariaId);
      expect(venture?.zzz_max_capacity).toBe(newCapacity);
    });

    it("should return null if user has no venture", async () => {
      const unknownUserId = "unknown_user";
      const venture = await MockVentureService.getVentureByUserId(unknownUserId);
      expect(venture).toBeNull();
    });
  });

  describe("RestVentureService", () => {
    describe("getVentures", () => {
      it("should fetch all ventures via GET /ventures", async () => {
        (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_VENTURES,
        });

        const ventures = await RestVentureService.getVentures();
        expect(globalThis.fetch).toHaveBeenCalled();
        expect(ventures).toEqual(MOCK_VENTURES);
      });
    });

    describe("getVentureById", () => {
      it("should fetch venture by ID via GET /ventures/:id", async () => {
        (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_VENTURES[0],
        });

        const venture = await RestVentureService.getVentureById(1);
        expect(globalThis.fetch).toHaveBeenCalled();
        expect(venture?.id).toBe(1);
      });

      it("should return null when venture not found", async () => {
        (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

        const venture = await RestVentureService.getVentureById(9999);
        expect(venture).toBeNull();
      });
    });

    describe("createVenture", () => {
      it("should create venture via POST /ventures", async () => {
        const newVenture = { ...MOCK_VENTURES[0], id: 99, name: "Created" };
        (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => newVenture,
        });

        const created = await RestVentureService.createVenture({
          name: "Created",
          ownerId: "entrepreneur_001",
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          zzz_project_id: 1,
          zzz_product_category_id: 1,
        });

        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/ventures"),
          expect.objectContaining({ method: "POST" }),
        );
        expect(created.name).toBe("Created");
      });
    });

    describe("deleteVenture", () => {
      it("should delete venture via DELETE /ventures/:id", async () => {
        (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
        });

        const result = await RestVentureService.deleteVenture(1);
        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/ventures/1"),
          expect.objectContaining({ method: "DELETE" }),
        );
        expect(result).toBe(true);
      });
    });

    it("should fetch venture by userId via API", async () => {
      const mockVenture = MOCK_VENTURES[0];
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenture,
      });

      const venture = await RestVentureService.getVentureByUserId("user123");
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/ventures?userId=user123"),
      );
      expect(venture?.id).toBe(mockVenture.id);
    });

    it("should update venture via API using PUT method", async () => {
      const mockVenture = { ...MOCK_VENTURES[0], zzz_max_capacity: 50 };
      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenture,
      });

      const updated = await RestVentureService.updateVenture(1, { zzz_max_capacity: 50 });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/ventures/1"),
        expect.objectContaining({ method: "PUT" }),
      );
      expect(updated.zzz_max_capacity).toBe(50);
    });
  });
});
