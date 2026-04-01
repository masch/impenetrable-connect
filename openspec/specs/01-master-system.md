# OpenSpec: Multi-Destination Impenetrable Reservation Platform

> **Tech Stack:** Bun (runtime) + Bun (package manager) — No npm/pnpm/yarn

## 1. System Overview
The platform is a reservation application designed for local residents and entrepreneurs within conservation projects, starting with the IMPE (Impenetrable) region [1]. The main goal is to manage requests for activities and gastronomic services using a fair and equitable rotation logic [1]. 

To achieve this, the system features an automated engine that replaces manual assignments, routing orders in a way that allows the entrepreneur to accept or reject the service [1]. Additionally, it provides a frictionless experience so tourists can easily access the app to request their daily activities or meals [1].

**Key Technical Context:** The application will be primarily used on **Web and Android** platforms. Because the user base (both local entrepreneurs and some tourists) lacks advanced smartphone skills, **ease of use and accessibility are the highest priorities**. Furthermore, the frontend must be highly optimized to run smoothly on **low-end mobile devices**.

## 2. Actors and Intentions (Roles)

> **MVP Scope:** Tourist (2.1), Entrepreneur (2.2), Engine Core (2.4 without Morning Reminder)

### 2.1. Tourist (Zero Friction) **[MVP]**
*   **Intention:** Request an activity or service quickly [1].
*   **Behavior & UX Constraints:**
    *   Eliminates the need for traditional user account creation to avoid friction [2].
    *   Accesses the platform by scanning a QR code (which already contains the Project ID, e.g., Impenetrable) [2].
    *   Identifies themselves using a mandatory "Alias" [2].
    *   **Authentication (Tourist - No Login):** No login required. Access tokens (1 hour) + refresh tokens (30 days) bound to browser fingerprint. This replaces the previous 7-day JWT approach.

### 2.2. Entrepreneur **[MVP]**
*   **Intention:** Organize daily work and receive clients equitably through the rotation system [1, 2].
*   **Behavior & UX Constraints:**
    *   Each entrepreneur can manage ONE OR MORE Ventures through the Venture_Manager relationship. Multiple entrepreneurs can manage the same Venture (e.g., family business).
    *   The entrepreneur can only offer items from the **Master Catalog** defined by the Admin for that Project, filtered by the Venture's Catalog_Type [2].
    *   The engine routes orders to the entrepreneur's Venture, and from their dashboard, they can accept or reject the request [2].
    *   **Calendar View:** The dashboard includes a simple calendar view to track assigned orders based on the service date and the specific time of day [2].
    *   **Individual Pause (Stock Control):** Can pause a specific catalog item if they run out of ingredients [2].
    *   **General Pause (Capacity Control):** Can disable the reception of all new requests if their business is full or closed [2].
    *   *UX Priority:* The dashboard must be native-feeling on Android, avoiding complex menus. Actions like "Accept/Reject" must be prominent and error-proof.

### 2.3. Impenetrable Admin **[POST-MVP]**
*   **Intention:** Audit the ecosystems, enable local hosts, and control regional catalogs [3].
*   **Behavior:**
    *   Enables the entrepreneur in the platform [3].
    *   *Evolution:* No longer performs manual request routing; this is now handled by the Backend Autonomous Engine [3].
    *   Manages the master catalog separated *by project* [3]. Can apply a **Global Pause** to an item across an entire region [3].
    *   Consumes a Monthly Reporting Dashboard (KPIs for acceptance rates, timeouts, and completed services) [3].

> **MVP Alternative:** In the absence of the Admin Panel, all data management (creating Projects, Catalog Types, Catalog Items, Ventures, Entrepreneurs, and Venture Schedules) is performed via **CLI seed scripts** (`bun run db:seed`). The seed script reads from a structured JSON/TS configuration file that can be versioned in the repository. This is sufficient for the initial deployment with a single project (Impenetrable) and a known set of entrepreneurs.

### 2.4. Autonomous Engine (Platform Backend) **[MVP]**
*   **Intention:** Guarantee the fair distribution of work per region without human intervention [4].
*   **Behavior:** 
    *   **Router:** Executes the Cascading Routing Algorithm, isolating the rotation lists for each Project [4].
    *   **Morning Reminder (Cron Job):** **[POST-MVP]** Runs a scheduled task early in the morning to find confirmed orders for the current day and sends the entrepreneur an automated reminder (via WhatsApp/Email) with their daily agenda [4].

---

## 3. Business Rules (Core Workflows)

### 3.1. Cascading Routing Flow (Project-Isolated) **[MVP]**

> **Note:** Cascade iterates through **Ventures** (sorted by cascade_order). The engine infers the required Catalog_Type from `order.catalog_item_id` → `Catalog_Item.catalog_type_id`, then filters ventures that match that type.

When a tourist submits a request:
1.  **Order Init**: Order is created with status `SEARCHING`. The engine starts iterating through **Ventures** (filtered by Catalog_Type) sorted by `cascade_order` (ascending).
2.  **Filter Phase**: For each venture in rotation order:
    - Skip if `venture.is_active = false` → record `skip_reason = VENTURE_INACTIVE`
    - Skip if `venture.is_paused = true` → record `skip_reason = GENERAL_PAUSE`
    - Skip if `catalog_item_id` is in `Venture_Paused_Item` for this venture → record `skip_reason = INDIVIDUAL_PAUSE`
    - Skip if `(current_occupation + guest_count) > venture.max_capacity` → record `skip_reason = CAPACITY_EXCEEDED`
    - Skip if no matching `Venture_Schedule` for service_date day → record `skip_reason = CLOSED_THAT_DAY`
    - Skip if requested time is outside `Venture_Schedule` range → record `skip_reason = OUTSIDE_OPENING_HOURS`
3.  **Offer Phase**: First venture that passes filters gets the offer:
    - Create Cascade_Assignment with `offer_status = WAITING_FOR_RESPONSE`
    - Set `response_deadline = now + project.cascade_timeout_minutes`
    - Send notification to all entrepreneurs linked to this venture
4.  **Response Handling**:
    - **Accept**: Update Order status to `CONFIRMED`, set `confirmed_venture_id`, mark assignment as `ACCEPTED`
    - **Reject**: Mark assignment as `REJECTED`, continue to next venture in rotation
    - **Timeout**: Mark assignment as `TIMEOUT`, continue to next venture
5.  **Termination Conditions**:
    - **Success**: Linked entrepreneur accepts → Order becomes `CONFIRMED`
    - **Max Attempts**: After `project.max_cascade_steps` rejections/timeouts → Order becomes `EXPIRED` with cancel_reason `NO_VENTURE_AVAILABLE`
    - **All Paused**: If ALL ventures are skipped (General/Individual Pause) → Order becomes `EXPIRED` with cancel_reason `NO_VENTURE_AVAILABLE`
    - **Tourist Cancel**: Order becomes `CANCELLED` with cancel_reason `BY_TOURIST`
    - **Entrepreneur Cancel**: Confirmed order cancelled by entrepreneur → Order becomes `SEARCHING` (cascade restarts), cancel_reason = `BY_ENTREPRENEUR`

**Initial Cascade Order**: Default is creation order (1, 2, 3...). Admin can manually reorder ventures in the Admin Panel to change rotation priority.

#### Timeout Processor (MVP — Simple Auto-Assignment)

> **MVP Scope:** Uses a lightweight in-process timer (`setInterval` every 30 seconds) running inside the Hono server. When an offer times out, the engine **auto-assigns** the order to the next available venture — no additional offer/wait cycle.

**MVP Timeout Flow:**
1. `setInterval` runs every 30 seconds inside Hono process
2. Scan `Cascade_Assignment` where `offer_status = WAITING_FOR_RESPONSE` AND `response_deadline < now()`
3. Mark timed-out assignment as `offer_status = TIMEOUT`
4. Find the **next available venture** in cascade order that passes all filter checks (active, not paused, has capacity, is open)
5. **Auto-assign:** Set order `status = CONFIRMED`, set `confirmed_venture_id`, create `Cascade_Assignment` with `offer_status = ACCEPTED`
6. Notify entrepreneur of the auto-assigned order
7. If no venture is available → Mark order as `EXPIRED` with `cancel_reason = NO_VENTURE_AVAILABLE`

> **POST-MVP Evolution:** Replace `setInterval` with a proper job queue (BullMQ + Redis) for reliability and persistence across restarts. Add full cascade retry (offer → wait → timeout → next) instead of auto-assignment. See §3.1.1 for offline handling details.

### 3.1.1. Offline Handling & Timeout Management **[POST-MVP]**

> **Problem:** In conservation areas, entrepreneurs have intermittent connectivity. A venture may be offline when the timeout expires, causing confusion and lost business opportunities.

### 3.1.2. Race Condition Prevention in Cascade Accept **[POST-MVP]**

> **MVP Note:** The MVP includes **basic state validation** in accept/reject endpoints: before processing, the server verifies that the order is in `OFFER_PENDING` status and that the requesting venture matches the current offer. If conditions are not met, it returns HTTP 409 (Conflict) or 410 (Gone). Full atomic transactions with `FOR UPDATE` locks and `SERIALIZABLE` isolation level are deferred to POST-MVP.

> **Problem:** When an entrepreneur accepts an order while another is processing, or when an accept request arrives after the timeout has already expired, the system must handle this gracefully without leaving the order in an inconsistent state.

**Race Condition Scenarios:**

| Scenario | Description |
|----------|-------------|
| **Simultaneous Accepts** | Two entrepreneurs (in rare cases of system misconfiguration) attempt to accept the same order at the exact same time |
| **Accept After Timeout** | An entrepreneur's accept request arrives after the timeout has expired and the order was already offered to the next venture |
| **Network Delay** | Entrepreneur sends accept, network is slow, timeout expires during transit, accept arrives late |

**Solution: First-Write-Wins with Atomic Transactions**

The system uses atomic database operations to ensure only the first accepted offer succeeds:

```
ACCEPT REQUEST FLOW:

1. START TRANSACTION (SERIALIZABLE isolation level)

2. SELECT order FROM Order WHERE id = :orderId 
   FOR UPDATE  ← Lock the row to prevent concurrent modifications

3. VALIDATE current status:
   - If status = 'CONFIRMED' → REJECT (already accepted by another)
   - If status = 'EXPIRED' → REJECT (cascade already finished)
   - If status = 'CANCELLED' → REJECT (tourist cancelled)
   - If status = 'OFFER_PENDING' AND venture_id matches → PROCEED
   - If status = 'OFFER_PENDING' AND venture_id does NOT match → REJECT (not your turn)

4. UPDATE Order SET status = 'CONFIRMED', confirmed_venture_id = :ventureId

5. UPDATE Cascade_Assignment SET offer_status = 'ACCEPTED', resolved_at = now()
   WHERE order_id = :orderId AND venture_id = :ventureId

6. CREATE notification for tourist: ORDER_CONFIRMED

7. COMMIT TRANSACTION
```

**Response to Late Accepts:**

| Scenario | Server Response | Message to Entrepreneur |
|----------|-----------------|------------------------|
| Order already CONFIRMED by another | HTTP 409 Conflict | "Este pedido ya fue confirmado por otro emprendimiento" |
| Order EXPIRED | HTTP 410 Gone | "El pedido expiró y fue reasignado. Lo sentimos!" |
| Order CANCELLED | HTTP 410 Gone | "El cliente canceló este pedido" |
| Not your turn (OFFER_PENDING but different venture) | HTTP 409 Conflict | "No es tu turno de responder este pedido" |
| **SUCCESS** | HTTP 200 OK | "¡Pedido confirmado! El cliente fue notificado" |

