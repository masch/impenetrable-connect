# Tasks: Dead Code Cleanup

## Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Verification & Backup

- [ ] 1.1 Run `npm test` in apps/mobile to confirm baseline (167 tests passing)
- [ ] 1.2 Run `npx react-doctor@latest .` to capture current state (73 issues)

## Phase 2: Eliminar archivos no usados

- [ ] 2.1 Delete `src/components/CatalogImage.tsx`
- [ ] 2.2 Delete `src/components/ConfirmModal.tsx`
- [ ] 2.3 Delete `src/components/SectionHeader.tsx`
- [ ] 2.4 Delete `src/constants/roles.ts`

## Phase 3: Eliminar exports y types sin usar

- [ ] 3.1 Edit `src/constants/moments.ts` — remove `getMomentIcon` export
- [ ] 3.2 Edit `src/services/logger.service.ts` — remove `LogLevel` type export

## Phase 4: Configurar knip

- [ ] 4.1 Create or update `knip.config.js` in apps/mobile to ignore test patterns:
  - Ignore `**/*.test.ts`
  - Ignore `**/*.test.tsx`
  - Ignore `**/__tests__/**`
  - Ignore `jest.config.cjs`
  - Ignore `jest.setup.ts`

## Phase 5: Verificación

- [ ] 5.1 Run `npm test` — verify all 167 tests still pass
- [ ] 5.2 Run `npx react-doctor@latest .` — verify dead code warnings reduced
- [ ] 5.3 Run `git status` to review changes

## Phase 6: Commit

- [ ] 6.1 Stage all changes: `git add -A`
- [ ] 6.2 Commit: `git commit -m "chore(mobile): remove dead code (6 items)"`