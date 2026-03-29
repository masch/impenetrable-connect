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
    *   The system uses a JWT auth_token (stored in secure storage) to recognize them for future requests [2]. Token auto-refreshes before expiration (7 days).

### 2.2. Entrepreneur & Venture (Business) **[MVP]**
*   **Intention:** Organize daily work and receive clients equitably through the rotation system [1, 2].
*   **Behavior & UX Constraints:**
    *   Registers their venture [2]. A single entrepreneur (owner) can manage multiple physical ventures (businesses) associated with a Project [2].
    *   Registers activities or gastronomic services [2].
    *   The engine routes orders to their business, and from their dashboard, they can accept or reject the request [2].
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

### 2.4. Autonomous Engine (Platform Backend) **[MVP]**
*   **Intention:** Guarantee the fair distribution of work per region without human intervention [4].
*   **Behavior:** 
    *   **Router:** Executes the Cascading Routing Algorithm, isolating the rotation lists for each Project [4].
    *   **Morning Reminder (Cron Job):** **[POST-MVP]** Runs a scheduled task early in the morning to find confirmed orders for the current day and sends the entrepreneur an automated reminder (via WhatsApp/Email) with their daily agenda [4].

---

## 3. Business Rules (Core Workflows)

### 3.1. Cascading Routing Flow (Project-Isolated) **[MVP]**

> **Note:** Individual Pause (Venture_Item level) is **[POST-MVP]**. Only General Pause at venture level for MVP.
When a tourist submits a request:
1.  **Order Init**: Order is created with status `SEARCHING`. The engine starts iterating through ventures sorted by `cascade_order` (ascending).
2.  **Filter Phase**: For each venture in rotation order:
    - Skip if `venture.is_active = false` → record `skip_reason = VENTURE_INACTIVE`
    - Skip if `general_pause = true` → record `skip_reason = GENERAL_PAUSE`
    - Skip if Venture_Item has `individual_pause = true` for requested Catalog_Item → record `skip_reason = INDIVIDUAL_PAUSE`
    - Skip if `guest_count > venture.max_capacity` → record `skip_reason = CAPACITY_EXCEEDED`
    - Skip if `service_date` day is not in `venture.opening_hours` → record `skip_reason = CLOSED_THAT_DAY`
    - Skip if requested time is outside `venture.opening_hours` range → record `skip_reason = OUTSIDE_OPENING_HOURS`
3.  **Offer Phase**: First venture that passes filters gets the offer:
    - Create Cascade_Assignment with `offer_status = WAITING_FOR_RESPONSE`
    - Set `response_deadline = now + project.cascade_timeout_minutes`
    - Send notification to entrepreneur
4.  **Response Handling**:
    - **Accept**: Update Order status to `CONFIRMED`, set `confirmed_venture_id`, mark assignment as `ACCEPTED`
    - **Reject**: Mark assignment as `REJECTED`, continue to next venture in rotation
    - **Timeout**: Mark assignment as `TIMEOUT`, continue to next venture
5.  **Termination Conditions**:
    - **Success**: Venture accepts → Order becomes `CONFIRMED`
    - **Max Attempts**: After `project.max_cascade_attempts` rejections/timeouts → Order becomes `EXPIRED` with cancel_reason `NO_VENTURE_AVAILABLE`
    - **All Paused**: If ALL ventures are skipped (General/Individual Pause) → Order becomes `EXPIRED` with cancel_reason `NO_VENTURE_AVAILABLE`
    - **Tourist Cancel**: Order becomes `CANCELLED` with cancel_reason `BY_TOURIST`

**Initial Cascade Order**: Default is creation order (1, 2, 3...). Admin can manually reorder ventures in the Admin Panel to change rotation priority.

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
| `items` | Required, min 1 | "At least 1 item is required" |
| `items` | Max 10 unique items | "Maximum 10 items per order" |
| `time_of_day_id` | Required | "Time of day is required" |

#### 3.3.2 Venture Availability Validations (Filter Phase)

Before offering an order to a venture, the engine validates:

