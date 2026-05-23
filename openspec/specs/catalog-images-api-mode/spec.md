# Catalog Images API Mode Specification

## Purpose

Ensure all catalog items display images when fetched via API mode (`USE_MOCKS=false`), matching the mock mode experience on both web and native platforms.

## Requirements

### Requirement: Complete Image Coverage

All 18 catalog items MUST have a resolvable `zzz_image_url` when returned by `/v1/services`, regardless of mode (mock or API).

#### Scenario: All products have image URLs

- GIVEN the catalog data source (mock data or database seed)
- WHEN enumerating all 18 products
- THEN each product MUST have a non-null `zzz_image_url` pointing to a real Unsplash image

#### Scenario: Mock mode regression prevention

- GIVEN the app is running in mock mode (`USE_MOCKS=true`)
- WHEN the product store fetches services
- THEN all 18 products MUST display images with `zzz_image_url` unchanged from before this change
- AND no mock patch override of `zzz_image_url` SHALL be required

### Requirement: Web Image Rendering

On the web platform (dev-web-api), product images in the ServiceCard MUST render with `object-fit: cover` to maintain aspect ratio.

#### Scenario: Web image aspect ratio

- GIVEN a ServiceCard is rendered on the web platform
- WHEN the product has a valid `zzz_image_url`
- THEN the Image component MUST apply `objectFit: "cover"` styling
- AND the image MUST fill its container without stretching or distortion

#### Scenario: Native rendering unaffected

- GIVEN a ServiceCard is rendered on native (iOS/Android)
- WHEN the product has a valid `zzz_image_url`
- THEN the Image styling MUST NOT be affected by the web-only `objectFit` change
- AND the image display behavior MUST remain identical to before this change

### Requirement: Error Detail Feedback

When the API call to fetch products fails, the store's error state MUST include the actual error details rather than a generic message.

#### Scenario: Network error with detail

- GIVEN the app is in API mode
- WHEN the API request to `/v1/services` fails (e.g., network timeout, server error)
- THEN the store's `error` state MUST include the error's `.message` property
- AND the error string MUST be more descriptive than "Failed to fetch services"
