// Mock expo-router with capability for deep testing
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(),
  setParams: jest.fn(),
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
  goBack: jest.fn(),
};

// Shorthand for simple exports
export const router = mockRouter;
export const useRouter = jest.fn(() => mockRouter);
export const useLocalSearchParams = jest.fn(() => ({}));
export const Link = "Link";

// Reset all mock functions between tests helper
export function resetRouterMocks() {
  Object.values(mockRouter).forEach((mock) => {
    if (typeof mock === "function" && "mockReset" in mock) {
      (mock as jest.Mock).mockReset();
    }
  });
}
