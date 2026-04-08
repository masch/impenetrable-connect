# Tasks: tourist-catalog-screen

## Phase 1: Foundation

### 1.1 Create mock data

- **File**: `apps/mobile/src/mocks/catalog.ts`
- **Pattern**: Follow `mocks/projects.ts` structure using `CatalogItem` from `@repo/shared`
- **Data**: 6-8 mock services (guided tours, excursions, experiences) with translations for es/en

### 1.2 Create catalog service

- **File**: `apps/mobile/src/services/catalog.service.ts`
- **Pattern**: Follow `services/project.service.ts` exactly
- **Implementation**:
  - Define `CatalogServiceInterface` with `getCatalogItems()`, `getCatalogItemById()`, `createReservation()`
  - Implement `MockCatalogService` with 800ms delays
  - Implement `RestCatalogService` with fetch calls to `/catalog` endpoints
  - Export smart switch: `env.USE_MOCKS ? MockCatalogService : RestCatalogService`
- **Dependencies**: Import `MOCK_CATALOG` from mocks, validate with Zod using `CatalogItemSchema`

### 1.3 Create catalog store

- **File**: `apps/mobile/src/stores/catalog.store.ts`
- **Pattern**: Follow `stores/project.store.ts` structure using Zustand
- **State**: items array, selectedItem, isLoading, isSaving, error
- **Actions**: fetchCatalogItems(), selectItem(id), createReservation(itemId, data)
- **Persistence**: No persistence required (session-only)

## Phase 2: Components

### 2.1 Create ServiceCard component

- **File**: `apps/mobile/src/components/catalog/ServiceCard.tsx`
- **Props**: `item: CatalogItem`, `onPress: () => void`
- **UI**: Image (optional), name (localized), price, max_participants badge, brief description
- **Styling**: NativeWind, card shadow, pressable states

### 2.2 Create SectionHeader component

- **File**: `apps/mobile/src/components/catalog/SectionHeader.tsx`
- **Props**: `title: string`, `subtitle?: string`
- **UI**: Bold title, optional lighter subtitle
- **Styling**: NativeWind, consistent spacing

### 2.3 Create ReservationModal component

- **File**: `apps/mobile/src/components/catalog/ReservationModal.tsx`
- **Props**: `visible: boolean`, `item: CatalogItem | null`, `onClose: () => void`, `onConfirm: (data) => void`
- **UI**: Modal overlay, service summary, date picker, participant count, confirm/cancel buttons
- **State**: Uses `catalogStore` for modal control
- **Validation**: Required fields check before confirm

## Phase 3: Integration

### 3.1 Update catalog screen

- **File**: `apps/mobile/src/app/(tabs)/tourist/catalog.tsx`
- **Implementation**:
  - Import and use `useCatalogStore` to fetch items on mount
  - Group items by `catalog_type` using SectionHeader
  - Render ServiceCard for each item with onPress → open ReservationModal
  - Add loading skeleton/spinner while isLoading
  - Add error state display

### 3.2 Add i18n keys

- **File**: Add to existing i18n config (or `apps/mobile/src/i18n/en.ts` / `es.ts`)
- **Keys**:
  - `catalog.title`, `catalog.subtitle`
  - `catalog.section.tours`, `catalog.section.experiences`, `catalog.section.excursions`
  - `catalog.card.participants`, `catalog.card.perPerson`
  - `reservation.title`, `reservation.date`, `reservation.participants`, `reservation.confirm`, `reservation.cancel`
  - `catalog.loading`, `catalog.error`

## Phase 4: Verification

### 4.1 Manual test against spec

- [ ] Catalog loads with mock data visible
- [ ] Items grouped by type with SectionHeaders
- [ ] ServiceCard displays localized name, price, participants
- [ ] Tap on card opens ReservationModal
- [ ] Modal shows correct item details
- [ ] Confirm action triggers reservation flow
- [ ] Error state displays on failure
- [ ] Loading states show during async operations
- [ ] Language toggle switches all displayed text
- [ ] Works with `USE_MOCKS=false` (REST endpoint)

### 4.2 Code quality checks

- [ ] No `any` types - use proper CatalogItem typing
- [ ] All images have alt text
- [ ] NativeWind only (no inline styles)
- [ ] Consistent with existing project.service.ts patterns

## Dependencies & Order

**Must complete before Phase 2:**

- 1.1 → 1.2 → 1.3

**Must complete before Phase 3:**

- Phase 1 complete
- 2.1, 2.2, 2.3 (components independent, can parallel)

**Must complete before Phase 4:**

- Phase 2 complete
- 3.1, 3.2
