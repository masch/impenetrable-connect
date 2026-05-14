/** @type {import('knip').KnipConfig} */
module.exports = {
  // Ignore test files from dead code analysis
  ignore: [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/__tests__/**",
    "jest.config.cjs",
    "jest.setup.ts",
  ],
};