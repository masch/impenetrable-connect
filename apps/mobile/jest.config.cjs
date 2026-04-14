const path = require("path");

module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  moduleNameMapper: {
    "^@repo/shared$": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
  },
  roots: ["<rootDir>/src"],
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: [
    "node_modules/(?!.*((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-reanimated|@testing-library|react-native-css-interop|nativewind|react-native-web|@babel/runtime))",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      require.resolve("babel-jest"),
      {
        caller: {
          supportsStaticESM: false,
          supportsDynamicImport: false,
        },
        configFile: path.resolve(__dirname, "babel.config.js"),
      },
    ],
  },
};
