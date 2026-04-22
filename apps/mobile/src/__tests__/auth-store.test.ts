/**
 * Home Page Auth Tests - Store Logic Only
 */

import { useAuthStore } from "../stores/auth.store";

// Reset auth store before each test
beforeEach(async () => {
  await useAuthStore.getState().logout();
});

describe("Home Page Auth Store Tests", () => {
  it("1. Auth store initial state is correct", () => {
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.currentUser).toBeNull();
    expect(state.userRole).toBe("TOURIST");
    expect(state.isLoading).toBe(false);
  });

  it("2. Auth store login for tourist works correctly", async () => {
    const { login, setUserRole } = useAuthStore.getState();

    await login({ alias: "Familia Gómez" });
    setUserRole("TOURIST");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser).not.toBeNull();
    expect(state.currentUser?.alias).toBe("Familia Gómez");
    expect(state.currentUser?.role).toBe("TOURIST");
    expect(state.userRole).toBe("TOURIST");
  });

  it("3. Auth store login for entrepreneur works correctly", async () => {
    const { login, setUserRole } = useAuthStore.getState();

    await login({ email: "maria@forst-stew.com", password: "password123" });
    setUserRole("ENTREPRENEUR");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser).not.toBeNull();
    expect(state.currentUser?.email).toBe("maria@forst-stew.com");
    expect(state.currentUser?.role).toBe("ENTREPRENEUR");
    expect(state.userRole).toBe("ENTREPRENEUR");
  });

  it("4. Auth store login for admin works correctly", async () => {
    const { login, setUserRole } = useAuthStore.getState();

    await login({ email: "admin@impenetrable.com", password: "password123" });
    setUserRole("ADMIN");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser).not.toBeNull();
    expect(state.currentUser?.email).toBe("admin@impenetrable.com");
    expect(state.currentUser?.role).toBe("ADMIN");
    expect(state.userRole).toBe("ADMIN");
  });

  it("5. Auth store logout works correctly", async () => {
    const { login, setUserRole, logout } = useAuthStore.getState();

    // Login first
    await login({ alias: "Familia Gómez" });
    setUserRole("TOURIST");

    // Verify logged in
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Logout
    await logout();

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