**Database Constraint (Defense in Depth):**

Add a partial unique index to prevent any possibility of double confirmation:

```sql
CREATE UNIQUE INDEX idx_order_single_confirmed 
ON Order (id) 
WHERE status = 'CONFIRMED';
```

This ensures at the database level that only ONE row can have status = 'CONFIRMED' for any order.

### 3.1.3. Idempotency for Accept/Reject Operations **[POST-MVP]**

To handle network retries and duplicate requests:

```
- Accept/Reject requests MUST include Idempotency-Key header
- Server stores (order_id, idempotency_key, result) with 24-hour TTL
- If duplicate request arrives:
  - Return cached result without re-processing
  - Do NOT execute cascade logic again
```

### 3.1.4. Cascade Snapshot (Frozen Rotation Order) **[POST-MVP]**

> **Problem:** If an admin reorders ventures while an order is in cascade, the order might skip or double-visit ventures unexpectedly.

**Solution:** When an order enters the cascade flow, snapshot the current `cascade_order`:

```sql
ALTER TABLE Order ADD COLUMN cascade_snapshot JSONB;

-- When order is created:
UPDATE Order SET cascade_snapshot = (
    SELECT jsonb_object_agg(id, cascade_order)
    FROM Venture 
    WHERE catalog_type_id = :requiredTypeId
);

-- Cascade always reads from snapshot, not current table:
SELECT * FROM jsonb_each_text(cascade_snapshot) ORDER BY value::int;
```

**Timeout Processor (Background Job):**

A scheduled job runs every 30 seconds to process expired offers:

1. **Scan**: Find all `Cascade_Assignment` where `offer_status = WAITING_FOR_RESPONSE` AND `response_deadline < now()`
2. **Mark Timeout**: Update assignment to `offer_status = TIMEOUT`, set `resolved_at = now()`
3. **Continue Cascade**: Trigger next attempt (move to next venture in rotation order)
4. **Log**: Record the timeout for analytics and debugging

**Entrepreneur Reconnection Flow:**

When an entrepreneur returns online:

1. **Pull State**: App calls `GET /orders/pending` with `last_known_status` parameter
2. **Compare**: Server compares client's known state with actual state
3. **Delta Response**: Return only changes (accepted, rejected, expired, new offers)
4. **UI Update**: Show current status - if offer expired, display "Expirado" with reason

**Lost Offer Notification:**

When an offer expires due to timeout:

1. Mark assignment as `TIMEOUT`
2. Create notification record: `event_type = OFFER_EXPIRED`
3. Send push notification: "Tu respuesta expiró. El pedido fue reenviado a otro emprendimiento."
4. Continue cascade to next venture

**Offline Detection Strategy:**

| Scenario | Detection | Action |
|----------|-----------|--------|
| App in foreground | Heartbeat every 30s | Mark as ONLINE |
| App in background | Push token active | Mark as PENDING |
| App closed | No heartbeat > 2 minutes | Mark as OFFLINE |
| Network error on accept | HTTP 0 / timeout | Show retry UI, queue locally |

**Entrepreneur Dashboard - Status Indicators:**

The dashboard MUST show clear visual states:

| State | Color | Message |
|-------|-------|---------|
| `WAITING_FOR_RESPONSE` | Yellow | "Esperando tu respuesta..." |
| `ACCEPTED` | Green | "¡Confirmado! El cliente fue notificado" |
| `REJECTED` | Gray | "Rechazaste este pedido" |
| `TIMEOUT` | Red | "Expirado - El pedido fue reenviado" |
| `EXPIRED` (final) | Red | "Lo sentimos, no hay disponibilidad" |

### 3.2. Internationalization (i18n) **[POST-MVP]**

