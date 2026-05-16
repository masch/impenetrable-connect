/** @type {import('knip').KnipConfig} */
module.exports = {
  ignore: [
    // ─────────────────────────────────────────────────────────────
    // TEST FILES: always excluded from dead code analysis
    // ─────────────────────────────────────────────────────────────
    "**/*.test.ts", // Test files - exports are for test consumption
    "**/*.test.tsx", // Test files - exports are for test consumption
    "**/__tests__/**", // Test directories
    "jest.config.cjs", // Jest configuration
    "jest.setup.ts", // Jest setup - imported globally in test environment
    // ─────────────────────────────────────────────────────────────
    // FALSE POSITIVES: dyn/external usage not detected by static analysis
    // ─────────────────────────────────────────────────────────────
    // Used via jest.setup.ts - imported globally in tests via setupFilesAfterEnv
    "src/mocks/expo-router.tsx",
    // Re-exports from @repo/shared - consumers import direct from shared, not via mock
    // Pattern: export * from '@repo/shared/...' - knip sees "unused" but it's re-export
    "src/mocks/catalog.ts",
    "src/mocks/orders.ts",
    "src/mocks/venture-members.ts",
    "src/mocks/agenda.ts",
    // Used by expo-router dynamically in _layout files (file-based routing convention)
    // Pattern: const layout = require('./_layout') - not a static import
    "src/constants/nav.constants.ts",
    // ─────────────────────────────────────────────────────────────
    // FALSE POSITIVES: runtime conditional (env.USE_MOCKS ternary)
    // knip detects static imports but not runtime ternary selection
    // Pattern: export const Service = env.USE_MOCKS ? MockService : RestService;
    // ─────────────────────────────────────────────────────────────
    "src/services/status.service.ts", // MockStatusService used in line 83 ternary
    "src/services/venture.service.ts", // RestVentureService used in line 82 ternary
    // ─────────────────────────────────────────────────────────────
    // FALSE POSITIVES: internal usage in same file (type annotation)
    // knip sees "exported but not imported from other files"
    // but misses: interface/type used as type annotation within same file
    // ─────────────────────────────────────────────────────────────
    "src/services/catalog.service.ts", // CatalogServiceInterface used in lines 66, 212
    "src/logic/order-actions.ts", // OrderActionVariant used as discriminated union
    "src/hooks/useProjectSelectors.ts", // sortProjectsByActiveFirst used in line 53
  ],
};
