import { useVentureStore } from "../venture.store";

// Mock the venture service
jest.mock("../../services/venture.service", () => ({
  VentureService: {
    getVentures: jest.fn(),
    getVentureById: jest.fn(),
    createVenture: jest.fn(),
    updateVenture: jest.fn(),
    deleteVenture: jest.fn(),
    getVenturesByUserId: jest.fn(),
  },
  MockVentureService: {
    getVentures: jest.fn(),
    getVentureById: jest.fn(),
    createVenture: jest.fn(),
    updateVenture: jest.fn(),
    deleteVenture: jest.fn(),
    getVenturesByUserId: jest.fn(),
  },
}));

import { VentureService } from "../../services/venture.service";

describe("VentureStore", () => {
  beforeEach(() => {
    // Reset store state
    useVentureStore.setState({
      ventures: [],
      userVentures: [],
      selectedVenture: null,
      isLoading: false,
      isSaving: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with empty state", () => {
      const state = useVentureStore.getState();
      expect(state.ventures).toEqual([]);
      expect(state.userVentures).toEqual([]);
      expect(state.selectedVenture).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("fetchVentures", () => {
    it("should fetch and set ventures", async () => {
      const mockVentures = [
        {
          id: 1,
          name: "Venture 1",
          ownerId: "owner1",
          zzz_project_id: 1,
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Venture 2",
          ownerId: "owner2",
          zzz_project_id: 1,
          zzz_max_capacity: 30,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (VentureService.getVentures as jest.Mock).mockResolvedValue(mockVentures);

      await useVentureStore.getState().fetchVentures();

      const state = useVentureStore.getState();
      expect(state.ventures).toEqual(mockVentures);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should set error on network failure", async () => {
      (VentureService.getVentures as jest.Mock).mockRejectedValue(new Error("Network error"));

      await useVentureStore.getState().fetchVentures();

      const state = useVentureStore.getState();
      expect(state.error).toBeTruthy();
      expect(state.isLoading).toBe(false);
    });

    it("should set isLoading during fetch", async () => {
      let resolvePromise: (value: unknown) => void;
      const delayPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (VentureService.getVentures as jest.Mock).mockImplementation(() => delayPromise);

      const fetchPromise = useVentureStore.getState().fetchVentures();

      // Check loading state during fetch
      expect(useVentureStore.getState().isLoading).toBe(true);

      resolvePromise!([]);
      await fetchPromise;

      expect(useVentureStore.getState().isLoading).toBe(false);
    });
  });

  describe("fetchVenturesByUserId", () => {
    it("should fetch and set user ventures by user id", async () => {
      const mockUserVentures = [
        {
          id: 1,
          name: "Venture for User",
          ownerId: "user1",
          zzz_project_id: 1,
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (VentureService.getVenturesByUserId as jest.Mock).mockResolvedValue(mockUserVentures);

      await useVentureStore.getState().fetchVenturesByUserId("user1");

      const state = useVentureStore.getState();
      expect(state.userVentures).toEqual(mockUserVentures);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should set error on network failure", async () => {
      (VentureService.getVenturesByUserId as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );

      await useVentureStore.getState().fetchVenturesByUserId("user1");

      const state = useVentureStore.getState();
      expect(state.error).toBeTruthy();
      expect(state.isLoading).toBe(false);
    });

    it("should set isLoading during fetch", async () => {
      let resolvePromise: (value: unknown) => void;
      const delayPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (VentureService.getVenturesByUserId as jest.Mock).mockImplementation(() => delayPromise);

      const fetchPromise = useVentureStore.getState().fetchVenturesByUserId("user1");

      expect(useVentureStore.getState().isLoading).toBe(true);

      resolvePromise!([]);
      await fetchPromise;

      expect(useVentureStore.getState().isLoading).toBe(false);
    });
  });

  describe("selectVenture", () => {
    it("should set selectedVenture when found", async () => {
      const mockVenture = {
        id: 1,
        name: "Test Venture",
        ownerId: "owner1",
        zzz_project_id: 1,
        zzz_max_capacity: 20,
        zzz_cascade_order: 0,
        zzz_is_paused: false,
        zzz_is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (VentureService.getVentureById as jest.Mock).mockResolvedValue(mockVenture);

      await useVentureStore.getState().selectVenture(1);

      const state = useVentureStore.getState();
      expect(state.selectedVenture).toEqual(mockVenture);
      expect(state.isLoading).toBe(false);
    });

    it("should set selectedVenture to null when not found", async () => {
      (VentureService.getVentureById as jest.Mock).mockResolvedValue(null);

      await useVentureStore.getState().selectVenture(9999);

      const state = useVentureStore.getState();
      expect(state.selectedVenture).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe("setSelectedVenture", () => {
    it("should set selectedVenture directly without API call", async () => {
      const mockVenture = {
        id: 1,
        name: "Direct Venture",
        ownerId: "owner1",
        zzz_project_id: 1,
        zzz_max_capacity: 20,
        zzz_cascade_order: 0,
        zzz_is_paused: false,
        zzz_is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      useVentureStore.getState().setSelectedVenture(mockVenture);

      const state = useVentureStore.getState();
      expect(state.selectedVenture).toEqual(mockVenture);
      // No API call should have been made
      expect(VentureService.getVentureById).not.toHaveBeenCalled();
    });

    it("should set selectedVenture to null when called with null", () => {
      useVentureStore.setState({
        selectedVenture: {
          id: 1,
          name: "Test",
          ownerId: "o",
          zzz_project_id: 1,
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      useVentureStore.getState().setSelectedVenture(null);

      expect(useVentureStore.getState().selectedVenture).toBeNull();
    });
  });

  describe("createVenture", () => {
    it("should add new venture to list", async () => {
      const newVenture = {
        name: "New Venture",
        ownerId: "owner1",
        zzz_project_id: 1,
        zzz_max_capacity: 25,
        zzz_cascade_order: 0,
        zzz_is_paused: false,
        zzz_is_active: true,
      };

      const createdVenture = {
        ...newVenture,
        id: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (VentureService.createVenture as jest.Mock).mockResolvedValue(createdVenture);

      const result = await useVentureStore.getState().createVenture(newVenture);

      const state = useVentureStore.getState();
      expect(state.ventures).toContainEqual(createdVenture);
      expect(state.isSaving).toBe(false);
      expect(result).toEqual(createdVenture);
    });

    it("should return null and set error on failure", async () => {
      (VentureService.createVenture as jest.Mock).mockRejectedValue(new Error("Create failed"));

      const result = await useVentureStore.getState().createVenture({
        name: "Fail",
        ownerId: "owner1",
        zzz_project_id: 1,
        zzz_max_capacity: 20,
        zzz_cascade_order: 0,
        zzz_is_paused: false,
        zzz_is_active: true,
      });

      const state = useVentureStore.getState();
      expect(result).toBeNull();
      expect(state.error).toBe("Failed to create venture");
      expect(state.isSaving).toBe(false);
    });

    it("should set isSaving during creation", async () => {
      let resolvePromise: (value: unknown) => void;
      const delayPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (VentureService.createVenture as jest.Mock).mockImplementation(() => delayPromise);

      const createPromise = useVentureStore.getState().createVenture({
        name: "Delayed",
        ownerId: "owner1",
        zzz_project_id: 1,
        zzz_max_capacity: 20,
        zzz_cascade_order: 0,
        zzz_is_paused: false,
        zzz_is_active: true,
      });

      expect(useVentureStore.getState().isSaving).toBe(true);

      resolvePromise!({ id: 99, name: "Delayed" });
      await createPromise;

      expect(useVentureStore.getState().isSaving).toBe(false);
    });
  });

  describe("updateVenture", () => {
    it("should update venture in list and selectedVenture", async () => {
      const initialState = {
        ventures: [
          {
            id: 1,
            name: "Original",
            ownerId: "owner1",
            zzz_project_id: 1,
            zzz_max_capacity: 20,
            zzz_cascade_order: 0,
            zzz_is_paused: false,
            zzz_is_active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        selectedVenture: {
          id: 1,
          name: "Original",
          ownerId: "owner1",
          zzz_project_id: 1,
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isSaving: false,
        error: null,
      };

      useVentureStore.setState(initialState);

      const updatedVenture = {
        id: 1,
        name: "Updated",
        ownerId: "owner1",
        zzz_project_id: 1,
        zzz_max_capacity: 30,
        zzz_cascade_order: 0,
        zzz_is_paused: false,
        zzz_is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (VentureService.updateVenture as jest.Mock).mockResolvedValue(updatedVenture);

      const result = await useVentureStore
        .getState()
        .updateVenture(1, { name: "Updated", zzz_max_capacity: 30 });

      const state = useVentureStore.getState();
      expect(state.ventures[0].name).toBe("Updated");
      expect(state.selectedVenture?.name).toBe("Updated");
      expect(result).toEqual(updatedVenture);
    });

    it("should return null on failure", async () => {
      (VentureService.updateVenture as jest.Mock).mockRejectedValue(new Error("Update failed"));

      const result = await useVentureStore.getState().updateVenture(1, { name: "Fail" });

      const state = useVentureStore.getState();
      expect(result).toBeNull();
      expect(state.error).toBe("Failed to update venture");
    });
  });

  describe("deleteVenture", () => {
    it("should remove venture from list and clear selection", async () => {
      const initialState = {
        ventures: [
          {
            id: 1,
            name: "To Delete",
            ownerId: "owner1",
            zzz_project_id: 1,
            zzz_max_capacity: 20,
            zzz_cascade_order: 0,
            zzz_is_paused: false,
            zzz_is_active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            name: "To Keep",
            ownerId: "owner1",
            zzz_project_id: 1,
            zzz_max_capacity: 20,
            zzz_cascade_order: 0,
            zzz_is_paused: false,
            zzz_is_active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        selectedVenture: {
          id: 1,
          name: "To Delete",
          ownerId: "owner1",
          zzz_project_id: 1,
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isSaving: false,
        error: null,
      };

      useVentureStore.setState(initialState);

      (VentureService.deleteVenture as jest.Mock).mockResolvedValue(true);

      const result = await useVentureStore.getState().deleteVenture(1);

      const state = useVentureStore.getState();
      expect(state.ventures).toHaveLength(1);
      expect(state.ventures[0].id).toBe(2);
      expect(state.selectedVenture).toBeNull();
      expect(result).toBe(true);
    });

    it("should return false on failure", async () => {
      (VentureService.deleteVenture as jest.Mock).mockRejectedValue(new Error("Delete failed"));

      const result = await useVentureStore.getState().deleteVenture(999);

      const state = useVentureStore.getState();
      expect(result).toBe(false);
      expect(state.error).toBe("Failed to delete venture");
    });

    it("should not clear selection when delete returns false", async () => {
      const initialState = {
        ventures: [
          {
            id: 1,
            name: "Exists",
            ownerId: "owner1",
            zzz_project_id: 1,
            zzz_max_capacity: 20,
            zzz_cascade_order: 0,
            zzz_is_paused: false,
            zzz_is_active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        selectedVenture: {
          id: 1,
          name: "Exists",
          ownerId: "owner1",
          zzz_project_id: 1,
          zzz_max_capacity: 20,
          zzz_cascade_order: 0,
          zzz_is_paused: false,
          zzz_is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isLoading: false,
        isSaving: false,
        error: null,
      };

      useVentureStore.setState(initialState);

      (VentureService.deleteVenture as jest.Mock).mockResolvedValue(false);

      await useVentureStore.getState().deleteVenture(1);

      const state = useVentureStore.getState();
      expect(state.ventures).toHaveLength(1);
      expect(state.selectedVenture).not.toBeNull();
    });
  });
});