> **MVP:** Only Spanish (`es`) is required. i18n structure in place but not active.
*   Dynamic Catalog data (dish and activity names) are stored in the database using PostgreSQL's native `JSONB` type [6].
*   This allows the system to quickly extract translations (e.g., `{"es": "Guiso", "en": "Stew"}) based on the tourist's browser `Accept-Language` header [6].

**Fallback Strategy:**
1. Use the language from `Accept-Language` header (e.g., "es", "en", "fr")
2. If the requested language is not available, fall back to the project's `default_language`
3. If the default language is also not available, use the first available language in the translation object
4. If no translation exists at all, return the key (e.g., "ORDER_CONFIRMED") as the message

**Translation Helper:**
```typescript
function getTranslation(translations: Record<string, string>, acceptLanguage: string, defaultLang: string): string {
    const lang = acceptLanguage.split(',')[0].slice(0, 2); // 'es' from 'es,en;q=0.9'
    
    if (translations[lang]) return translations[lang];
    if (translations[defaultLang]) return translations[defaultLang];
    return Object.values(translations)[0] || lang; // First available or lang code
}
```

**Supported Languages per Project:** Each project defines its supported languages in `Project.supported_languages` (JSON array, e.g., `["es", "en", "pt"]`). The first language in the array is the default.

### 3.3. Validation Rules **[MVP]**

#### 3.3.1 Order Creation Validations

When a tourist creates an order, the following validations must pass:

| Field | Validation Rule | Error Message |
|-------|----------------|--------------|
| `service_date` | Required | "Date is required" |
| `service_date` | Must be >= TODAY | "Cannot order for past dates" |
| `service_date` | Must be <= TODAY + 30 days | "Cannot order more than 30 days in advance" |
| `guest_count` | Required | "Number of guests is required" |
| `guest_count` | Must be >= 1 | "At least 1 guest is required" |
| `guest_count` | Must be <= 100 | "Maximum 100 guests per order" |
| `items` | Required, array, min 1, max 1 | "Only 1 item per order" |
| `items[].catalog_item_id` | Required | "Item is required" |
| `items[].quantity` | Required, min 1 | "Quantity must be at least 1" |
| `time_of_day_id` | Required | "Time of day is required" |

#### 3.3.2 Venture Availability Validations (Filter Phase)

> **Note:** Business fields are now in Venture entity. Cascade iterates through Ventures.

Before offering an order to a venture, the engine validates:

| Check | Condition | Skip Reason |
|-------|-----------|-------------|
| Venture Active | `venture.is_active = true` | `VENTURE_INACTIVE` |
| General Pause | `venture.is_paused = false` | `GENERAL_PAUSE` |
| Capacity | `(current_occupation + order.guest_count) <= venture.max_capacity` | `CAPACITY_EXCEEDED` |

> **⚠️ IMPORTANT — Capacity Unit:** Capacity is ALWAYS measured by **number of guests (personas/guest_count)**, NEVER by number of items or dishes ordered. A Venture with `max_capacity = 20` can serve 20 **people** regardless of how many dishes each person orders. All capacity checks (`CAPACITY_EXCEEDED`), occupation calculations (`getCurrentOccupation`), and calendar displays (`occupied_seats / max_capacity`) use `guest_count` as the unit.
| Individual Pause | `catalog_item_id NOT IN (SELECT catalog_item_id FROM venture_paused_item WHERE venture_id = venture.id)` | `INDIVIDUAL_PAUSE` |
| **Opening Hours** | Order time within `venture.opening_hours` for the day | `CLOSED_THAT_DAY` |

**Opening Hours Logic:**
```typescript
function isVentureOpen(venture: Venture, serviceDate: Date, timeOfDayId: number): boolean {
    const dayOfWeek = getDayOfWeek(serviceDate); // 'mon', 'tue', ...
    const hours = venture.opening_hours[dayOfWeek];
    
    if (!hours) return false; // Venture is closed that day
    
    const [openTime, closeTime] = hours.split('-');
    const orderTime = getStartTimeForTimeOfDay(timeOfDayId); // e.g., '12:00' for LUNCH
    
    return orderTime >= openTime && orderTime < closeTime;
}
```

#### 3.3.3 Order Status Transitions

Valid transitions between order states:

```
SEARCHING ──offer──> OFFER_PENDING ──accept──> CONFIRMED ──complete──> COMPLETED
    │                     │                      │              │
    ├──cancel──> CANCELLED ├──cancel──> CANCELLED ├──cancel──> SEARCHING
    │                     │                      │              │
    └──expire──> EXPIRED  └──expire──> EXPIRED   └──no_show──> NO_SHOW
```

**State Transition Rules:**
- `SEARCHING` → `OFFER_PENDING`: When engine offers order to a venture (intermediate state prevents race conditions)
- `OFFER_PENDING` → `CONFIRMED`: When linked entrepreneur accepts for their venture
- `OFFER_PENDING` → `SEARCHING`: When venture rejects or times out (cascade continues to next venture)
- `OFFER_PENDING` → `CANCELLED`: When tourist cancels while venture has pending offer
- `SEARCHING` → `CANCELLED`: When tourist cancels (only if status = SEARCHING)
- `SEARCHING` → `EXPIRED`: When max cascade attempts reached or all ventures skipped
- `CONFIRMED` → `SEARCHING`: When linked entrepreneur cancels (cascade restarts from next venture), sets cancel_reason = BY_ENTREPRENEUR
- `CONFIRMED` → `COMPLETED`: (1) When entrepreneur explicitly marks as complete via `/orders/:id/complete`, OR (2) When service date passes + no NO_SHOW reported
- `CONFIRMED` → `NO_SHOW`: When linked entrepreneur marks tourist as no-show

> **UX Note:** The explicit `/complete` action is the PREFERRED flow. Entrepreneurs should mark the order as complete when they finish preparing the dish or when the service is delivered. The automatic completion (date-based) is a fallback for cases where the entrepreneur forgets to mark it.

#### 3.3.4 Cascade Skip Reasons

Complete list of skip reasons in `Cascade_Assignment.skip_reason`:

| Reason | Description |
|--------|-------------|
| `null` | Venture was offered (not skipped) |
| `GENERAL_PAUSE` | Venture has is_paused = true |
| `INDIVIDUAL_PAUSE` | catalog_item_id is in Venture_Paused_Item for this venture |
| `CAPACITY_EXCEEDED` | (current_occupation + guest_count) > venture.max_capacity |
| `CLOSED_THAT_DAY` | Venture is closed on the requested day (not in opening_hours) |
| `OUTSIDE_OPENING_HOURS` | Requested time is outside venture's operating hours |
| `VENTURE_INACTIVE` | Venture.is_active = false |
| `NOT_OFFERED` | Venture was not in the rotation list |

#### 3.3.5 Order Duplication Prevention

A tourist cannot have multiple active orders for the same:
- `service_date` + `time_of_day_id`

If such order exists with status `SEARCHING` or `CONFIRMED`, the system returns error: "You already have an order for this time slot"

#### 3.3.6 Capacity Calculation — Unit: Guest Count (Occupation Tracking)

When checking if a venture can accept an order, the system calculates **accumulated occupation** from all CONFIRMED orders for that time slot:

```typescript
function getCurrentOccupation(ventureId: number, serviceDate: Date, timeOfDayId: number): number {
    // Sum of guest_count for CONFIRMED orders at same date/time
    // Only CONFIRMED orders count toward capacity - SEARCHING/OFFER_PENDING orders are not yet assigned
    return SUM(o.guest_count) FROM Order o
    WHERE o.confirmed_venture_id = ventureId
      AND o.service_date = serviceDate
      AND o.time_of_day_id = time_of_day_id
      AND o.status = 'CONFIRMED';
}

async function canAcceptOrder(venture: Venture, order: Order): Promise<boolean> {
    const currentOccupation = await getCurrentOccupation(
        venture.id, 
        order.service_date, 
        order.time_of_day_id
    );
    // Check if adding new guests would exceed capacity
    return (currentOccupation + order.guest_count) <= venture.max_capacity;
}
```

**Cascade Filter Phase**: When the engine evaluates a venture, it calculates current occupation:
```typescript
if (currentOccupation + order.guest_count > venture.max_capacity) {
    return { skip: true, reason: 'CAPACITY_EXCEEDED', currentOccupation, maxCapacity: venture.max_capacity };
}
```

**Calendar Response** now includes occupation details:
```json
{
  "time_slots": [{
    "time_of_day_id": 1,
    "current_occupation": 12,
    "max_capacity": 20,
    "available_seats": 8
  }]
}
```

---

## 4. Technical Architecture & Tech Stack

To meet the requirement of running smoothly on low-end devices while serving Web and Android users efficiently:

*   **Frontend Framework:** **React Native using Expo**. This allows writing a single codebase that compiles into a lightweight Android application (APK/AAB) and a responsive Web application.
*   **Performance Constraint:** Avoid heavy UI animations and large client-side bundle sizes to ensure performance on low-end hardware.
*   **Runtime:** **Bun**. High-performance JavaScript/TypeScript runtime used as both the package manager (`bun install`) and the execution environment (`bun run`). Chosen for native TypeScript support without transpilation, built-in test runner, and superior performance over Node.js for this workload.
*   **Backend Framework:** **Hono** (on Bun). Ultralight (~14KB, zero deps) web framework built on Web Standards (Request/Response). Runs natively on `Bun.serve()` without compatibility layers, providing Express-like DX (routing, middleware, path params) at near-raw performance. Enables sharing TypeScript interfaces and type definitions between frontend and backend for end-to-end type safety.
*   **ORM:** **Drizzle ORM**. Type-safe SQL-first ORM with zero runtime overhead. Schema defined in TypeScript with `pgEnum`, `pgTable`, and type inference via `$inferSelect`/`$inferInsert`.
*   **Database:** PostgreSQL (ERD defined below).
*   **State Management:** **Zustand**. Minimal, performant state management for React Native.
*   **Styling:** **NativeWind v5** + Tailwind CSS v4 + `react-native-css`. CSS-first configuration with `@theme` tokens in CSS (not JS config). Components wrapped with `useCssElement` for `className` support.
*   **Monorepo:** **Bun Workspaces**. Single repository with multiple projects sharing types and validators.

#### 4.0.1 Project Structure (Bun Workspaces Monorepo)

```
rewilding-connect/
├── apps/
│   ├── backend/                 # Hono API server (Bun runtime)
│   │   ├── src/
│   │   │   ├── routes/          # Hono route handlers (/v1/auth, /v1/orders, etc.)
│   │   │   ├── services/        # Business logic (CascadeEngine, etc.)
│   │   │   ├── db/
│   │   │   │   ├── schema/      # Drizzle ORM table definitions (pgEnum, pgTable)
│   │   │   │   └── migrations/  # Generated SQL migrations (drizzle-kit)
│   │   │   └── middleware/      # Auth (jwt), error handling, rate limiting
│   │   ├── seeds/               # CLI seed scripts (MVP replacement for Admin Panel)
│   │   ├── drizzle.config.ts    # Drizzle Kit configuration
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                  # Expo + React Native (Web + Android)
│       ├── app/                 # Expo Router file-based routing
│       │   ├── (tourist)/       # Tourist flow screens
│       │   ├── (entrepreneur)/  # Entrepreneur flow screens
│       │   └── _layout.tsx      # Root layout with native tabs
│       ├── components/          # Screen-specific components
│       ├── stores/              # Zustand stores (auth, orders, catalog)
│       ├── services/            # Backend API communication layer
│       │   ├── api-client.ts    # HTTP client (fetch + auth interceptor + token refresh)
│       │   ├── auth.service.ts  # Tourist/Entrepreneur auth endpoints
│       │   ├── catalog.service.ts # Catalog & ventures endpoints
│       │   └── orders.service.ts  # Orders CRUD + cascade actions
│       ├── metro.config.js      # Metro + NativeWind v5 (withNativewind)
│       ├── postcss.config.mjs   # @tailwindcss/postcss
│       ├── src/global.css       # Tailwind v4 imports + @theme tokens
│       ├── app.json             # Expo config
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                  # Shared code between backend and mobile
│   │   ├── src/
│   │   │   ├── types/           # TypeScript interfaces (Order, Venture, User, etc.)
│   │   │   ├── validators/      # Zod schemas (OrderCreateSchema, etc.)
│   │   │   ├── constants/       # Status machine, enums, error codes
│   │   │   └── i18n/            # Translation helper with fallback
│   │   └── package.json         # name: "@repo/shared"
│   │
│   └── ui/                      # Design system (consumed by mobile only)
│       ├── src/
│       │   ├── tw/              # CSS-wrapped components (useCssElement)
│       │   │   ├── index.tsx    # View, Text, Pressable, ScrollView, TextInput
│       │   │   ├── image.tsx    # expo-image wrapper with CSS support
│       │   │   └── animated.tsx # Animated component wrappers
│       │   └── tokens/          # Colors, typography, spacing (exported for global.css)
│       └── package.json         # name: "@repo/ui"
│
├── package.json                 # Bun workspaces root
├── tsconfig.base.json           # Shared TypeScript config
├── bunfig.toml                  # Bun configuration
├── docker-compose.yml           # PostgreSQL (local dev). Redis added POST-MVP for job queues.
└── .env.example
```

**Dependency flow:**

```
apps/backend ──imports──► packages/shared (types, validators)
apps/mobile  ──imports──► packages/shared (types, validators)
apps/mobile  ──imports──► packages/ui     (CSS-wrapped components, tokens)
```

> **Key rule:** Types and validation schemas are defined ONCE in `@repo/shared` and consumed by both apps. This guarantees end-to-end type safety: if a field changes in the backend schema, TypeScript will flag mismatches in the mobile app at compile time.

#### 4.0.2 Architecture Dependency Graph

```mermaid
graph TD
    A["📦 Monorepo Setup<br/>Bun Workspaces"] --> B["🔧 Shared Package<br/>Types + Validators + Constants"]
    A --> C["🗄️ DB Schema<br/>Drizzle + Migrations"]
    
    B --> D["🔐 Auth System<br/>Tourist + Entrepreneur"]
    C --> D
    
    B --> E["📋 Catalog & Ventures<br/>Public API"]
    C --> E
    
    D --> F["🛒 Orders API<br/>CRUD + Validations"]
    E --> F
    
    F --> G["⚡ Cascade Engine<br/>Core Algorithm"]
    C --> G
    
    G --> H["🔔 Push Notifications<br/>Expo Push"]
    
    D --> I["📱 Mobile - Tourist Flow<br/>Welcome + Catalog + Orders"]
    E --> I
    F --> I
    
    D --> J["📱 Mobile - Entrepreneur Flow<br/>Login + Dashboard + Calendar"]
    F --> J
    G --> J
    H --> J
    
    G --> K["⏰ Timeout Processor<br/>setInterval - MVP"]
    
    B --> L["🌱 Seed Scripts<br/>CLI Data Loading"]
    C --> L
```

#### 4.0.3 AI Agent Skills (Development Tooling)

The following agent skills are installed to enforce patterns and best practices during development. These are NOT runtime dependencies — they guide the AI coding assistant.

| Skill | Purpose | Applies To |
|-------|---------|------------|
| `drizzle-orm` | Schema patterns, relations, transactions, migration workflow | Backend DB layer |
| `hono` | Routing, middleware (jwt, cors, zValidator), RPC client, `app.request()` testing | Backend API layer |
| `expo-tailwind-setup` | NativeWind v5 + TW v4 + `react-native-css` wrapper setup | Mobile styling |
| `expo-deployment` | EAS Build, Submit, Workflows for CI/CD | DevOps |
| `expo-dev-client` | Development builds for TestFlight (only when custom native code needed) | DevOps |
| `frontend-design` | Bold aesthetic direction — NO generic AI aesthetics | Mobile UI design |
| `vercel-react-native-skills` | 38 RN best practices: FlashList, native navigators, Pressable, GPU animations | Mobile performance |
| `web-design-guidelines` | UI audit against Vercel Web Interface Guidelines (a11y, usability) | Mobile QA |

### 4.1 Security Requirements

*   **Authentication - Tourist (No Login):**
    *   No traditional login — token generated on first visit
    *   Browser fingerprint binds session to browser instance
    *   Access token: 1 hour expiry
    *   Refresh token: 30 days, opaque

*   **Authentication - Entrepreneur/Admin (Password Login):**
    *   JWT-based authentication with email/password
    *   Tokens stored in httpOnly cookies (web) or secure storage (mobile)
    *   Password hashed with bcrypt or argon2 (cost factor 10+)

*   **Tourist Device Binding & Security **[MVP]****

> **Note:** Tourists access via **Web** (React Native Expo web), NOT a native app. This section applies ONLY to tourists.

> **MVP Implementation:**

| Layer | Protection | Implementation |
|-------|------------|----------------|
| **Browser Fingerprint** | Tie tokens to browser instance | JWT contains `device_fingerprint` (User-Agent + Screen + Timezone) |
| **Refresh Token** | 30-day opaque token | Stored in localStorage, sent on refresh requests |

**Token Structure (MVP - Web):**

```typescript
// Access Token (JWT) - 1 hour
{
  "sub": "user_id",
  "device_fingerprint": "sha256(browser_fingerprint)",
  "type": "access",
  "exp": 1234567890,
  "iat": 1234564290
}

// Refresh Token - Opaque, 30 days
{
  "id": "uuid",
  "user_id": "uuid",
  "device_fingerprint": "sha256(...)",
  "expires_at": "2024-02-01T00:00:00Z",
  "is_revoked": false
}
```

**Browser Fingerprint Generation (MVP):**

```typescript
function generateBrowserFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ];
  return sha256(components.join('|'));
}
```

### 4.1.2. Refresh Token Rotation for Password Login **[POST-MVP]**

> **Problem:** If a refresh token is stolen (Entrepreneur/Admin login), attacker can use it indefinitely until expiration.

> **Applies to:** Entrepreneur and Admin authentication (password-based login).

**Solution: Single-Use Refresh Tokens**

Each refresh request generates a new token, invalidating the old one:

```
1. Client sends: { refresh_token: "uuid" }
2. Server validates and generates NEW token
3. Old token is marked as "rotated" (one-time use only)
4. Returns: { new_access_token, new_refresh_token }
```

**Token Structure (POST-MVP):**

```typescript
// Refresh Token - Single-use
{
  "id": "uuid",
  "user_id": "uuid",
  "device_fingerprint": "sha256(...)",
  "hashed_token": "bcrypt_hash",
  "expires_at": "2024-02-01T00:00:00Z",
  "rotated_at": null,
  "is_revoked": false
}
```

**Refresh Token Rotation Flow:**

```
1. Client sends: { refresh_token: "uuid" }
2. Server validates and generates NEW token
3. Old token is marked as "rotated" (one-time use only)
4. Returns: { new_access_token, new_refresh_token }
```

**Revocation Endpoint (POST-MVP):**

```
POST /auth/tourist/revoke-all
Request:
{
  "user_id": "uuid (required)"
}

