# Proposal: Dead Code Cleanup

## Intent

Eliminar código muerto en apps/mobile/ para mantener el codebase limpio y reducir ruido en herramientas de análisis (react-doctor, knip). Los 73 warnings de "dead code" reported por react-doctor son mayormente falsos positivos (30 archivos de test) pero hay 6 items reales que no se usan.

## Scope

### In Scope
- Eliminar 4 archivos sin usar: CatalogImage.tsx, ConfirmModal.tsx, SectionHeader.tsx, roles.ts
- Eliminar 1 export sin usar: getMomentIcon() de constants/moments.ts
- Eliminar 1 type sin usar: LogLevel de logger.service.ts
- Agregar configuración de knip para ignorar archivos de test (resolver false positives)

### Out of Scope
- No tocar archivos de test (son falsos positivos, no dead code)
- No modificar lógica de negocio
- No hacer refactoring estructural

## Capabilities

### New Capabilities
- None (cleanup only)

### Modified Capabilities
- None

## Approach

**Hybrid: Real cleanup + config fix**
1. Eliminar los 6 items confirmados como realmente sin usar
2. Crear/actualizar knip config para ignorar test patterns y reducir falsos positivos
3. Verificar que los 167 tests sigan pasando después de los cambios

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| src/components/CatalogImage.tsx | Removed | Nunca importado |
| src/components/ConfirmModal.tsx | Removed | Nunca importado |
| src/components/SectionHeader.tsx | Removed | Duplicado de catalog/ |
| src/constants/roles.ts | Removed | Nunca importado |
| src/constants/moments.ts | Modified | Eliminar getMomentIcon export |
| src/services/logger.service.ts | Modified | Eliminar LogLevel type |
| knip.config.js | Modified | Ignorar test patterns |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Eliminar archivo planeado para futuro | Low | Verificar con usuario antes de commit |
| Romper tests accidentalmente | Low | Ejecutar npm test antes de commit |

## Rollback Plan

1. `git checkout -- .` para revertir todos los cambios
2. Verificar con `npm test` que todo pasa

## Dependencies

- Ninguno - es cleanup autocontenido

## Success Criteria
- [ ] 6 items eliminados (4 archivos + 1 export + 1 type)
- [ ] 167 tests siguen pasando
- [ ] react-doctor muestra menos de 73 warnings (idealmente <10)
- [ ] knip config ignora archivos de test