| Check | Condition | Skip Reason |
|-------|-----------|-------------|
| Venture Active | `venture.is_active = true` | `VENTURE_INACTIVE` |
| General Pause | `venture.general_pause = false` | `GENERAL_PAUSE` |
| Capacity | `order.guest_count <= venture.max_capacity` | `CAPACITY_EXCEEDED` |
| Individual Pause | `venture_item.individual_pause = false` for all items | `INDIVIDUAL_PAUSE` |
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
SEARCHING ──accept──> CONFIRMED ──complete──> COMPLETED
   │                          │
   │                          └──no-show──> NO_SHOW
   │
   ├──cancel──> CANCELLED (by tourist)
   │
   └──expire──> EXPIRED (no venture available / all skipped)
```

**State Transition Rules:**
- `SEARCHING` → `CONFIRMED`: When entrepreneur accepts
- `SEARCHING` → `CANCELLED`: When tourist cancels (only if status = SEARCHING)
- `SEARCHING` → `EXPIRED`: When max cascade attempts reached or all ventures skipped
- `CONFIRMED` → `COMPLETED`: When service date passes + no NO_SHOW reported
- `CONFIRMED` → `NO_SHOW`: When entrepreneur marks tourist as no-show

#### 3.3.4 Cascade Skip Reasons

Complete list of skip reasons in `Cascade_Assignment.skip_reason`:

| Reason | Description |
|--------|-------------|
| `null` | Venture was offered (not skipped) |
| `GENERAL_PAUSE` | Venture has general_pause = true |
| `INDIVIDUAL_PAUSE` | Venture_Item has individual_pause = true for requested item |
| `CAPACITY_EXCEEDED` | guest_count > venture.max_capacity |
| `CLOSED_THAT_DAY` | Venture is closed on the requested day (not in opening_hours) |
| `OUTSIDE_OPENING_HOURS` | Requested time is outside venture's operating hours |
| `VENTURE_INACTIVE` | Venture.is_active = false |
| `NOT_OFFERED` | Venture was not in the rotation list |

#### 3.3.5 Order Duplication Prevention

A tourist cannot have multiple active orders for the same:
- `service_date` + `time_of_day_id`

If such order exists with status `SEARCHING` or `CONFIRMED`, the system returns error: "You already have an order for this time slot"

#### 3.3.6 Capacity Calculation

When checking if a venture can accept an order:

```typescript
function getCurrentGuestCount(ventureId: number, serviceDate: Date, timeOfDayId: number): number {
    // Sum of guest_count for CONFIRMED orders at same date/time
    return SUM(o.guest_count) FROM Order o
    WHERE o.confirmed_venture_id = ventureId
      AND o.service_date = serviceDate
      AND o.time_of_day_id = timeOfDayId
      AND o.status IN ('SEARCHING', 'CONFIRMED');
}

function canAcceptOrder(venture: Venture, order: Order): boolean {
    const currentGuests = getCurrentGuestCount(venture.id, order.service_date, order.time_of_day_id);
    return (currentGuests + order.guest_count) <= venture.max_capacity;
}
```

---

## 4. Technical Architecture & Tech Stack

To meet the requirement of running smoothly on low-end devices while serving Web and Android users efficiently:

*   **Frontend Framework:** **React Native using Expo**. This allows writing a single codebase that compiles into a lightweight Android application (APK/AAB) and a responsive Web application.
*   **Performance Constraint:** Avoid heavy UI animations and large client-side bundle sizes to ensure performance on low-end hardware.
*   **Backend Framework:** **Node.js with TypeScript**. This enables sharing interfaces and type definitions between the frontend and backend, ensuring end-to-end type safety.
*   **Database:** PostgreSQL (ERD defined below).

### 4.1 Security Requirements

*   **Authentication:**
    *   **Entrepreneur/Admin:** JWT-based authentication with email/password. Tokens stored in httpOnly cookies (web) or secure storage (mobile).
    *   **Tourist:** JWT token with 7-day expiration. Auto-renewal before expiration. No traditional login required — token generated on first visit.
*   **Password Security:** Use bcrypt or argon2 for password hashing with cost factor 10+.
*   **Rate Limiting:**
    *   Global: 100 requests/minute per IP
    *   Order creation: 10 orders/minute per device token
    *   Auth endpoints: 5 attempts/minute per IP
*   **Account Lockout:** After 5 failed login attempts, lock account for 15 minutes.
*   **Input Validation:** All inputs sanitized. SQL injection prevented via parameterized queries (Knex/Prisma). XSS prevented via output encoding.
*   **API Security:** All endpoints require authentication except: `POST /auth/login`, `POST /orders` (tourist), `GET /catalog`.

### 4.2 API Design

All endpoints follow RESTful conventions. Base URL: `https://api.elimpenetrable.org/v1`

