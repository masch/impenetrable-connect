import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react-native";

/**
 * Custom provider wrapper for tests to include global context providers.
 * Currently we don't have many, but this is the place to add them (e.g. NavigationContainer, Theme, etc)
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from RTL
export * from "@testing-library/react-native";

// Override render method
export { customRender as render };