Response (200):
{
  "message": "All sessions revoked successfully",
  "revoked_count": 3
}
```

**Password Security:**
    *   Global: 100 requests/minute per IP
    *   Order creation: 10 orders/minute per device token
    *   Auth endpoints: 5 attempts/minute per IP
*   **Account Lockout:** After 5 failed login attempts, lock account for 15 minutes.
*   **Input Validation:** All inputs sanitized. SQL injection prevented via parameterized queries (Knex/Prisma). XSS prevented via output encoding.
*   **API Security:** All endpoints require authentication except: `POST /auth/login`, `POST /auth/tourist/create`, `POST /auth/tourist/refresh`, `POST /auth/tourist/revoke`, `POST /orders` (tourist), `GET /catalog`, `GET /ventures`.

### 4.2 API Design

All endpoints follow RESTful conventions. Base URL: `https://api.elimpenetrable.org/v1`

> **MVP:** Only Tourist + Entrepreneur endpoints (4.2.1 - 4.2.3). Admin endpoints (4.2.4) are **[POST-MVP]**.

#### 4.2.1 Public Endpoints (No Authentication Required) **[MVP]**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/tourist/create` | Create tourist identity with alias |
| POST | `/auth/tourist/refresh` | Refresh tourist JWT token |
| POST | `/auth/tourist/revoke` | Revoke tourist JWT token (logout/lost device) |
| GET | `/catalog` | Get all catalog items for a project |
| GET | `/ventures` | List ventures (businesses) for a project |

**POST /auth/tourist/create**
```json
Request:
{
  "alias": "string (required, 1-50 chars)",
  "first_name": "string (optional, max 100)",
  "last_name": "string (optional, max 100)",
  "whatsapp": "string (optional, e.g. +54911...)",
  "project_id": "integer (required, from QR code)",
  "device_fingerprint": "string (required, browser fingerprint)",
  "push_token": "string (optional, for push notifications)"
}

Response (201):
{
  "user_id": "uuid",
  "access_token": "jwt (1 hour)",
  "refresh_token": "uuid (opaque, 30 days)",
  "expires_in": 3600
}
```

**POST /auth/tourist/refresh**
```json
Request:
{
  "refresh_token": "uuid (opaque token)",
  "device_fingerprint": "string (browser fingerprint)"
}

Response (200):
{
  "access_token": "jwt (new, 1 hour)",
  "refresh_token": "uuid (new, rotated)",
  "expires_in": 3600
}
```

**POST /auth/tourist/revoke**
```json
Request:
{
  "refresh_token": "uuid (optional, specific token to revoke)",
  "device_fingerprint": "string (optional, revoke all tokens for this device)"
}

Response (200):
{
  "message": "Token(s) revoked successfully"
}
```

> **Note:** Use this endpoint when tourist loses device or wants to logout. Can revoke by refresh_token (specific) or device_fingerprint (all tokens for that device). This replaces the 7-day JWT approach.

**GET /catalog**
```json
Query Parameters:
- project_id (required): integer "Filter by project (Impenetrable Chaco, etc.)"

Headers:
- Accept-Language: "es" or "en" (optional, defaults to project default)

Response (200):
{
  "items": [
    {
      "id": 1,
      "catalog_type": "Gastronomy",
      "name": "Guiso",
      "description": "Traditional stew",
      "price": 15.00,
      "image_url": "https://...",
      "max_participants": null
    }
  ]
}
```

**GET /ventures**
```json
Query Parameters:
- project_id (required): integer "Filter by project"
- catalog_type_id (optional): integer "Filter by type (Gastronomy, Guide, etc.)"

Response (200):
{
  "ventures": [
    {
      "id": 1,
      "name": "Parador Don Esteban",
      "description": "Traditional food by the river",
      "catalog_type": "Gastronomy",
      "address": "Ruta 40 km 1234",
      "image_url": "https://..."
    }
  ]
}
```

#### 4.2.2 Tourist Endpoints (Auth Required) **[MVP]**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create a new order |
| GET | `/orders` | Get tourist's orders |
| GET | `/orders/:id` | Get order details |
| DELETE | `/orders/:id` | Cancel order (only if SEARCHING) |
| PUT | `/profile` | Update tourist profile |

**POST /orders**
```json
Headers:
- Idempotency-Key: "uuid (required, unique per request)"

Request:
{
  "service_date": "string (required, YYYY-MM-DD)",
  "time_of_day_id": "integer (required)",
  "guest_count": "integer (required, 1-100)",
  "catalog_item_id": "integer (required)",
  "quantity": "integer (required, min 1)",
  "notify_whatsapp": "boolean (optional, default: false)"
}

Response (201):
{
  "order_id": 123,
  "status": "SEARCHING",
  "created_at": "timestamp"
}
```

**GET /orders**
```json
Query Parameters:
- status: "SEARCHING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "EXPIRED" (optional)
- service_date: "YYYY-MM-DD" (optional)

Response (200):
{
  "orders": [
    {
      "id": 123,
      "service_date": "2024-01-15",
      "time_of_day_id": 1,
      "guest_count": 4,
      "status": "SEARCHING",
      "items": [...],
      "created_at": "timestamp"
    }
  ]
}
```

**GET /orders/:id**
```json
Response (200) - Tourist View:
{
  "order": {
    "id": 123,
    "service_date": "2024-01-15",
    "time_of_day_id": 1,
    "guest_count": 4,
    "status": "CONFIRMED",
    "confirmed_venture": "Parador Don Esteban",
    "created_at": "timestamp"
  },
  "item": {
    "catalog_item_id": 1,
    "name": "Guiso",
    "quantity": 2,
    "price": 15.00
  },
  "cascade_summary": {
    "total_attempts": 2,
    "status": "CONFIRMED"
  }
}

Response (200) - Entrepreneur/Admin View:
{
  "order": { ... },
  "item": { ... },
  "cascade_history": [
    { "venture": "Parador A", "status": "REJECTED", "reason": null },
    { "venture": "Parador B", "status": "ACCEPTED", "reason": null }
  ]
}
```

> **Privacy Note:** Tourist-facing responses only show `cascade_summary` (attempt count). Full `cascade_history` is only exposed to the confirmed venture owner and Admins to protect the fairness rotation system from being gamed.

#### 4.2.3 Entrepreneur Endpoints (Auth Required) **[MVP]**

> **Note:** Each entrepreneur can manage ONE OR MORE ventures. Cascade iterates through Ventures.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/entrepreneur/me` | Get my details + linked venture |
| GET | `/venture/me/items` | Get catalog items for my venture with pause status |
| PUT | `/venture/me/items/:item_id/pause` | Toggle individual pause for item |
| PUT | `/venture/me/pause` | Toggle general pause (business full/closed) |
| GET | `/orders/pending` | Get pending orders for my venture |
| POST | `/orders/:id/accept` | Accept an order (only if OFFER_PENDING and venture matches current offer) |
| POST | `/orders/:id/reject` | Reject an order (only if OFFER_PENDING and venture matches current offer) |
| POST | `/orders/:id/complete` | Mark order as completed - dish prepared/served (only if CONFIRMED) |
| POST | `/orders/:id/no-show` | Mark tourist as no-show - did not arrive (only if CONFIRMED) |
| POST | `/orders/:id/cancel` | Cancel confirmed order (only if CONFIRMED, restarts cascade) |
| GET | `/calendar` | Get confirmed orders by date range |
| PUT | `/profile` | Update entrepreneur profile |

**GET /orders/pending**
```json
Response (200):
{
  "assignments": [
    {
      "order_id": 123,
      "venture_id": 1,
      "venture_name": "Parador Don Esteban",
      "service_date": "2024-01-15",
      "time_of_day_id": 1,
      "guest_count": 4,
      "items": [
        { "name": "Guiso", "quantity": 2 }
      ],
      "customer_alias": "Gomez Family",
      "deadline": "timestamp",
      "remaining_minutes": 25
    }
  ]
}
```

**POST /orders/:id/accept**
```json
Response (200):
{
  "order_id": 123,
  "status": "CONFIRMED",
  "confirmed_venture_id": 1
}
```

**POST /orders/:id/reject**
```json
Response (200):
{
  "order_id": 123,
  "status": "REJECTED",
  "next_venture_triggered": true
}
```

**POST /orders/:id/complete**
```json
Response (200):
{
  "order_id": 123,
  "status": "COMPLETED",
  "completed_at": "2024-01-15T13:30:00Z"
}
```

> **Note:** Only available when order status is `CONFIRMED` and the entrepreneur's venture is the `confirmed_venture`. Marks the dish as prepared/served. This triggers `ORDER_COMPLETED` notification to tourist.

**Error Responses:**
| Scenario | HTTP Status | Message |
|----------|-------------|---------|
| Order already COMPLETED | 409 Conflict | "Este pedido ya fue completado" |
| Order not CONFIRMED | 400 Bad Request | "Solo se pueden completar pedidos confirmados" |
| Venture is not the confirmed one | 403 Forbidden | "No tenés autorización para completar este pedido" |

**POST /orders/:id/no-show**
```json
Response (200):
{
  "order_id": 123,
  "status": "NO_SHOW"
}
```

> **Note:** Only available when order status is `CONFIRMED` and the entrepreneur's venture is the `confirmed_venture`. Marks tourist as no-show (did not arrive).

**POST /orders/:id/cancel**
```json
Request:
{
  "reason": "string (required, max 500 chars)"
}

Response (200):
{
  "order_id": 123,
  "status": "SEARCHING",
  "cascade_restarted": true,
  "message": "Order returned to cascade queue"
}
```

> **Note:** Only available when order status is `CONFIRMED` and the entrepreneur's venture is the `confirmed_venture`. When cancelled, the order restarts the cascade from the next venture (not from the beginning).

**GET /calendar**
```json
Query Parameters:
- start_date: "YYYY-MM-DD" (required)
- end_date: "YYYY-MM-DD" (required)

Response (200):
{
  "days": [
    {
      "date": "2024-01-15",
      "time_slots": [
        {
          "time_of_day_id": 1,
          "orders": [
            {
              "order_id": 123,
              "customer_alias": "Gomez Family",
              "guest_count": 4,
              "items": ["Guiso x2"],
              "status": "CONFIRMED"
            }
          ],
          "occupied_seats": 12,
          "max_capacity": 20
        }
      ]
    }
  ]
}
```

**GET /entrepreneur/me**
```
Response (200):
{
  "id": 1,
  "full_name": "Juan Perez",
  "name": "Parador Don Esteban",
  "address": "Calle Principal 123",
  "whatsapp_contact": "+54911...",
  "max_capacity": 20,
  "opening_hours": {"mon": "08:00-20:00", "tue": "08:00-20:00"},
  "cascade_order": 1,
  "is_paused": false,
  "is_active": true
}
```

**PUT /entrepreneur/me/pause**
```
Request:
{ "is_paused": true }

