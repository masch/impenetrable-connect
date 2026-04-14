/**
 * Home Page Auth Tests - Store Logic Only
 *
 * Test scenarios:
 * 1. Auth store initial state
 * 2. Auth store login for tourist
 * 3. Auth store login for entrepreneur
 * 4. Auth store login for admin
 * 5. Auth store logout
 * 6. Auth store state updates
 */

import { useAuthStore } from "../stores/auth.store";

// Reset auth store before each test
beforeEach(() => {
  useAuthStore.getState().logout();
});

describe("Home Page Auth Store Tests", () => {
  it("1. Auth store initial state is correct", () => {
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.currentUser).toBeNull();
    expect(state.userRole).toBe("TOURIST");
    expect(state.isLoading).toBe(false);
  });

  it("2. Auth store login for tourist works correctly", () => {
    const { login, setUserRole } = useAuthStore.getState();

    login({
      alias: "Familia Gómez",
      user_type: "TOURIST",
      email: null,
      first_name: null,
      last_name: null,
      whatsapp: null,
    });
    setUserRole("TOURIST");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser).not.toBeNull();
    expect(state.currentUser?.alias).toBe("Familia Gómez");
    expect(state.currentUser?.user_type).toBe("TOURIST");
    expect(state.userRole).toBe("TOURIST");
  });

  it("3. Auth store login for entrepreneur works correctly", () => {
    const { login, setUserRole } = useAuthStore.getState();

    login({
      alias: null,
      user_type: "ENTREPRENEUR",
      email: "maria@forst-stew.com",
      first_name: null,
      last_name: null,
      whatsapp: null,
    });
    setUserRole("ENTREPRENEUR");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser).not.toBeNull();
    expect(state.currentUser?.email).toBe("maria@forst-stew.com");
    expect(state.currentUser?.user_type).toBe("ENTREPRENEUR");
    expect(state.userRole).toBe("ENTREPRENEUR");
  });

  it("4. Auth store login for admin works correctly", () => {
    const { login, setUserRole } = useAuthStore.getState();

    login({
      alias: null,
      user_type: "ADMIN",
      email: "admin@impenetrable.com",
      first_name: null,
      last_name: null,
      whatsapp: null,
    });
    setUserRole("ADMIN");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser).not.toBeNull();
    expect(state.currentUser?.email).toBe("admin@impenetrable.com");
    expect(state.currentUser?.user_type).toBe("ADMIN");
    expect(state.userRole).toBe("ADMIN");
  });

  it("5. Auth store logout works correctly", () => {
    const { login, setUserRole, logout } = useAuthStore.getState();

    // Login first
    login({
      alias: "Test User",
      user_type: "TOURIST",
      email: null,
      first_name: null,
      last_name: null,
      whatsapp: null,
    });
    setUserRole("TOURIST");

    // Verify logged in
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Logout
    logout();

    // Verify logged out
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.currentUser).toBeNull();
    expect(state.userRole).toBe("TOURIST");
  });

  it("6. Auth store state updates correctly", () => {
    const { setLoading } = useAuthStore.getState();

    // Initially not loading
    expect(useAuthStore.getState().isLoading).toBe(false);

    // Set loading
    setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    // Set loading back to false
    setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
