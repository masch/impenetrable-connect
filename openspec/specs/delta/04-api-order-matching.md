# Specification: API Order Matching & Venture Capacity Routing

## Purpose

Align the API mode (`USE_MOCKS = false`) with the MOCK mode, allowing orders created by tourists to be automatically routed and offered to available entrepreneurs. This includes refactoring the category reference across orders and ventures to use `zzz_product_category_id` (pointing to `product_categories.zzz_id`), replacing the deprecated `zzz_catalog_type_id` field for naming consistency, and implementing a synchronous cascading matching engine in the backend `OrderService.create`.

## Requirements

- **Venture Schema Update**:
  - The `ventures` table MUST contain a `zzz_product_category_id` foreign key referencing `product_categories.zzz_id`.
  - The `Venture` type definition and schemas in `@repo/shared` MUST expose `zzz_product_category_id` as a required integer.
  - Mock data and DB seed scripts MUST populate `zzz_product_category_id = 1` (Gastronomy) for the seeded ventures.

- **Orders Schema Renaming**:
  - The `orders` table column `zzz_catalog_type_id` MUST be renamed to `zzz_product_category_id` referencing `product_categories.zzz_id`.
  - All shared schemas and validators in `@repo/shared` (e.g. `OrderDbSchema`, `CreateOrderInputSchema`) MUST rename `zzz_catalog_type_id` to `zzz_product_category_id`.
  - All client-side services (e.g., `ProductService`, `orderService`, and mock states) MUST consume `zzz_product_category_id`.

- **Synchronous Order Assignment**:
  - When an order is created, the system MUST find all active and unpaused ventures (`zzz_is_active = true`, `zzz_is_paused = false`) under the same project that match the order's `zzz_product_category_id`.
  - These ventures MUST be sorted by `zzz_cascade_order` in ascending order.
  - The system MUST iterate through these ventures to find the first one that has enough capacity at the requested service date and time (`zzz_service_at`).
  - Capacity calculation MUST sum the `guest_count` of all `CONFIRMED` orders assigned to the candidate venture at the exact `zzz_service_at` timestamp.
  - If the sum of existing confirmed guest counts plus the new order's `guest_count` is less than or equal to the venture's `zzz_max_capacity`, the venture passes the capacity check.

- **Status Transition on Creation**:
  - If a matching venture is found, the order's `zzz_global_status` MUST be set to `OFFER_PENDING` and its `zzz_current_offer_venture_id` MUST be set to the matched venture's ID.
  - If no matching venture is found (all skipped or capacity exceeded), the order's `zzz_global_status` MUST be set to `EXPIRED` and its `zzz_cancel_reason` set to `NO_VENTURE_AVAILABLE`.

- **Accept / Decline Actions**:
  - When the entrepreneur accepts the order (PATCH `/orders/:id/status` with `CONFIRMED`), the order's status MUST transition to `CONFIRMED` and `zzz_confirmed_venture_id` set to the venture ID.
  - When the entrepreneur declines the order (PATCH `/orders/:id/status` with `CANCELLED` and cancel reason `BY_ENTREPRENEUR`), the order's status MUST transition to `CANCELLED` and `zzz_cancel_reason` set to `BY_ENTREPRENEUR`.

## Scenarios

### Scenario 1: Successful Order Placement & Offer Assignment

- **Given** at least one venture matches the order's catalog category
- **And** the venture is active and not paused
- **And** the venture has sufficient capacity (existing confirmed guest count + order guest count <= max capacity)
- **When** a tourist places the order (creates order via API)
- **Then** the order MUST be created with status `OFFER_PENDING`
- **And** the order's `zzz_current_offer_venture_id` MUST match the first available venture's ID

### Scenario 2: Order Auto-Expires Due to Capacity Exceeded

- **Given** all matching ventures have reached their capacity limit for the requested service time
- **When** a tourist places the order
- **Then** the order MUST be created with status `EXPIRED`
- **And** the order's `zzz_cancel_reason` MUST be `NO_VENTURE_AVAILABLE`
- **And** the order's `zzz_current_offer_venture_id` MUST remain `null`

### Scenario 3: Order Auto-Expires Due to Paused/Inactive Ventures

- **Given** all matching ventures are either inactive (`zzz_is_active = false`) or paused (`zzz_is_paused = true`)
- **When** a tourist places the order
- **Then** the order MUST be created with status `EXPIRED`
- **And** the order's `zzz_cancel_reason` MUST be `NO_VENTURE_AVAILABLE`

### Scenario 4: Entrepreneur Accepts Order

- **Given** an order in status `OFFER_PENDING` with `zzz_current_offer_venture_id` set to a venture
- **When** the entrepreneur of that venture accepts the order (sends PATCH `/status` as `CONFIRMED`)
- **Then** the order status MUST transition to `CONFIRMED`
- **And** `zzz_confirmed_venture_id` MUST be set to the venture ID
- **And** `zzz_confirmed_at` MUST be set to the current timestamp

### Scenario 5: Entrepreneur Rejects Order

- **Given** an order in status `OFFER_PENDING` with `zzz_current_offer_venture_id` set to a venture
- **When** the entrepreneur of that venture declines the order (sends PATCH `/status` as `CANCELLED` with reason `BY_ENTREPRENEUR`)
- **Then** the order status MUST transition to `CANCELLED`
- **And** `zzz_cancel_reason` MUST be `BY_ENTREPRENEUR`
- **And** `zzz_cancelled_at` MUST be set to the current timestamp