Response (200):
{
  "id": 1,
  "is_paused": true
}
```

**GET /entrepreneur/me/items**
```
Response (200):
{
  "items": [
    {
      "catalog_item_id": 1,
      "name": "Guiso",
      "price": 15.00,
      "individual_pause": false
    },
    {
      "catalog_item_id": 2,
      "name": "Empanadas",
      "price": 12.00,
      "individual_pause": true
    }
  ]
}
```

#### 4.2.4 Admin Endpoints (Auth Required + ADMIN role) **[POST-MVP]**

> **Note:** Cascade iterates through Ventures (sorted by cascade_order). Each Venture has a Catalog_Type.

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Catalog Types** | | |
| GET | `/admin/catalog-types` | List catalog types (Gastronomy, Guide, etc.) |
| POST | `/admin/catalog-types` | Create catalog type |
| PUT | `/admin/catalog-types/:id` | Update catalog type |
| DELETE | `/admin/catalog-types/:id` | Delete catalog type |
| **Catalog Items** | | |
| GET | `/admin/catalog` | List master catalog items (by type/project) |
| POST | `/admin/catalog` | Create catalog item |
| PUT | `/admin/catalog/:id` | Update catalog item |
| PUT | `/admin/catalog/:id/pause` | Toggle global pause (all ventures) |
| DELETE | `/admin/catalog/:id` | Delete catalog item |
| **Ventures** | | |
| GET | `/admin/ventures` | List all ventures |
| POST | `/admin/ventures` | Create new venture |
| GET | `/admin/ventures/:id` | Get venture details |
| PUT | `/admin/ventures/:id` | Update venture (capacity, hours, etc.) |
| PUT | `/admin/ventures/:id/enable` | Enable/disable venture |
| PUT | `/admin/ventures/:id/pause` | Toggle venture's general pause |
| PUT | `/admin/ventures/reorder` | Reorder cascade (cascade_order on ventures) |
| **Entrepreneurs** | | |
| GET | `/admin/entrepreneurs` | List all entrepreneurs |
| POST | `/admin/entrepreneurs` | Create new entrepreneur (link to venture) |
| GET | `/admin/entrepreneurs/:id` | Get entrepreneur details |
| PUT | `/admin/entrepreneurs/:id` | Update entrepreneur |
| PUT | `/admin/entrepreneurs/:id/venture` | Link/unlink entrepreneur to venture |
| **KPIs & Projects** | | |
| GET | `/admin/kpis` | Get KPIs dashboard data |
| GET | `/admin/projects` | List projects |
| PUT | `/admin/projects/:id` | Update project settings |

**GET /admin/kpis**
```json
Query Parameters:
- project_id: "integer (optional)"
- start_date: "YYYY-MM-DD (required)"
- end_date: "YYYY-MM-DD (required)"

Response (200):
{
  "summary": {
    "total_orders": 156,
    "acceptance_rate": 0.89,
    "timeout_rate": 0.08,
    "completed_rate": 0.85,
    "no_show_rate": 0.03
  },
  "by_day": [
    { "date": "2024-01-15", "orders": 12, "acceptance_rate": 0.92 },
    { "date": "2024-01-14", "orders": 8, "acceptance_rate": 0.87 }
  ],
  "by_venture": [
    { "venture_id": 1, "name": "Parador A", "orders": 45, "acceptance_rate": 0.95 },
    { "venture_id": 2, "name": "Parador B", "orders": 38, "acceptance_rate": 0.82 }
  ]
}
```

### 4.3 Real-Time Notifications

> **MVP:** Push Notifications only (4.3.1). WhatsApp (4.3.3) and Polling fallback (4.3.2) are **[POST-MVP]**.

#### 4.3.1 Push Notifications (Primary) **[MVP]**

**Provider:** Expo Push Notifications (no Firebase configuration required)

**Flow:**
1. App registers with Expo Push → obtains `ExponentPushToken[xxx]`
2. Push token stored in `Notification_Preference` / `Tourist_Device.push_token`
3. When event occurs → backend sends to Expo Push API (`https://exp.host/--/api/v2/push/send`) → Expo delivers to device

**Device Registration Endpoint:**
```
POST /notifications/register
Request: { "push_token": "ExponentPushToken[xxx]" }
Response: { "success": true }
```

**Events that trigger Push Notifications:**

| Event | Recipient | Channel | Content |
|-------|-----------|---------|---------|
| `ORDER_RECEIVED` | Entrepreneur | Push | "Nuevo pedido: X personas, [items]" |
| `ORDER_CANCELLED` | Entrepreneur | Push | "El cliente canceló el pedido #X" |
| `ORDER_CONFIRMED` | Tourist | Push + WhatsApp | "Tu reserva está confirmada para [fecha] en [venture]" |
| `ORDER_COMPLETED` | Tourist | Push | "Tu experiencia en [venture] fue completada. ¡Gracias por visitar!" |
| `ORDER_NO_SHOW` | Tourist | Push | "El emprendimiento reportó que no te presentaste. ¿Qué pasó?" |
| `ORDER_EXPIRED` | Tourist | Push | "Lo sentimos, no hay disponibilidad para tu solicitud" |
| `MORNING_REMINDER` | Entrepreneur | Push + WhatsApp | "Hoy tienes X pedidos confirmados" |

#### 4.3.2 Polling (Fallback) **[POST-MVP]**

For devices without push token or when push fails, the app polls periodically.

**Polling Endpoint:**
```
GET /orders/pending?last_check=timestamp
Response: { "has_new": true/false, "orders": [...] }
```

**Polling Strategy:**

| Scenario | Interval | Trigger |
|----------|----------|---------|
| App in foreground | 30 seconds | Automatic |
| App in background | 5 minutes | Background fetch |
| On app resume | Immediate | Event listener |

**Implementation:**
```typescript
// Frontend polling
const startPolling = () => {
  setInterval(async () => {
    const response = await fetch('/orders/pending');
    const { orders } = await response.json();
    if (orders.length > 0) showLocalNotification(orders);
  }, 30000);
};
```

#### 4.3.3 WhatsApp Notifications **[POST-MVP]**

For high-priority notifications to tourists (confirmation, expiration).

**Provider:** WhatsApp Business API (Meta)

**Flow:**
1. Tourist provides WhatsApp number in profile
2. Backend sends via WhatsApp Business API
3. Message ID stored in `Notification.external_id`

**Endpoint:**
```
POST /notifications/whatsapp
Request: { "to": "+54911...", "template": "order_confirmed", "params": {...} }
Response: { "message_id": "wamid.xxx" }
```

#### 4.3.4 Notification Preference

Users can configure their notification preferences:

```
PUT /notifications/preferences
Request: {
  "push_enabled": true,
  "whatsapp_enabled": true,
  "email_enabled": false
}
Response: { "success": true }
```

### 4.4 Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "guest_count", "message": "Must be between 1 and 100" }
    ]
  }
}
```

**Common Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## 4.5 Infrastructure & DevOps

### 4.5.1 Docker Configuration

The application runs in Docker containers for consistency across environments.

**docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@postgres:5432/db
    depends_on:
      - postgres
    volumes:
      - ./src:/app/src

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis: Added in POST-MVP for BullMQ job queues, idempotency cache,
  # and distributed rate limiting. Not required for MVP.
  # redis:
  #   image: redis:7-alpine
  #   volumes:
  #     - redis_data:/data

volumes:
  postgres_data:
```

**Dockerfile (Production)**
```dockerfile
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "dist/main.js"]
```

### 4.5.2 Database Migrations

**Tool:** Drizzle Kit (`drizzle-kit`)

**Migration Files Structure:**
```
drizzle/
  0001_create_enums.sql
  0002_create_project.sql
  0003_create_users.sql
  ...
```

**Commands:**
```bash
# Generate migrations from schema changes
bun run drizzle-kit generate

# Apply migrations to database
bun run drizzle-kit migrate

# Open Drizzle Studio (visual DB browser)
bun run drizzle-kit studio
```

**Seeding (MVP — CLI Seed Script):**

> **MVP Scope:** Since the Admin Panel is [POST-MVP], all initial data is loaded via CLI seed scripts. This covers: Projects, Catalog Types, Catalog Items, Ventures, Entrepreneurs, and Venture Schedules.

```bash
# Seed database with Impenetrable project data
bun run db:seed

# Seed with custom data file
bun run db:seed --file seeds/impenetrable.ts
```

**Seed Data Structure (TypeScript):**
```typescript
// seeds/impenetrable.ts
export const seedData = {
  project: {
    name: 'Impenetrable',
    default_language: 'es',
    supported_languages: ['es'],
    cascade_timeout_minutes: 30,
    max_cascade_attempts: 10,
  },
  catalogTypes: [
    { name: 'Gastronomy', description: 'Local food experiences' },
    { name: 'Guide Services', description: 'Guided tours and activities' },
  ],
  catalogItems: [
    { type: 'Gastronomy', name_i18n: { es: 'Guiso' }, price: 15.00 },
    { type: 'Gastronomy', name_i18n: { es: 'Empanadas' }, price: 12.00 },
    // ... more items
  ],
  ventures: [
    {
      name: 'Parador Don Esteban',
      catalogType: 'Gastronomy',
      max_capacity: 20,
      cascade_order: 1,
      schedule: { mon: '08:00-20:00', tue: '08:00-20:00', /* ... */ },
    },
    // ... more ventures
  ],
  entrepreneurs: [
    {
      email: 'juan@example.com',
      password: 'temp-password',  // Changed on first login
      full_name: 'Juan Perez',
      venture: 'Parador Don Esteban',
    },
    // ... more entrepreneurs
  ],
};
```

### 4.5.3 Environments

| Environment | Purpose | URL | Database |
|------------|---------|-----|----------|
| **development** | Local dev | http://localhost:3000 | Local Postgres |
| **staging** | Pre-production testing | https://staging.api.elimpenetrable.org | Staging DB |
| **production** | Live production | https://api.elimpenetrable.org | Production DB |

**Environment Variables:**

| Variable | development | staging | production |
|----------|-------------|---------|------------|
| `NODE_ENV` | development | staging | production |
| `DATABASE_URL` | localhost | staging-db | production-db |
| `REDIS_URL` | *(POST-MVP)* | staging-redis | production-redis |
| `JWT_SECRET` | dev-secret | staging-secret | (from secrets manager) |
| `WHATSAPP_API_KEY` | *(POST-MVP)* | staging-key | (from secrets manager) |
| `EXPO_ACCESS_TOKEN` | test-token | staging-token | (from secrets manager) |

### 4.5.4 CI/CD Pipeline (GitHub Actions)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun test
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run build
      - run: docker build -t app:${{ github.sha }} .

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploying to staging..."
      # Add your deployment steps here

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploying to production..."
      # Add your deployment steps here
```

### 4.5.5 Monitoring & Logging

**Logging:**
- Use `pino` or `winston` for structured JSON logging
- Log levels: ERROR, WARN, INFO, DEBUG

**Monitoring:**
- **Metrics:** Prometheus + Grafana
- **Errors:** Sentry or Datadog
- **Uptime:** UptimeRobot or Grafana synthetic checks

**Key Metrics to Track:**
| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `orders_per_minute` | Order creation rate | > 100/min |
| `cascade_avg_attempts` | Average cascade attempts | > 8 |
| `response_time_p95` | API response time (95th percentile) | > 500ms |
| `error_rate` | Percentage of 5xx errors | > 1% |
| `db_connections` | Active PostgreSQL connections | > 80% of max |

### 4.5.6 Backup & Recovery

**Database Backups:**
- **Frequency:** Daily at 3am UTC
- **Retention:** 30 days
- **Storage:** AWS S3 or equivalent

**Backup Command:**
```bash
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Recovery Procedure:**
1. Stop application
2. Drop existing database
3. Restore from latest backup: `gunzip < backup.sql.gz | psql`
4. Verify data integrity
5. Restart application

### 4.5.7 Security

| Practice | Implementation |
|----------|----------------|
| Secrets | Use environment variables or secrets manager (AWS Secrets Manager, Doppler) |
| HTTPS | TLS 1.3 required for all environments |
| CORS | Whitelist only allowed domains |
| Rate Limiting | Applied at API Gateway level |
| SQL Injection | Parameterized queries only |
| XSS | Output encoding + CSP headers |

---

