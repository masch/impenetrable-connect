# Proposal: Fix product images not loading in dev-web-api mode

## Intent

In API mode (`USE_MOCKS=false` on web), product images don't load: only 5/18 products have image URLs in seed data, CORS blocks if Expo web uses a port other than 8081, web images stretch instead of covering. Mock mode is stable and must not regress.

## Scope

### In Scope

1. **CORS fix**: Accept any localhost port in dev (not just `:8081`).
2. **Seed data**: Add Unsplash URLs to the 13 products missing them.
3. **Web rendering**: Add `objectFit: "cover"` to ServiceCard Image.
4. **Error feedback**: Surface API error detail in store state.

### Out of Scope

- Mock mode — untouched.
- RestProductService — no refactor.
- Image upload feature — future.

## Capabilities

### New Capabilities

- `<catalog-images-api-mode>`: All catalog items display images when fetched from `/v1/services`, matching mock mode.

### Modified Capabilities

- `<backend-api>` (delta): CORS allows localhost dev on dynamic ports; seed data has full image coverage.

## Approach

**CORS** (`apps/backend/src/app.ts:16-27`, `.env:13`): Change origin callback to allow `origin.startsWith("http://localhost")` when not in production. Env entry becomes `http://localhost:*` or similar.

**Seed data** (`packages/shared/src/mocks/product-data.ts`): Add `zzz_image_url: "https://images.unsplash.com/…?w=400"` to items 1-8, 10-13, 17. DB seed already handles it generically (`apps/backend/src/db/seed.ts:133`). Reseed after change.

**Web rendering** (`apps/mobile/src/components/catalog/ServiceCard.tsx:45`): Add `objectFit: "cover"` to existing style. Web-only CSS — no mobile regression.

**Error feedback** (`apps/mobile/src/stores/product.store.ts:60`): Include `(err as Error).message` in error string.

## Affected Areas

| Area                                                 | Impact   | Description                                    |
| ---------------------------------------------------- | -------- | ---------------------------------------------- |
| `.env`                                               | Modified | Relax CORS origins of localhost                |
| `apps/backend/src/app.ts`                            | Modified | CORS callback allows any localhost port in dev |
| `packages/shared/src/mocks/product-data.ts`          | Modified | Add image URLs to 13 products                  |
| `apps/mobile/src/components/catalog/ServiceCard.tsx` | Modified | Add `objectFit: "cover"`                       |
| `apps/mobile/src/stores/product.store.ts`            | Modified | Include error detail                           |

## Risks

| Risk                       | Likelihood | Mitigation                                |
| -------------------------- | ---------- | ----------------------------------------- |
| CORS too permissive in dev | Low        | Prod stays strict by `isProduction` check |
| Seed data requires reseed  | Medium     | Add `make seed-db` to task list           |
| Web change breaks mobile   | Low        | `objectFit` is web-only                   |

## Rollback Plan

Revert the commit range — all changes are localized in 5 files with no side effects.

## Dependencies

- Database reseed after seed data change.
- Expo web dev server restart.

## Success Criteria

- [ ] API mode: all 18 products show images, not placeholders.
- [ ] Mock mode: all 18 products show images (no regression).
- [ ] Expo web on port 8082/19006: no CORS errors.
- [ ] Web images render with `object-fit: cover`.
- [ ] `make check` passes.
