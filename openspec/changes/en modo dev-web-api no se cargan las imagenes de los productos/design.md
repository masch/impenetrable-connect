# Design: Fix product images not loading in dev-web-api mode

## Technical Approach

Four independent changes across backend (CORS, seed data) and mobile (rendering, error feedback). All changes are file-local with zero refactoring. Mock mode is protected by the existing `env.USE_MOCKS` switch — seed data changes are data-only, and the mock patch file (`apps/mobile/src/mocks/product.ts`) continues to override image URLs for local assets. The CORS change uses `config.isDevelopment` as the guard, so production behavior is untouched.

## Architecture Decisions

### Decision: CORS dev origin strategy

| Option                                   | Tradeoff                                             | Decision                                   |
| ---------------------------------------- | ---------------------------------------------------- | ------------------------------------------ |
| Allow any localhost origin in dev        | Simpler, covers any port                             | ✅ **Chosen** — keeps code future-proof    |
| Regex `localhost:808\d` only (from spec) | Tighter but fails if Expo uses 19006 or custom ports | ❌ Rejected — too fragile for dev workflow |

**Rationale**: In dev, browser requests originate from Expo's dev server port (8081, 8082, or 19006). Requiring an exact port causes friction every time port conflicts arise. Allowing any `localhost` origin in dev is safe because the browser is on the same machine. Production is unaffected because the dev guard is `config.isDevelopment`.

**Implementation**: Insert a `localhost` dev check BEFORE the existing origin-matching chain. Production path is unchanged (exact-match from `ALLOWED_ORIGINS`).

### Decision: Seed data source

| Option                      | Tradeoff                                               | Decision      |
| --------------------------- | ------------------------------------------------------ | ------------- |
| Unsplash URLs with `?w=400` | Consistent with existing 5 products, works in API mode | ✅ **Chosen** |
| Placeholder-service URLs    | Adds dependency, requires network in API mode          | ❌ Rejected   |

**Rationale**: The 5 existing products already use Unsplash URLs. Adding 13 more with the same pattern is consistent and zero new dependencies. DB seed already handles `zzz_image_url` generically (`seed.ts:131-134`), converting to DB-compatible `string | null`. No seed script changes needed — just reseed.

### Decision: Web rendering approach

| Option                             | Tradeoff                                               | Decision                                                     |
| ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `objectFit: "cover"` in style prop | Cross-platform, no imports needed                      | ✅ **Chosen**                                                |
| `Platform.OS === "web"` branching  | Adds platform complexity, not needed                   | ❌ Rejected                                                  |
| NativeWind `object-cover` class    | Depends on Tailwind v4 object-fit support availability | ❌ Rejected — `objectFit` in style is simpler and guaranteed |

**Rationale**: React Native `Image` supports `objectFit` in style since RN 0.73+. On web it maps to CSS `object-fit: cover`; on native it maps to the native resize mode. Single line, zero imports, zero platform branching.

### Decision: Error feedback scope

| Option                                  | Tradeoff                            | Decision                                 |
| --------------------------------------- | ----------------------------------- | ---------------------------------------- |
| Include `(err as Error).message` in log | Debug info in logs, not user-facing | ✅ **Chosen**                            |
| Surface in UI error state               | May expose backend details to users | ❌ Rejected — UI error stays as i18n key |

**Rationale**: The store already logs errors via `logger.error`. Adding the error message string to the log call gives developers enough context to distinguish CORS failures, 500 errors, or network timeouts without reading backend logs. The user-facing `error` state string stays as an i18n key (safe for display).

## Data Flow

```
Expo Web Browser (port 8081/8082)
  │ Origin: http://localhost:8081
  │
  ▼
Backend CORS middleware (app.ts)
  ├─ isDevelopment? → allow any localhost origin  ← NEW
  ├─ production?    → exact match from ALLOWED_ORIGINS (unchanged)
  │
  ▼
Backend /v1/services route
  ├─ Returns CatalogItem[] with zzz_image_url  ← NEW: 18/18 have URLs
  │
  ▼
RestProductService (mobile)
  ├─ handleResponse → typed CatalogItem[]
  │
  ▼
Product Store (zustand)
  ├─ success: services[]
  ├─ error:   includes detail in logger.error  ← NEW
  │
  ▼
ServiceCard rendering
  ├─ zzz_image_url ? → <Image objectFit="cover" />  ← NEW
  └─ no image?       → <Icon name="image-off-outline" /> (fallback)
```

## File Changes

| File                                                    | Action    | Description                                                                    |
| ------------------------------------------------------- | --------- | ------------------------------------------------------------------------------ |
| `apps/backend/src/app.ts:16-23`                         | Modify    | CORS callback: allow any localhost origin in development before existing logic |
| `packages/shared/src/mocks/product-data.ts`             | Modify    | Add `zzz_image_url` (Unsplash `?w=400`) to 13 products (IDs 1-8, 10-13, 17)    |
| `apps/mobile/src/components/catalog/ServiceCard.tsx:45` | Modify    | Add `objectFit: "cover"` to Image style                                        |
| `apps/mobile/src/stores/product.store.ts:60,68,78`      | Modify    | Include `(err as Error).message` in logger.error calls                         |
| `apps/mobile/src/mocks/product.ts`                      | No change | Mock patch still overrides seed URLs with local assets — keeps working         |
| `apps/backend/src/db/seed.ts`                           | No change | Already handles `zzz_image_url` generically — just reseed                      |

## Interfaces / Contracts

No new interfaces. The `CatalogItem.zzz_image_url` field stays `string | typeof require("...") | undefined` — already supports both URL strings (for API) and require() assets (for mock). The seed data change only adds string values.

## Detailed Changes

### CORS — `apps/backend/src/app.ts`