## 4.6 Testing Strategy **[MVP]**

> **MVP:** Only Unit Tests for Cascade Engine required. Integration/E2E are **[POST-MVP]**.

### 4.6.1 Testing Pyramid

```
        /\
       /  \
      / E2E \         ← Few, slow, expensive
     /--------\
    /Integration\    ← Medium, test component interaction
   /--------------\
  /    Unit        \ ← Many, fast, cheap
 /__________________\
```

### 4.6.2 Unit Tests

**Framework:** Bun Test (Vitest-compatible)

**Coverage Target:** 80% minimum

**What to Test:**

| Module | Test Cases |
|--------|------------|
| **CascadeEngine** | Skip logic for all 8 skip reasons, capacity calculation, max attempts |
| **i18n** | Fallback strategy, missing language handling |
| **Auth** | Token refresh, lockout logic, JWT validation |
| **Validation** | All validation rules from Section 3.3 |
| **Order** | Status transitions, duplication prevention |

**Example:**
```typescript
describe('CascadeEngine', () => {
  describe('filterVenture', () => {
    it('skips when venture.is_active = false', () => {
      const venture = { is_active: false, ... };
      const result = filterVenture(venture, order);
      expect(result.skip).toBe(true);
      expect(result.reason).toBe('VENTURE_INACTIVE');
    });

    it('skips when general_pause = true', () => {
      const venture = { general_pause: true, ... };
      const result = filterVenture(venture, order);
      expect(result.skip).toBe(true);
      expect(result.reason).toBe('GENERAL_PAUSE');
    });

    it('skips when guest_count > max_capacity', () => {
      const venture = { max_capacity: 10, ... };
      const order = { guest_count: 15 };
      const result = filterVenture(venture, order);
      expect(result.skip).toBe(true);
      expect(result.reason).toBe('CAPACITY_EXCEEDED');
    });

    it('skips when outside opening_hours', () => {
      const venture = { opening_hours: { mon: '08:00-20:00' } };
      const order = { service_date: '2024-01-15', time_of_day_id: LUNCH }; // 12:00
      const result = filterVenture(venture, order);
      expect(result.skip).toBe(false);
    });
  });

  describe('cascadeLoop', () => {
    it('marks EXPIRED after max_attempts', async () => {
      const ventures = [...Array(10).keys()].map(i => ({ id: i, ... }));
      const result = await cascadeLoop(order, ventures, { max_attempts: 10 });
      expect(result.status).toBe('EXPIRED');
    });

    it('returns CONFIRMED on first accept', async () => {
      const ventures = [{ id: 1, ... }];
      const result = await cascadeLoop(order, ventures, {});
      expect(result.status).toBe('CONFIRMED');
    });
  });
});
```

### 4.6.3 Integration Tests

**Framework:** Supertest (API) + Test Database

**What to Test:**

| Scenario | Description |
|----------|-------------|
| **Order Flow** | Tourist creates order → enters SEARCHING → venture accepts → becomes CONFIRMED |
| **Cascade Flow** | Order creates → skips paused ventures → reaches active venture → accepts |
| **Auth Flow** | Tourist creates identity → gets JWT → refreshes token → token invalidates old |
| **Notification Flow** | Order confirmed → notification created → sent via provider |

**Example:**
```typescript
describe('Order API', () => {
  it('creates order and triggers cascade', async () => {
    // Create order
    const orderRes = await request(app)
      .post('/orders')
      .send({ ... });
    
    expect(orderRes.status).toBe(201);
    expect(orderRes.body.status).toBe('SEARCHING');

    // Check cascade assignment created
    const assignment = await db.query(
      'SELECT * FROM cascade_assignment WHERE order_id = ?',
      [orderRes.body.order_id]
    );
    expect(assignment).toHaveLength(1);
    expect(assignment[0].offer_status).toBe('WAITING_FOR_RESPONSE');
  });

  it('accepts order and confirms', async () => {
    // Given: order in SEARCHING
    const order = await createOrder({ status: 'SEARCHING' });

    // When: entrepreneur accepts
    const acceptRes = await request(app)
      .post(`/orders/${order.id}/accept`)
      .set('Authorization', `Bearer ${entrepreneurToken}`);

    // Then: order is CONFIRMED
    expect(acceptRes.body.status).toBe('CONFIRMED');
    
    const updatedOrder = await getOrder(order.id);
    expect(updatedOrder.status).toBe('CONFIRMED');
  });
});
```

### 4.6.4 E2E Tests

**Framework:** Playwright (recommended)

**Scenarios:**

