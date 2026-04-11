# Proposal: Tourist Orders Screen

## Intent

Implementar la pantalla "Mis Pedidos" para que turistas见的 y gestionen sus pedidos activos (BUSCANDO, CONFIRMADOS) y historial (COMPLETADOS, CANCELADOS, NO ASISTIÓ) desde la app móvil.

## Scope

### In Scope

- Pantalla con TopAppBar ("Mis Pedidos" + logo Impenetrable Connect)
- Segmented Control con tabs "Activos" / "Historial"
- Sección Activos: pedidos con status BUSCANDO, CONFIRMADO
- Sección Historial: pedidos con status COMPLETADO, CANCELADO, NO ASISTIÓ
- Order cards con: nombre del servicio, fecha/hora, pasajeros, badges de status
- Botón cancelar para pedidos SEARCHING
- Mostrar código de reservación para CONFIRMADOS
- Map Visual Anchor (stylized map al final)

### Out of Scope

- Pantalla de detalle de pedido (deep detail)
- Reordenación de pedidos
- Notificaciones push (manejadas en otro módulo)

## Capabilities

### New Capabilities

- `tourist-orders-management`: Ver y gestionar pedidos activos e historial completo

### Modified Capabilities

- Ninguno — nuevo módulo

## Approach

### Architecture

1. **`order.service.ts`** (nuevo en `apps/mobile/src/services/`)
   - Métodos: `getOrders(status?)`, `cancelOrder(id)`, `getOrderById(id)`
   - Mock mode + REST pattern (igual que auth.service.ts)
   - API endpoints: GET `/orders`, DELETE `/orders/:id`

2. **`orders.store.ts`** (nuevo en `apps/mobile/src/stores/`)
   - Zustand store con estado: orders[], loading, error
   - Actions: `fetchOrders(status?)`, `cancelOrder(id)`
   - Estado derivado: `activeOrders`, `historyOrders` (filtrados por status)

3. **`SegmentedControl.tsx`** (nuevo en `apps/mobile/src/components/`)
   - Componente reutilizable para tabs activos/historial
   - Estados: selectedIndex, onChange

4. **`order.tsx`** (actualizar existente)
   - Integrar TabView con SegmentedControl
   - Renderizar OrderCard para cada pedido
   - Mostrar mapa al final (visual anchor)

### Status Mapping

| Backend Status | Frontend Label |
| -------------- | -------------- |
| SEARCHING      | BUSCANDO       |
| CONFIRMED      | CONFIRMADO     |
| COMPLETED      | COMPLETADO     |
| CANCELLED      | CANCELADO      |
| NO_SHOW        | NO ASISTIÓ     |

## Affected Areas

| Area                                              | Impact   | Description              |
| ------------------------------------------------- | -------- | ------------------------ |
| `apps/mobile/src/services/order.service.ts`       | New      | API communication layer  |
| `apps/mobile/src/stores/orders.store.ts`          | New      | Zustand state management |
| `apps/mobile/src/components/SegmentedControl.tsx` | New      | Tab selection component  |
| `apps/mobile/src/app/tourist/order.tsx`           | Modified | Main orders screen       |
| `packages/shared/src/types/order.ts`              | Existing | Order type definition    |

## Risks

| Risk                          | Likelihood | Mitigation                                        |
| ----------------------------- | ---------- | ------------------------------------------------- |
| Backend API no lista          | Medium     | Usar mock mode hasta que endpoint esté disponible |
| Performance con muchas orders | Low        | Usar FlashList si >50 items                       |

## Rollback Plan

1. Revertir cambios en `order.tsx` al stub original
2. Eliminar `order.service.ts`, `orders.store.ts`, `SegmentedControl.tsx`
3. Mantener route existente en tab navigation

## Dependencies

- Backend: GET `/orders` endpoint con filtro por status
- Auth: Tourist token from useAuthStore
- UI: Existing components (Screen, badges, cards)

## Success Criteria

- [ ] Pantalla muestra pedidos activos (BUSCANDO, CONFIRMADO)
- [ ] Pantalla muestra historial (COMPLETADO, CANCELADO, NO ASISTIÓ)
- [ ] SegmentedControl alterna entre tabs
- [ ] Botón cancelar visible solo en SEARCHING
- [ ] Código de reservación visible en CONFIRMADO
- [ ] Responsive en dispositivos low-end
