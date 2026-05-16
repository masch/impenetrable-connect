/** @type {import('knip').KnipConfig} */
module.exports = {
  // Ignore test files from dead code analysis
  ignore: [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/__tests__/**",
    "jest.config.cjs",
    "jest.setup.ts",
    // False positives - used via jest.setup.ts
    "src/mocks/expo-router.tsx",
    // False positives - re-exports from @repo/shared (consumers import direct)
    "src/mocks/catalog.ts",
    "src/mocks/orders.ts",
    "src/mocks/venture-members.ts",
    "src/mocks/agenda.ts",
    // False positives - used by expo-router dynamically in _layout files
    "src/constants/nav.constants.ts",
  ],
};