> **MVP:** Only Tourist + Entrepreneur endpoints (4.2.1 - 4.2.3). Admin endpoints (4.2.4) are **[POST-MVP]**.

#### 4.2.1 Public Endpoints (No Authentication Required) **[MVP]**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/tourist/create` | Create tourist identity with alias |
| POST | `/auth/tourist/refresh` | Refresh tourist JWT token |
| GET | `/catalog` | Get available catalog items for a project |

**POST /auth/tourist/create**
```json
Request:
{
  "alias": "string (required, 1-50 chars)",
  "first_name": "string (optional, max 100)",
  "last_name": "string (optional, max 100)",
  "whatsapp": "string (optional, e.g. +54911...)",
  "project_id": "integer (required, from QR code)"
}

Response (201):
{
  "person_id": "uuid",
  "auth_token": "jwt",
  "expires_at": "timestamp"
}
```

**POST /auth/tourist/refresh**
```json
Request:
{
  "auth_token": "string (current token)"
}

Response (200):
{
  "auth_token": "jwt (new)",
  "expires_at": "timestamp"
}
```

**GET /catalog**
```json
Query Parameters:
- project_id (required): integer

Headers:
- Accept-Language: "es" or "en" (optional, defaults to project default)

Response (200):
{
  "items": [
    {
      "id": 1,
      "name": "Guiso",
      "description": "Traditional stew",
      "price": 15.00,
      "category": "GASTRONOMY",
      "image_url": "https://...",
      "max_participants": null
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
Request:
{
  "project_id": "integer (required)",
  "service_date": "string (required, YYYY-MM-DD)",
  "time_of_day_id": "integer (required)",
  "guest_count": "integer (required, 1-100)",
  "items": [
    { "catalog_item_id": 1, "quantity": 2 }
  ],
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
      "time_of_day": "LUNCH",
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
Response (200):
{
  "order": {
    "id": 123,
    "service_date": "2024-01-15",
    "time_of_day": "LUNCH",
    "guest_count": 4,
    "status": "CONFIRMED",
    "confirmed_venture": "Parador Don Esteban",
    "created_at": "timestamp"
  },
  "details": [
    { "catalog_item_id": 1, "name": "Guiso", "quantity": 2, "price": 15.00 }
  ],
  "cascade_history": [
    { "venture": "Parador A", "status": "REJECTED", "reason": null },
    { "venture": "Parador B", "status": "ACCEPTED", "reason": null }
  ]
}
```

#### 4.2.3 Entrepreneur Endpoints (Auth Required) **[MVP]**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders/pending` | Get pending orders for entrepreneur's ventures |
| POST | `/orders/:id/accept` | Accept an order |
| POST | `/orders/:id/reject` | Reject an order |
| GET | `/calendar` | Get confirmed orders by date range |
| GET | `/ventures` | Get entrepreneur's ventures |
| PUT | `/ventures/:id/pause` | Toggle general pause |
| PUT | `/ventures/:id/items/:item_id/pause` | Toggle individual pause |
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
      "time_of_day": "LUNCH",
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
          "time_of_day": "LUNCH",
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

#### 4.2.4 Admin Endpoints (Auth Required + ADMIN role) **[POST-MVP]**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/entrepreneurs` | List all entrepreneurs |
| PUT | `/admin/entrepreneurs/:id/enable` | Enable/disable entrepreneur |
| POST | `/admin/entrepreneurs` | Create new entrepreneur + access_user |
| GET | `/admin/ventures` | List all ventures |
| PUT | `/admin/ventures/:id` | Update venture |
| PUT | `/admin/ventures/reorder` | Reorder cascade |
| GET | `/admin/catalog` | List catalog items |
| POST | `/admin/catalog` | Create catalog item |
| PUT | `/admin/catalog/:id` | Update catalog item |
| PUT | `/admin/catalog/:id/pause` | Toggle global pause |
| DELETE | `/admin/catalog/:id` | Delete catalog item |
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

