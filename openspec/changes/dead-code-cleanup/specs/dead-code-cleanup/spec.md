# Dead Code Cleanup Specification

## Purpose

Eliminar código muerto en apps/mobile/ que no es importado ni usado por ninguna otra parte del proyecto.

## REMOVED Requirements

### Requirement: Eliminar componentes sin usar

Los siguientes componentes fueron identificados como nunca importados y deben ser eliminados:

- `src/components/CatalogImage.tsx` — componente de imagen de catálogo nunca usado
- `src/components/ConfirmModal.tsx` — modal de confirmación nunca usado
- `src/components/SectionHeader.tsx` — header de sección duplicado (catalog/SectionHeader.tsx es el usado)

#### Scenario: Eliminación de archivos no usados

- GIVEN los archivos CatalogImage.tsx, ConfirmModal.tsx, SectionHeader.tsx existen en el codebase
- WHEN se ejecuta la limpieza de dead code
- THEN los 3 archivos son eliminados del filesystem
- AND ninguna dependencia se rompe (los archivos no estaban importados en ningún lugar)

### Requirement: Eliminar constantes sin usar

Los siguientes archivos de constantes no son importados por ningún otro archivo:

- `src/constants/roles.ts` — constantes de roles nunca importadas

#### Scenario: Eliminación de constants no usadas

- GIVEN el archivo src/constants/roles.ts existe
- WHEN se ejecuta la limpieza de dead code
- THEN el archivo es eliminado
- AND los tests siguen pasando (el archivo no era usado)

### Requirement: Eliminar exports sin usar

Los siguientes exports fueron identificados pero nunca usados:

- `getMomentIcon()` de `src/constants/moments.ts` — función definida pero nunca llamada

#### Scenario: Eliminación de export sin usar

- GIVEN la función getMomentIcon existe en moments.ts
- WHEN se ejecuta la limpieza de dead code
- THEN el export es eliminado del archivo
- AND la funcionalidad restante de moments.ts sigue funcionando
- AND los tests siguen pasando

### Requirement: Eliminar types sin usar

Los siguientes types fueron exportados pero nunca usados externamente:

- `LogLevel` de `src/services/logger.service.ts` — type interno nunca importado

#### Scenario: Eliminación de type sin usar

- GIVEN el type LogLevel existe en logger.service.ts
- WHEN se ejecuta la limpieza de dead code
- THEN el type LogLevel es eliminado
- AND el logger sigue funcionando normalmente
- AND los tests siguen pasando

### Requirement: Configurar knip para falsos positivos

Agregar configuración para que knip ignore archivos de test y no los marque como dead code.

#### Scenario: Configuración de knip

- GIVEN el proyecto usa knip para análisis de código
- WHEN se agrega configuración para ignorar test files
- THEN los archivos de test (*.test.ts, *.test.tsx) no son reportados como dead code
- AND react-doctor muestra reducción significativa de warnings

## ADDED Requirements

None — este cambio solo elimina código existente.

## MODIFIED Requirements

None — este cambio no modifica comportamiento existente.

## Acceptance Criteria

- [ ] 4 archivos eliminados (CatalogImage.tsx, ConfirmModal.tsx, SectionHeader.tsx, roles.ts)
- [ ] 1 export eliminado (getMomentIcon)
- [ ] 1 type eliminado (LogLevel)
- [ ] knip/knip.config actualizado para ignorar test patterns
- [ ] 167 tests siguen pasando después de los cambios
- [ ] react-doctor muestra menos de 73 warnings (idealmente <10)