Current (line 16-23):

```ts
const corsMiddleware = cors({
  origin: (origin, c) => {
    const config = getAppConfig(c);
    if (config.allowedOrigins.length === 0) return null;
    if (config.allowedOrigins.includes("*")) return origin;
    if (config.allowedOrigins.includes(origin)) return origin;
    return null;
  },
```

New:

```ts
const corsMiddleware = cors({
  origin: (origin, c) => {
    const config = getAppConfig(c);

    // Dev: allow any localhost origin (browser dev server can be 8081, 8082, 19006, etc.)
    if (config.isDevelopment && origin && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      return origin;
    }

    if (config.allowedOrigins.length === 0) return null;
    if (config.allowedOrigins.includes("*")) return origin;
    if (config.allowedOrigins.includes(origin)) return origin;
    return null;
  },
```

The production guard is implicit: in production, `config.isDevelopment` is `false`, so the dev shortcut is skipped and the existing exact-match logic applies unchanged.

### Seed Data — `packages/shared/src/mocks/product-data.ts`

13 products get `zzz_image_url` added. Each URL follows the existing pattern (`https://images.unsplash.com/...?w=400`). Categories:

| ID  | Product                       | Unsplash Image Category   |
| --- | ----------------------------- | ------------------------- |
| 1   | Empanadas carne 1/2 docena    | Empanadas / meat pastries |
| 2   | Empanadas carne 1 docena      | Empanadas / meat pastries |
| 3   | Empanadas charqui 1/2 docena  | Dried meat / charqui      |
| 4   | Empanadas charqui 1 docena    | Dried meat / charqui      |
| 5   | Empanadas verdura 1/2 docena  | Vegetable pastries        |
| 6   | Empanadas verdura 1 docena    | Vegetable pastries        |
| 7   | Empanadas pollo 1/2 docena    | Chicken pastries          |
| 8   | Empanadas pollo 1 docena      | Chicken pastries          |
| 10  | Pastel zapallo o papa c/chivo | Pumpkin/goat pie          |
| 11  | Estofado de chivo             | Goat stew                 |
| 12  | Guiso de Chivo                | Goat stew (guiso)         |
| 13  | Repollo asado c/verduras      | Roasted cabbage           |
| 17  | Vianda                        | Packed lunch / takeaway   |

### Web Rendering — `apps/mobile/src/components/catalog/ServiceCard.tsx`

Current (line 45):

```tsx
style={{ width: "100%", height: "100%" }}
```

New:

```tsx
style={{ width: "100%", height: "100%", objectFit: "cover" }}
```

### Error Feedback — `apps/mobile/src/stores/product.store.ts`

Replace `logger.error("Error fetching products", err)` with:

```ts
logger.error("Error fetching products", {
  error: err instanceof Error ? err.message : String(err),
});
```

Applied 3 times (lines 59-60, 70-72, 82-84). The `error` state string remains unchanged (i18n key) — only the log message expands.

## Testing Strategy

| Layer              | What                           | Approach                                                                                                                            |
| ------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Unit — CORS        | Production guard unchanged     | Existing test at `app.test.ts:40` already covers production CORS security guard — no change needed                                  |
| Unit — CORS        | Dev allows localhost origins   | Add test in `app.test.ts`: `app.request` with `ENVIRONMENT: "development"` and verify CORS header on response from arbitrary origin |
| Unit — ServiceCard | Image renders with objectFit   | Existing test at `ServiceCard.test.tsx:41` renders with image URL — passes unless style change breaks something                     |
| Unit — ServiceCard | Fallback renders without image | Existing test at `ServiceCard.test.tsx:76` — no regression                                                                          |
| Manual             | dev-web-api mode               | Start backend (`make dev-backend`) + web app (`EXPO_PUBLIC_USE_MOCKS=false npx expo start --web`), verify all 18 cards show images  |
| Manual             | Mock mode unaffected           | `EXPO_PUBLIC_USE_MOCKS=true npx expo start --web` — verify images still display (local assets via mock patch)                       |
| Manual             | CORS across ports              | Run Expo web on `--port 8082` (or other), verify no CORS errors in browser console                                                  |
| Manual             | Reseed confirmation            | Run `make seed-db`, verify `products` table has 18 rows with `zzz_image_url`                                                        |

### CORS edge cases to verify

- Request with `Origin: null` (file:// protocol, incognito) → should fall through to existing logic, which may reject it
- Request without `Origin` header → same behavior as before
- Request from `http://localhost:3000` (the API itself) → allowed in dev (this is fine)

## Rollback Strategy

| File                                                 | Revert Action                                                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `apps/backend/src/app.ts`                            | Revert lines 16-23 to original 4-line origin callback                                                                    |
| `packages/shared/src/mocks/product-data.ts`          | Revert 13 `zzz_image_url` assignments to `undefined`                                                                     |
| `apps/mobile/src/components/catalog/ServiceCard.tsx` | Remove `objectFit: "cover"` from line 45 style                                                                           |
| `apps/mobile/src/stores/product.store.ts`            | Revert logger.error calls to original format                                                                             |
| Database                                             | Re-run seed without the change (or manually `UPDATE products SET zzz_image_url = NULL WHERE zzz_id IN (1..8,10..13,17)`) |

All changes are isolated to individual files — no cross-file dependencies. Can be reverted per-file or as a commit range.

## Migration / Rollout

- Database reseed is required after seed data change: `make seed-db`
- No data migration needed — seed only affects fresh inserts (onConflictDoUpdate will overwrite existing rows)
- Backend must be restarted after app.ts change
- Mobile app must be reloaded after store/component changes (HMR handles it)

## Open Questions

- None. All four changes have clear, confirmed approaches.