**Providers:** Firebase Cloud Messaging (FCM) or Expo Push Notifications

**Flow:**
1. App registers with FCM → obtains device push token
2. Push token stored in `Notification_Preference`
3. When event occurs → backend sends to FCM → FCM delivers to device

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
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
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

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
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

**Tool:** Knex.js or Prisma Migrate

**Migration Files Structure:**
```
migrations/
  20240101000000_create_users.sql
  20240102000000_create_projects.sql
  20240103000000_create_orders.sql
  ...
```

**Commands:**
```bash
# Run migrations
bun run migrate

# Rollback last migration
bun run migrate:rollback

# Create new migration
bun run migrate:make create_new_table
```

**Seeding:**
```bash
# Seed database with initial data
bun run db:seed
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
| `REDIS_URL` | localhost | staging-redis | production-redis |
| `JWT_SECRET` | dev-secret | staging-secret | (from secrets manager) |
| `WHATSAPP_API_KEY` | test-key | staging-key | (from secrets manager) |
| `FCM_SERVER_KEY` | test-key | staging-key | (from secrets manager) |

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
| **Order Flow** | Tourist creates order → enters SEARCHING → entrepreneur accepts → becomes CONFIRMED |
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
| **Concurrent Accepts** | 10 entrepreneurs accepting simultaneously |
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
    project_id: 1,
    service_date: '2024-01-15',
    time_of_day_id: 1,
    guest_count: 4,
    items: [{ catalog_item_id: 1, quantity: 2 }],
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
    Access_User {
        int id PK
        string email "Unique"
        string password_hash "bcrypt or argon2 hash"
        enum system_role "ADMIN, ENTREPRENEUR"
        int entrepreneur_id FK "Nullable. Ref: Physical person"
        int failed_login_attempts "Default 0. Lock after 5 failed attempts"
        timestamp locked_until "Nullable. Lockout expiration time"
        timestamp last_login_at
        boolean is_enabled "Default TRUE. Manual enable/disable by admin"
    }

    %% ==========================================
    %% PARAMETRIC TABLES (Dictionaries)
    %% ==========================================
    Role_Type {
        int id PK
        string description "e.g. HOSTEL, GUIDE"
    }

    Catalog_Category {
        int id PK
        string description "e.g. GASTRONOMY, ACTIVITY"
    }

    Time_Of_Day {
        int id PK
        string description "e.g. BREAKFAST, LUNCH, DINNER"
    }

    %% ==========================================
    %% MAIN ENTITIES (Business Core)
    %% ==========================================
    Person {
        uuid id PK
        string alias "Mandatory"
        string first_name "Nullable"
        string last_name "Nullable"
        string whatsapp "Nullable. For order notifications"
        timestamp created_at
    }

    Entrepreneur {
        int id PK
        string full_name "Physical Person / Owner"
        string whatsapp_contact "Used for Morning Reminder"
    }

    Venture {
        int id PK
        int project_id FK
        int entrepreneur_id FK
        string name "e.g. Parador Don Esteban"
        string description "Optional venture description"
        string address "Physical address"
        decimal latitude "Geolocation"
        decimal longitude "Geolocation"
        string image_url "Optional venture photo"
        int role_type_id FK
        int cascade_order "Isolated rotation per project. Default: creation order (1, 2, 3...)"
        int max_capacity "Maximum number of guests per service (e.g. 20 seats)"
        jsonb opening_hours "e.g. {'mon': '08:00-20:00', 'tue': '08:00-20:00'}"
        boolean general_pause "Default FALSE"
        boolean is_active
    }

    Catalog_Item {
        int id PK
        int project_id FK "Isolates catalog by region"
        jsonb name_i18n "e.g. {'es':'Guiso','en':'Stew'}"
        jsonb description_i18n "Optional description (e.g. {'es':'Delicious stew'})"
        jsonb allergens_i18n "Allergen info (e.g. {'es':'Contiene gluten'})"
        jsonb ingredients_i18n "Ingredient list (e.g. {'es':'Carne, papas, cebolla'})"
        int category_id FK
        decimal price
        int max_participants "Maximum participants for activities (null for gastronomy)"
        string image_url "Optional: URL to dish/activity photo"
        boolean global_pause 
    }

    Venture_Item {
        int id PK
        int venture_id FK
        int catalog_item_id FK
        boolean individual_pause "Venture-level stock control"
        decimal price_override "Nullable. If null, uses Catalog_Item.price. Allows ventures to offer discounts."
    }

    %% ==========================================
    %% TRANSACTIONAL & CASCADING FLOW
    %% ==========================================
    Order {
        int id PK
        uuid person_id FK
        int project_id FK "Order origin"
        int confirmed_venture_id FK "Nullable. Set when status becomes CONFIRMED"
        date service_date "Used for Calendar view"
        int time_of_day_id FK "Used for Calendar view"
        int guest_count 
        string notes "Special requests or dietary restrictions from tourist"
        enum global_status "SEARCHING, CONFIRMED, COMPLETED, NO_SHOW, CANCELLED, EXPIRED"
        enum cancel_reason "null, BY_TOURIST, NO_VENTURE_AVAILABLE, SYSTEM_ERROR"
        timestamp cancelled_at "Nullable. Set when status becomes CANCELLED or EXPIRED"
        timestamp created_at
        
        %% Notification preferences for this order
        boolean notify_whatsapp "Whether to send WhatsApp notifications for this order"
    }

    Order_Detail {
        int id PK
        int order_id FK
        int catalog_item_id FK
        int quantity 
        decimal historical_price
    }

    Cascade_Assignment {
        int id PK
        int order_id FK
        int venture_id FK "Assigned to the business, not the person"
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
        uuid person_id FK "Nullable. For tourist notifications"
        int venture_id FK "Nullable. For entrepreneur notifications"
        int order_id FK "Nullable. Associated order"
        enum channel "PUSH, WHATSAPP, EMAIL, IN_APP"
        enum event_type "ORDER_RECEIVED, ORDER_CONFIRMED, ORDER_EXPIRED, ORDER_CANCELLED, MORNING_REMINDER"
        jsonb payload "Message content and metadata"
        boolean is_sent default FALSE
        timestamp sent_at "Nullable. Set when notification is sent"
        string external_id "Nullable. Provider message ID (e.g. WhatsApp message ID)"
        timestamp created_at
    }

    Notification_Preference {
        int id PK
        uuid person_id FK "Nullable. For tourists"
        int entrepreneur_id FK "Nullable. For entrepreneurs"
        boolean push_enabled default TRUE
        boolean whatsapp_enabled default FALSE
        boolean email_enabled default FALSE
    }

    %% ==========================================
    %% RELATIONSHIPS
    %% ==========================================
    Project ||--o{ Venture : "groups businesses"
    Project ||--o{ Catalog_Item : "defines regional catalog"
    Project ||--o{ Order : "receives requests"
    Venture ||--o{ Order : "confirmed in"

    Access_User |o--|| Entrepreneur : "authenticates"
    Entrepreneur ||--o{ Venture : "manages"
    
    Role_Type ||--o{ Venture : "classifies"
    Catalog_Category ||--o{ Catalog_Item : "categorizes"
    
    Time_Of_Day ||--o{ Order : "occurs at"
    
    Person ||--o{ Order : "places"
    
    Venture ||--o{ Venture_Item : "offers"
    Catalog_Item ||--o{ Venture_Item : "available at"
    
    Order ||--|{ Order_Detail : "contains"
    Catalog_Item ||--o{ Order_Detail : "includes"
    
    Order ||--o{ Cascade_Assignment : "processed by engine"
    Venture ||--o{ Cascade_Assignment : "receives offer"

    Person ||--o{ Notification : "receives"
    Venture ||--o{ Notification : "receives"
    Order ||--o{ Notification : "triggers"

    Person ||--o{ Notification_Preference : "has"
    Entrepreneur ||--o{ Notification_Preference : "has"


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
             - "Clear my data" button (deletes Person record)
             - "Logout" button (clears auth_token but keeps Person)

### 6.3 Entrepreneur Flow (Operational Journey) **[MVP]**

    Navigation: Bottom tab bar with 4 large icons:
        - Orders: Order Reception Dashboard (selected by default)
        - Calendar: Daily Agenda
        - Ventures: My Ventures List
        - Settings: Availability & Profile
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
         - Alert cards for incoming orders featuring two huge, contrasting buttons: "Accept" and "Reject"
         - Each card displays:
             - Order items (dish/activity names)
             - Guest count (e.g., "4 people")
             - Service date and time of day (e.g., "Today - Lunch")
             - Customer alias
         - Visual countdown timer showing remaining time before timeout (30 min)
         - Sound/vibration notification on new order arrival
         - Empty state: "No pending orders" message when the queue is empty

    Screen 2: Daily Agenda / Calendar:
        Spec: Visual tool to organize the workday.
        UI Elements:
         - Weekly view with date pills at the top
         - Tap on a day to expand confirmed orders for that date
         - Orders grouped by time of day (Breakfast, Lunch, Snack, Dinner)
         - Each order shows: customer alias, guest count, items
         - Visual occupation indicator (e.g., "12/20 seats filled")
         - Color coding: confirmed (green), completed (gray), no-show (red)

    Screen 3: My Ventures (Ventures Tab):
        Spec: List of ventures managed by the entrepreneur. Quick access to pause controls.
        UI Elements:
         - List of venture cards
         - Each card shows: Name, Role, Capacity, Status badge (Active/Paused)
         - Quick toggle: General Pause switch on each card
         - "Add Venture" floating action button (FAB)
         - Empty state: "You don't have any ventures yet"

    Screen 4: Settings & Availability Control Panel:
        Spec: Quick toggles for capacity, stock management, and profile.
        UI Elements:
         - Profile section:
             - Full name (read-only, from Entrepreneur record)
             - WhatsApp contact (editable, used for Morning Reminder)
             - Email (read-only)
         - General Pause: Large toggle switch at the top for "General Pause" (business full/closed). When active, shows a badge indicator on the bottom nav.
         - Individual Pause: List of Venture_Items with individual toggles for "Individual Pause" (out of stock). Each item shows the catalog item name.
         - Logout button at the bottom

    Screen 5: Create/Edit Venture (Modal):
        Spec: Form to create a new venture or edit existing one.
        UI Elements:
         - Venture name input
         - Role Type dropdown (Hostel, Guide, Restaurant, etc.)
         - Max capacity input (number)
         - Opening hours: Day-by-day toggles with start/end time pickers
         - "Add to Catalog" section: Multi-select from available Catalog_Items
         - Save / Cancel buttons

### 6.4 Admin Impenetrable Flow (Management & Auditing) **[POST-MVP]**
This interface will be accessed primarily via Web (Desktop).

    Navigation: Left sidebar (collapsible) with menu items:
        - Dashboard: Monthly Reporting KPIs (selected by default)
        - Catalog: Master Catalog & Global Pause
        - Hosts: Host Management
        - Ventures: Venture Management
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
         - Table columns: Name (i18n), Category, Price, Global Pause toggle, Actions
         - Each row has: Name, Category badge, Price, Global Pause toggle (high-contrast)
         - Actions: Edit, Delete

    Screen 3: Host Management:
        Spec: Simple onboarding interface for local hosts.
        UI Elements:
         - Project filter dropdown
         - "Add Host" button
         - Search bar
         - Table columns: Name, Email, WhatsApp, Ventures count, Status, Actions
         - Status toggle: Enable/Disable (inline button)
         - Actions: Edit, View Ventures

    Screen 4: Venture Management:
        Spec: View and manage ventures, reorder cascade rotation.
        UI Elements:
         - Project filter dropdown
         - "Add Venture" button
         - Drag-and-drop reorder handle for cascade_order
         - Table columns: Name, Owner, Role, Capacity, General Pause, Cascade Order
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

