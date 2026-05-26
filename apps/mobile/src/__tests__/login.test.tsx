import { render, screen, fireEvent, waitFor, act } from "./utils/test-utils";
import LoginScreen from "../app/tourist/login";
import { useAuthStore } from "../stores/auth.store";
import { router } from "expo-router";

jest.mock("../stores/auth.store");

const ALIAS_PLACEHOLDER_KEY = "login.alias_placeholder";

const mockRegister = jest.fn();

const setupAuthMock = () => {
  const mockedStore = jest.mocked(useAuthStore);
  // The component reads register via useAuthStore.getState().register (not through a selector)
  mockedStore.getState = jest.fn().mockReturnValue({ register: mockRegister });
  // Selector mock for any useAuthStore(selector) call in child components
  mockedStore.mockImplementation((selector: unknown) => {
    const state = { register: mockRegister, isAuthenticated: false, currentUser: null };
    return typeof selector === "function" ? selector(state) : state;
  });
};

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMock();
  });

  it("renders the alias input and submit button", () => {
    render(<LoginScreen />);
    expect(screen.getByPlaceholderText(ALIAS_PLACEHOLDER_KEY)).toBeTruthy();
    expect(screen.getByTestId("login-submit")).toBeTruthy();
  });

  it("shows validation error when submitting with empty alias", async () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByTestId("login-submit"));
    await waitFor(() => {
      expect(screen.getByText("login.alias_required")).toBeTruthy();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("calls register with correct payload and redirects on success", async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText(ALIAS_PLACEHOLDER_KEY), "Familia Gómez");
    fireEvent.press(screen.getByTestId("login-submit"));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({ alias: "Familia Gómez" }),
      );
      expect(router.replace).toHaveBeenCalledWith("/tourist");
    });
  });

  it("shows submission error when register rejects", async () => {
    mockRegister.mockRejectedValueOnce(new Error("Network error"));
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText(ALIAS_PLACEHOLDER_KEY), "Familia Gómez");
    fireEvent.press(screen.getByTestId("login-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("registration-error")).toBeTruthy();
    });
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("does not call register a second time while a submission is in flight", async () => {
    let resolveRegister!: () => void;
    mockRegister.mockReturnValueOnce(new Promise<void>((res) => (resolveRegister = res)));

    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText(ALIAS_PLACEHOLDER_KEY), "Familia Gómez");

    fireEvent.press(screen.getByTestId("login-submit"));
    fireEvent.press(screen.getByTestId("login-submit")); // should be no-op while pending

    await act(async () => resolveRegister());

    expect(mockRegister).toHaveBeenCalledTimes(1);
  });
});