| Scenario | Steps |
|----------|-------|
| **Tourist: Create Order** | 1. Open app → 2. Enter alias → 3. Browse catalog → 4. Select item → 5. Choose date/time → 6. Submit → 7. See "SEARCHING" status |
| **Entrepreneur: Accept Order** | 1. Login → 2. See pending order → 3. Tap Accept → 4. See confirmation |
| **Full Cascade** | 1. Tourist creates order → 2. Venture A rejects → 3. Venture B accepts → 4. Tourist sees CONFIRMED |

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('tourist creates order', async ({ page }) => {
  await page.goto('/');
  
  // Welcome screen
  await page.fill('[name=alias]', 'Test Family');
  await page.click('button:has-text("Start")');
  
  // Catalog
  await expect(page.locator('text=Service Catalog')).toBeVisible();
  await page.click('text=Guiso');
  
  // Order modal
  await page.selectOption('[name=time_of_day]', 'LUNCH');
  await page.fill('[name=guest_count]', '4');
  await page.click('button:has-text("Confirm")');
  
  // Orders screen
  await expect(page.locator('text=SEARCHING')).toBeVisible();
});
```

### 4.6.5 Load Testing

**Tool:** k6 or Artillery

**Scenarios:**

| Scenario | Target |
|----------|--------|
| **Order Creation** | 100 orders/minute |
| **Cascade Engine** | 50 ventures, 10 attempts each |
| **Concurrent Accepts** | 10 ventures accepting simultaneously |
| **Calendar View** | 1000 confirmed orders |

**Example (k6):**
```javascript
import http from 'k6/http';

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const order = {
    service_date: '2024-01-15',
    time_of_day_id: 1,
    guest_count: 4,
    items: [
      { "catalog_item_id": 1, "quantity": 2 }
    ],
  };

  http.post('http://localhost:3000/v1/orders', 
    JSON.stringify(order),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
```

### 4.6.6 Test Database Strategy

**Development:**
- Use `testcontainers` for isolated PostgreSQL
- Each test gets clean database state

**CI/CD:**
- Use ephemeral database per build
- Run migrations before tests
- Seed with minimal data

```typescript
// Test setup
beforeAll(async () => {
  const container = await new PostgreSqlContainer().start();
  await runMigrations(container.getConnectionUrl());
});

afterAll(async () => {
  await container.stop();
});

beforeEach(async () => {
  await truncateAllTables();
  await seedTestData();
});
```

### 4.6.7 Test Coverage Requirements

| Type | Minimum Coverage | Tools |
|------|-----------------|-------|
| Unit | 80% | Bun Test + coverage report |
| Integration | All API endpoints | Supertest |
| E2E | Critical paths only | Playwright |
| Load | Key endpoints | k6 |

### 4.6.8 Running Tests

```bash
# Unit tests (fast, runs on every commit)
bun test

# With coverage
bun test --coverage
```

---

## 5. Data Structure (Multi-Project ERD) **[MVP - Partial]**

> **MVP:** Only single Project (Impenetrable). Multi-project support is **[POST-MVP]**.

Below is the relational data model prepared for AI generation using PostgreSQL. Operational states are kept as Enums to protect the cascading engine's strict logic, while expansible categories use parametric tables [6].

```mermaid
erDiagram
    %% ==========================================
    %% TOP LAYER: MULTI-TENANT (PROJECTS)
    %% ==========================================
    Project {
        int id PK
        string name "e.g. 'Impenetrable', 'Patagonia'"
        string default_language "Default language code, e.g. 'es'"
        jsonb supported_languages "Array of supported language codes, e.g. ['es', 'en']"
        int cascade_timeout_minutes "Default: 30. Timeout per attempt before cascading to next venture"
        int max_cascade_attempts "Default: 10. Maximum times the engine will try before marking order as EXPIRED"
        boolean is_active
    }

    %% ==========================================
    %% SECURITY & ACCESS LAYER
    %% ==========================================
    User_Session {
        uuid id PK
        int user_id FK "References User"
        string access_token_hash "Hash of JWT access token"
        string refresh_token_hash "Hash of refresh token"
        timestamp access_token_expires_at
        timestamp refresh_token_expires_at
        timestamp created_at
        timestamp last_used_at
        boolean is_revoked "Default FALSE"
    }

    Tourist_Device {
        uuid id PK
        uuid user_id FK "Links to User"
        string device_fingerprint "Browser fingerprint (User-Agent + Screen + Timezone)"
        string refresh_token_hash "Opaque refresh token (not JWT)"
        string push_token "Optional push notification token"
        timestamp expires_at "When this refresh token expires"
        timestamp created_at
        timestamp last_used_at
    }

    %% ==========================================
    %% PARAMETRIC TABLES (Dictionaries)
    %% ==========================================
    Role_Type {
        int id PK
        string description "e.g. HOSTEL, GUIDE"
    }

    Time_Of_Day {
        int id PK
        string description "e.g. BREAKFAST, LUNCH, DINNER"
    }

    %% ==========================================
    %% MAIN ENTITIES (Business Core)
    %% ==========================================
    User {
        uuid id PK
        string alias "Nullable - tourists only"
        string email "Nullable - admin/entrepreneur only"
        string password_hash "bcrypt or argon2 - admin/entrepreneur only"
        string first_name "Nullable"
        string last_name "Nullable"
        string whatsapp "Nullable. For order notifications"
        enum user_type "TOURIST, ADMIN, ENTREPRENEUR"
        int failed_login_attempts "Default 0. Lock after 5 failed attempts"
        timestamp locked_until "Nullable. Lockout expiration time"
        timestamp last_login_at
        boolean is_active "Default TRUE"
        timestamp created_at
    }

    Catalog_Type {
        int id PK
        int project_id FK "Project this catalog type belongs to"
        string name "e.g. Gastronomy, Guide Services"
        string description "Optional description"
        boolean is_active "Whether this type is available"
    }

    Venture {
        int id PK
        int catalog_type_id FK "Determines which catalog items this venture can offer (inherits project from type)"
        string name "Business name (e.g. Parador Don Esteban)"
        string description "Optional business description"
        string address "Physical address"
        decimal latitude "Geolocation"
        decimal longitude "Geolocation"
        string image_url "Optional business photo"
        int role_type_id FK
        int cascade_order "Isolated rotation per project. Default: creation order (1, 2, 3...)"
        int max_capacity "Maximum number of guests per service (e.g. 20 seats)"
        boolean is_paused "General pause - venture cannot receive orders"
        boolean is_active "Enabled by admin"
    }

    Venture_Paused_Item {
        int venture_id PK,FK "References Venture"
        int catalog_item_id PK,FK "References Catalog_Item"
        timestamp paused_at "When the item was paused"
    }

    Venture_Schedule {
        int id PK
        int venture_id FK "References Venture"
        string day_of_week "mon, tue, wed, thu, fri, sat, sun"
        time open_time "Opening time (e.g., 08:00)"
        time close_time "Closing time (e.g., 20:00)"
        boolean is_active "Can be disabled per day"
    }

    Venture_Manager {
        int id PK
        int venture_id FK "Venture being managed"
        uuid user_id FK "Links to User (admin/entrepreneur)"
        string whatsapp_contact "Used for Morning Reminder"
        boolean is_active "Enabled by admin"
        timestamp created_at
    }

    Catalog_Item {
        int id PK
        int catalog_type_id FK "Catalog type this item belongs to (inherits project from type)"
        jsonb name_i18n "e.g. {'es':'Guiso','en':'Stew'}"
        jsonb description_i18n "Optional description (e.g. {'es':'Delicious stew'})"
        jsonb allergens_i18n "Allergen info (e.g. {'es':'Contiene gluten'})"
        jsonb ingredients_i18n "Ingredient list (e.g. {'es':'Carne, papas, cebolla'})"
        decimal price "Default price from master catalog"
        int max_participants "Maximum participants for activities (null for gastronomy)"
        string image_url "Optional: URL to dish/activity photo"
        boolean global_pause "Admin can pause item for ALL ventures"
    }

    %% ==========================================
    %% TRANSACTIONAL & CASCADING FLOW
    %% ==========================================
    Order {
        int id PK
        uuid user_id FK "Links to User (tourist)"
        int catalog_item_id FK "The requested item"
        int quantity "Number of items requested"
        decimal price_at_purchase "Price recorded at order time (historical)"
        int confirmed_venture_id FK "Nullable. Set when status becomes CONFIRMED"
        date service_date "Used for Calendar view"
        int time_of_day_id FK "Used for Calendar view"
        int guest_count 
        string notes "Special requests or dietary restrictions from tourist"
        enum global_status "SEARCHING, OFFER_PENDING, CONFIRMED, COMPLETED, NO_SHOW, CANCELLED, EXPIRED"
        enum cancel_reason "null, BY_TOURIST, BY_ENTREPRENEUR, NO_VENTURE_AVAILABLE, SYSTEM_ERROR"
        timestamp cancelled_at "Nullable. Set when status becomes CANCELLED or EXPIRED"
        timestamp completed_at "Nullable. Set when status becomes COMPLETED (explicit or auto)"
        timestamp confirmed_at "Nullable. Set when status becomes CONFIRMED"
        timestamp created_at
        
        %% Notification preferences for this order
        boolean notify_whatsapp "Whether to send WhatsApp notifications for this order"
    }

    Cascade_Assignment {
        int id PK
        int order_id FK
        int venture_id FK "Cascade iterates through ventures"
        int attempt_number
        enum offer_status "WAITING_FOR_RESPONSE, ACCEPTED, REJECTED, TIMEOUT, AUTO_REJECTED"
        enum skip_reason "null, GENERAL_PAUSE, INDIVIDUAL_PAUSE, CAPACITY_EXCEEDED, CLOSED_THAT_DAY, OUTSIDE_OPENING_HOURS, VENTURE_INACTIVE, NOT_OFFERED"
        timestamp offer_sent_at
        timestamp response_deadline 
        timestamp resolved_at
    }

    %% ==========================================
    %% NOTIFICATIONS
    %% ==========================================
    Notification {
        int id PK
        uuid user_id FK "Nullable. Links to User (any type: tourist, entrepreneur, admin)"
        int order_id FK "Nullable. Associated order"
        enum channel "PUSH, WHATSAPP, EMAIL, IN_APP"
        enum event_type "ORDER_RECEIVED, ORDER_CONFIRMED, ORDER_COMPLETED, ORDER_NO_SHOW, ORDER_EXPIRED, ORDER_CANCELLED, MORNING_REMINDER"
        jsonb payload "Message content and metadata"
        boolean is_sent default FALSE
        timestamp sent_at "Nullable. Set when notification is sent"
        string external_id "Nullable. Provider message ID (e.g. WhatsApp message ID)"
        timestamp created_at
    }

    Notification_Preference {
        int id PK
        uuid user_id FK "Links to User (any type)"
        int venture_id FK "Nullable. For venture-specific preferences"
        boolean push_enabled default TRUE
        boolean whatsapp_enabled default FALSE
        boolean email_enabled default FALSE
    }

    Idempotency_Key {
        varchar key PK "Client-provided unique key (UUID)"
        uuid user_id FK "User who made the request"
        int response_status "HTTP status code of original response"
        jsonb response_body "Cached response body"
        timestamp created_at
        timestamp expires_at "Key expires after 24 hours"
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================
    User ||--o{ User_Session : "has active sessions"
    User ||--o{ Idempotency_Key : "has idempotency keys"

    Role_Type ||--o{ Venture : "defines venture category"
    Time_Of_Day ||--o{ Order : "schedules order time"

    Project ||--o{ Catalog_Type : "has catalog types"

    Catalog_Type ||--o{ Catalog_Item : "contains items"
    Catalog_Type ||--o{ Venture : "defines venture type"

    Venture ||--o{ Cascade_Assignment : "receives offers (cascade iterates ventures)"
    Venture ||--o{ Order : "confirmed in"

    User ||--o{ Order : "places"
    User ||--o{ Notification : "receives"
    User ||--o{ Notification_Preference : "has"
    User ||--o{ Tourist_Device : "has devices"
    User ||--o{ Venture_Manager : "manages ventures"

    Venture ||--o{ Venture_Schedule : "has schedule"
    Venture ||--o{ Venture_Manager : "managed by"
    Venture ||--o{ Venture_Paused_Item : "has paused items"

    Order ||--o{ Cascade_Assignment : "processed by engine"
    Order ||--o{ Notification : "triggers"
```

--------------------------------------------------------------------------------
## 6. UI/UX Mockup Specifications (Google Stitch / Design Guidelines) **[MVP]**

> **MVP:** Tourist Flow (6.2) + Entrepreneur Flow (6.3). Admin Flow (6.4) is **[POST-MVP]**.
When generating UI components or screens, adhere strictly to the following constraints tailored for low-end Android devices and non-technical users.
6.1 Global Design Guidelines

    Visual & Accessible: Use high-contrast colors, extremely large buttons (wide touch areas), and highly legible typography. Use the colors of the Impenetrable Chaco: 
    Performance: The UI must be lightweight. Strictly avoid complex animations, heavy shadows, or overlapping elements that consume RAM on low-end phones.
    Navigation: Avoid complex hamburger menus or multi-step wizard flows. Keep actions flat and immediate.

### 6.2 Tourist Flow (Zero Friction Journey) **[MVP]**

    Navigation: Bottom tab bar with 3 large icons:
        - Home: Service Catalog (selected by default after first visit)
        - Orders: Orders Status
        - Settings: Profile & Preferences

    Screen 1: Welcome & Access:
        Spec: First-time access. Creates tourist identity with alias.
        UI Elements: 
         - A single required input field, prominent text input asking for an "Alias" (e.g., "Gomez Family").
         - Optional secondaries inputs fields:
             - Whatsapp number.
             - First name.
             - Last name.
         - A massive "Start" button.
         - Without bottom navigation bar (shown only after successful access).
        Notes: If device already has valid auth_token, skip directly to Home tab.
    Screen 2: Service Catalog (Home Tab):
        Spec: A simple list to request multiple activities or meals.
        UI Elements:
         - Visual cards for available dishes/activities. Hidden entirely if under an "Individual Pause" or "Global Pause".
         - Each card displays: name (translated), price, category icon.
         - When the user clicks on a card, a modal opens to:
             - Time of day: breakfast, lunch, snack, dinner
             - Quantity of people
             - A "Confirm" button
         - Pull-to-refresh to reload catalog
    Screen 3: Orders Status (Orders Tab):
        Spec: Interactive waiting screen while the cascading engine works on each order. Also shows historical orders.
        UI Elements:
         - Segmented control: "Active" | "History"
         - For each active order:
             - Order details (date, time of day, quantity of people, items)
             - Status badge: SEARCHING (yellow), CONFIRMED (green), EXPIRED (red)
             - Cancel button (only enabled when status = SEARCHING)
         - For each historical order:
             - Order details with final status
             - Status: COMPLETED (gray), CANCELLED (red), NO_SHOW (red)
    Screen 4: Settings (Settings Tab):
        Spec: Profile management and preferences for the tourist.
        UI Elements:
         - Profile section:
             - Alias (required, editable)
             - First name (optional, editable)
             - Last name (optional, editable)
             - WhatsApp (optional, editable)
         - Notification preferences:
             - Toggle: Enable WhatsApp notifications
         - Save button (prominent)
          - Danger zone:
              - "Clear my data" button (deletes User record)
              - "Logout" button (clears auth_token but keeps User)

### 6.3 Entrepreneur Flow (Operational Journey) **[MVP]**

> **Note:** Entrepreneur can manage ONE OR MORE Ventures. Multiple entrepreneurs can manage the same Venture.

    Navigation: Bottom tab bar with 3 large icons (simplified from 4):
        - Orders: Order Reception Dashboard (selected by default)
        - Calendar: Daily Agenda
        - Settings: My Venture (Business), Availability & Profile
        - Badge indicator on Orders tab when General Pause is active

    Screen 0: Login:
        Spec: Secure access for entrepreneurs and admins.
        UI Elements:
         - Email input field (keyboard type: email)
         - Password input field (with show/hide toggle)
         - "Remember me" checkbox
         - Large "Login" button
         - Error messages: "Invalid credentials" / "Account locked" / "Account disabled"

    Screen 1: Order Reception Dashboard:
        Spec: The main hub where the engine routes incoming requests to the business.
        UI Elements:
         - Two sections: "Pending" (awaiting response) and "Confirmed" (accepted, awaiting completion)
         - Pending orders: Alert cards featuring two huge, contrasting buttons: "Accept" and "Reject"
         - Confirmed orders: Cards with "Complete" button to mark dish as prepared/served
         - Each card displays:
             - Order items (dish/activity names)
             - Guest count (e.g., "4 people")
             - Service date and time of day (e.g., "Today - Lunch")
             - Customer alias
         - For pending orders: Visual countdown timer showing remaining time before timeout (30 min)
         - Sound/vibration notification on new order arrival
         - Empty state: "No pending orders" message when the queue is empty

    Screen 2: Daily Agenda / Calendar:
        Spec: Visual tool to organize the workday.
        UI Elements:
         - Weekly view with date pills at the top
         - Tap on a day to expand confirmed orders for that date
         - Orders grouped by time of day (Breakfast, Lunch, Snack, Dinner)
         - Each order shows: customer alias, guest count, items
         - Tap on confirmed order to reveal "Mark Complete" action
         - Visual occupation indicator (e.g., "12/20 seats filled")
         - Color coding: confirmed (green), completed (gray), no-show (red)

    Screen 3: My Venture & Settings:
        Spec: Single venture details, pause controls, and linked entrepreneur profile.
        UI Elements:
         - Venture card (single, read-only - managed by Admin):
             - Name, Address, Role, Capacity, Status badge, Catalog Type
         - General Pause: Large toggle switch for "Business Full/Closed"
         - Individual Pause: List of available items with toggles for "Out of Stock"
         - My Profile section (current logged in entrepreneur):
             - Full name (read-only)
             - WhatsApp contact (editable)
             - Email (read-only)
         - Logout button at the bottom

> **Note:** Creating Ventures and managing entrepreneurs is done by Admin in web interface.

### 6.4 Admin Impenetrable Flow (Management & Auditing) **[POST-MVP]**
This interface will be accessed primarily via Web (Desktop).

    Navigation: Left sidebar (collapsible) with menu items:
        - Dashboard: Monthly Reporting KPIs (selected by default)
        - Catalog Types: Manage types (Gastronomy, Guide Services)
        - Catalog Items: Master Catalog & Global Pause
        - Ventures: Venture Management
        - Entrepreneurs: Entrepreneur Management
        - Settings: Project Configuration
        - Logout

    Screen 0: Login:
        Spec: Secure access for admins.
        UI Elements:
         - Email input field (keyboard type: email)
         - Password input field (with show/hide toggle)
         - "Remember me" checkbox
         - Large "Login" button
         - Error messages: "Invalid credentials" / "Account disabled"

    Screen 1: Monthly Reporting Dashboard (KPIs):
        Spec: A bird's-eye view to audit the ecosystem without manual assignment intervention.
        UI Elements:
         - Date range picker: Today | This Week | This Month | Custom
         - Project filter dropdown
         - KPI Cards (top row):
             - Total Orders
             - Acceptance Rate (%)
             - Timeout Rate (%)
             - Completed Rate (%)
         - Chart: Orders per day (last 30 days)
         - Table: Venture rankings by acceptance rate

    Screen 2: Master Catalog & Global Pause:
        Spec: Regional control over available activities and gastronomy.
        UI Elements:
         - Project filter dropdown
         - "Add Item" button (opens modal)
         - Search/filter bar
         - Table columns: Name (i18n), Catalog Type, Price, Global Pause toggle, Actions
         - Each row has: Name, Catalog Type badge, Price, Global Pause toggle (high-contrast)
         - Actions: Edit, Delete

    Screen 3: Entrepreneur Management:
        Spec: Simple onboarding interface for local entrepreneurs (people who manage ventures).
        UI Elements:
         - Project filter dropdown
         - "Add Entrepreneur" button
         - Search bar
         - Table columns: Name, Email, WhatsApp, Linked Venture, Status, Actions
         - Status toggle: Enable/Disable (inline button)
         - Actions: Edit, View Linked Venture

    Screen 4: Venture Management:
        Spec: View and manage ventures, reorder cascade rotation.
        UI Elements:
         - Project filter dropdown
         - Catalog Type filter dropdown
         - "Add Venture" button
         - Drag-and-drop reorder handle for cascade_order
         - Table columns: Name, Catalog Type, Role, Capacity, General Pause, Cascade Order
         - Actions: Edit, Delete, Enable/Disable

    Screen 5: Project Settings:
        Spec: Configuration for project-level settings.
        UI Elements:
         - Project selector (if admin has access to multiple)
         - Form fields:
             - Cascade Timeout (minutes): number input
             - Max Cascade Attempts: number input
             - Default Language: dropdown
         - "Save Changes" button

---

## 7. Implementation Roadmap

### 7.1 Team Context

| Attribute | Value |
|-----------|-------|
| Team Size | 1 developer (solo) |
| Availability | Part-time (~20 hours/week) |
| Primary Experience | Backend: C++, Java, Go (20 years) |
| Secondary Experience | React, React Native, TypeScript APIs (some experience) |

> **Strategy (Frontend-First with Mocks):** Although the developer's strength is backend, to reduce product risk, the project will follow a "Frontend-First" approach. The `shared` package will define the data contracts (TypeScript interfaces, Zod validators). Then, the React Native mobile app will be built using **Zustand** to mock API responses. This allows rapid iteration and UX validation with the client using a real APK/Web app before investing time in the complex database and routing engine.

### 7.2 MVP Implementation Timeline (Frontend-First)

| Phase | Focus | Duration (Part-time) |
|-------|-------|----------------------|
| **Phase 1: Foundation (UI & Types)** | Monorepo Setup, Shared Types (Contracts), Expo Foundation, UI Components Package | 3-4 weeks |
| **Phase 2: Mobile Mocks (UX Validation)** | Tourist Flow (Zustand mocks), Entrepreneur Flow (Zustand mocks), Client UX Iteration | 4-5 weeks |
| **Phase 3: Core Backend (The Engine)** | DB Schema, Drizzle, Hono API (Auth, Catalog, Orders), Cascade Engine algorithm | 5-6 weeks |
| **Phase 4: Integration & Polish** | Connect Mobile `fetch` to Hono API, Expo Push Notifications, DevOps, Staging | 3-5 weeks |
| **Total** | | **~15-20 weeks (3.5-5 months)** |

> **Note:** This timeline reduces the risk of building the wrong backend. Once Phase 2 is approved by the client, Phase 3 (the developer's strong suit) can be built rapidly against validated and locked-in data contracts.

### 7.3 POST-MVP Roadmap

```mermaid
graph TD
    MVP["✅ MVP Complete"] --> P2["P2 Race Conditions<br/>Atomic Transactions"]
    MVP --> P3["P3 Offline Handling<br/>Reconnection Flow"]
    MVP --> P8["P8 Token Rotation<br/>Single-use Refresh"]
    MVP --> P6["P6 WhatsApp Notifications<br/>Business API"]
    MVP --> P1["P1 Admin Panel<br/>Web Dashboard"]

    P2 --> P4["P4 Idempotency<br/>Cache + TTL (requires Redis)"]
    P2 --> P5["P5 Cascade Snapshot<br/>Frozen Rotation"]

    P6 --> P9["P9 Morning Reminder<br/>Cron Job"]
    P3 --> P7["P7 Polling Fallback<br/>Background Fetch"]

    P1 --> P11["P11 Multi-Project<br/>Patagonia, etc."]
    P11 --> P10["P10 i18n Active<br/>Multi-language"]

    MVP --> P12["P12 E2E + Load Tests<br/>Playwright + k6"]
```

| Priority | Epic | Description |
|----------|------|-------------|
| **P0** | Race Condition Prevention | Atomic transactions, `FOR UPDATE` locks, partial unique index |
| **P1** | Admin Panel | Web dashboard: CRUD catalog, ventures, entrepreneurs, KPIs |
| **P1** | Offline Handling | Heartbeat, reconnection flow, lost offer notification |
| **P1** | WhatsApp Notifications | WhatsApp Business API integration |
| **P1** | Token Rotation | Single-use refresh tokens, revoke-all endpoint |
| **P2** | Idempotency | Idempotency-Key header, cached responses, 24h TTL (requires Redis) |
| **P2** | Cascade Snapshot | Frozen rotation order per order |
| **P2** | Polling Fallback | 30s foreground, 5min background |
| **P2** | Morning Reminder | Cron job: daily agenda via push + WhatsApp |
| **P2** | E2E & Load Testing | Playwright E2E, k6 load testing |
| **P3** | i18n Active | Multi-language support beyond Spanish |
| **P3** | Multi-Project | Support for multiple conservation projects |

### 7.4 Redis Dependency (POST-MVP Only)

> **MVP does NOT require Redis.** Rate limiting uses in-memory storage, timeout processing uses `setInterval`, and sessions use JWT + PostgreSQL.

Redis is introduced in POST-MVP for:
- **Job Queues (BullMQ):** Reliable timeout processing with full cascade retry, morning reminders
- **Idempotency Cache:** 24h TTL for request deduplication
- **Distributed Rate Limiting:** Required when running multiple server instances
- **Pub/Sub:** Real-time event distribution across instances

### 7.5 Implementation Task Checklist (MVP)

> **Note:** Use this checklist as your day-to-day reference. Every task is small, actionable, and designed to support the **Frontend-First** strategy.

#### Phase 1: Foundation (UI & Contracts)
- [ ] **1.1 Monorepo**: Initialize Bun workspace root (`package.json`, `bunfig.toml`, `tsconfig.base.json`).
- [ ] **1.2 Shared**: Create `@repo/shared` package with `package.json` and `tsconfig.json`.
- [ ] **1.3 Shared**: Define Zod validators/Types for `Tourist`, `Entrepreneur`, `Venture`, `CatalogItem`.
- [ ] **1.4 Shared**: Define Zod validators/Types for `Order`, `Order_Item`, `Cascade_Assignment`.
- [ ] **1.5 Shared**: Export Enums (`Order_Status`, `Cancel_Reason`) from `constants.ts`.
- [ ] **1.6 Mobile**: Initialize Expo React Native app in `apps/mobile` (`npx create-expo-app`).
- [ ] **1.7 Mobile**: Configure `NativeWind v5` and `Tailwind CSS`.
- [ ] **1.8 UI**: Create `@repo/ui` package with base components (Button, Card, Input) styled with NativeWind.
- [ ] **1.9 Workspace**: Link `@repo/ui` and `@repo/shared` as dependencies in `apps/mobile`.

#### Phase 2: Mobile Mocks (UX Validation)
- [ ] **2.1 Store**: Setup Zustand `useTouristStore` with mock ventures and active orders data.
- [ ] **2.2 Store**: Setup Zustand `useEntrepreneurStore` with mock incoming orders and calendar data.
- [ ] **2.3 UI/Tourist**: Build Welcome & Authentication screen (Mock magic link).
- [ ] **2.4 UI/Tourist**: Build Catalog list and Venture Detail views.
- [ ] **2.5 UI/Tourist**: Build Order Creation modal and Order Tracking screen.
- [ ] **2.6 UI/Entrepreneur**: Build Dashboard (Incoming order cards, Accept/Reject buttons).
- [ ] **2.7 UI/Entrepreneur**: Build Calendar (Slots, Occupancy bars based on `guest_count`).
- [ ] **2.8 UI/Entrepreneur**: Build Configuration view (Toggle pause statuses).
- [ ] **2.9 Interactive Flow**: Wire Zustand stores so Tourist creating an order triggers an incoming order on Entrepreneur dashboard.

> **Stop here:** Validate the interactive Mobile APK/Web prototype with the client before proceeding to Phase 3.

#### Phase 3: Core Backend (The Engine)
- [ ] **3.1 Backend**: Initialize Hono app in `apps/backend`.
- [ ] **3.2 Infra**: Setup PostgreSQL via `docker-compose.yml` (NO Redis yet).
- [ ] **3.3 DB**: Setup Drizzle ORM in `apps/backend/src/db` connecting to Postgres.
- [ ] **3.4 DB**: Translate `@repo/shared` Zod schemas into Drizzle tables and relations.
- [ ] **3.5 DB**: Create `bun run db:seed` script with initial Patagonia test data.
- [ ] **3.6 API**: Implement JWT Auth middleware and in-memory rate limiting Map.
- [ ] **3.7 API/Catalog**: Build public GET endpoints (`/ventures`, `/ventures/:id`).
- [ ] **3.8 API/Orders**: Build Tourist endpoints (POST `/orders`, GET `/orders/me`).
- [ ] **3.9 Engine**: Implement `filterVenture` logic (Validating capacity strictly via `guest_count`, pause status).
- [ ] **3.10 Engine**: Implement cascade assignment creation (`OFFER_PENDING` status).
- [ ] **3.11 API/Orders**: Build Entrepreneur endpoints (POST `/orders/:id/accept` and `reject` validating `OFFER_PENDING`).
- [ ] **3.12 Engine**: Implement Timeout Processor MVP (`setInterval` every 30s to auto-assign expired offers).

#### Phase 4: Integration & Polish
- [ ] **4.1 Mobile**: Setup Expo Push Notification tokens and update backend schema `Notification_Preference`.
- [ ] **4.2 Backend**: Implement push notification service to call Expo Push API.
- [ ] **4.3 Mobile**: Replace Zustand mock actions with real `fetch` calls to the Hono API.
- [ ] **4.4 Mobile**: Implement global error boundary and HTTP error toast notifications.
- [ ] **4.5 Testing**: E2E manual flow test: db:seed -> start backend -> place order on mobile -> cascade engine auto-assigns.
