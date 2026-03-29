# OpenSpec: Multi-Destination Impenetrable Reservation Platform

## 1. System Overview
The platform is a reservation application designed for local residents and entrepreneurs within conservation projects, starting with the IMPE (Impenetrable) region [1]. The main goal is to manage requests for activities and gastronomic services using a fair and equitable rotation logic [1]. 

To achieve this, the system features an automated engine that replaces manual assignments, routing orders in a way that allows the entrepreneur to accept or reject the service [1]. Additionally, it provides a frictionless experience so tourists can easily access the app to request their daily activities or meals [1].

**Key Technical Context:** The application will be primarily used on **Web and Android** platforms. Because the user base (both local entrepreneurs and some tourists) lacks advanced smartphone skills, **ease of use and accessibility are the highest priorities**. Furthermore, the frontend must be highly optimized to run smoothly on **low-end mobile devices**.

## 2. Actors and Intentions (Roles)

### 2.1. Tourist (Zero Friction)
*   **Intention:** Request an activity or service quickly [1].
*   **Behavior & UX Constraints:**
    *   Eliminates the need for traditional user account creation to avoid friction [2].
    *   Accesses the platform by scanning a QR code (which already contains the Project ID, e.g., Impenetrable) [2].
    *   Identifies themselves using a mandatory "Alias" [2].
    *   The system uses a JWT auth_token (stored in secure storage) to recognize them for future requests [2]. Token auto-refreshes before expiration (7 days).

### 2.2. Entrepreneur & Venture (Business)
*   **Intention:** Organize daily work and receive clients equitably through the rotation system [1, 2].
*   **Behavior & UX Constraints:**
    *   Registers their venture [2]. A single entrepreneur (owner) can manage multiple physical ventures (businesses) associated with a Project [2].
    *   Registers activities or gastronomic services [2].
    *   The engine routes orders to their business, and from their dashboard, they can accept or reject the request [2].
    *   **Calendar View:** The dashboard includes a simple calendar view to track assigned orders based on the service date and the specific time of day [2].
    *   **Individual Pause (Stock Control):** Can pause a specific catalog item if they run out of ingredients [2].
    *   **General Pause (Capacity Control):** Can disable the reception of all new requests if their business is full or closed [2].
    *   *UX Priority:* The dashboard must be native-feeling on Android, avoiding complex menus. Actions like "Accept/Reject" must be prominent and error-proof.

### 2.3. Impenetrable Admin
*   **Intention:** Audit the ecosystems, enable local hosts, and control regional catalogs [3].
*   **Behavior:**
    *   Enables the entrepreneur in the platform [3].
    *   *Evolution:* No longer performs manual request routing; this is now handled by the Backend Autonomous Engine [3].
    *   Manages the master catalog separated *by project* [3]. Can apply a **Global Pause** to an item across an entire region [3].
    *   Consumes a Monthly Reporting Dashboard (KPIs for acceptance rates, timeouts, and completed services) [3].

### 2.4. Autonomous Engine (Platform Backend)
*   **Intention:** Guarantee the fair distribution of work per region without human intervention [4].
*   **Behavior:** 
    *   **Router:** Executes the Cascading Routing Algorithm, isolating the rotation lists for each Project [4].
    *   **Morning Reminder (Cron Job):** Runs a scheduled task early in the morning to find confirmed orders for the current day and sends the entrepreneur an automated reminder (via WhatsApp/Email) with their daily agenda [4].

---

## 3. Business Rules (Core Workflows)

### 3.1. Cascading Routing Flow (Project-Isolated)
When a tourist submits a request:
1.  **Order Init**: Order is created with status `SEARCHING`. The engine starts iterating through ventures sorted by `cascade_order` (ascending).
2.  **Filter Phase**: For each venture in rotation order:
    - Skip if `general_pause = true` → record `skip_reason = GENERAL_PAUSE`
    - Skip if Venture_Item has `individual_pause = true` for requested Catalog_Item → record `skip_reason = INDIVIDUAL_PAUSE`
    - Skip if `guest_count > venture.max_capacity` → record `skip_reason = CAPACITY_EXCEEDED`
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

### 3.2. Internationalization (i18n)
*   Dynamic Catalog data (dish and activity names) are stored in the database using PostgreSQL's native `JSONB` type [6].
*   This allows the system to quickly extract translations (e.g., `{"es": "Guiso", "en": "Stew"}`) based on the tourist's browser `Accept-Language` header [6].

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

---

## 5. Data Structure (Multi-Project ERD)

Below is the relational data model prepared for AI generation using PostgreSQL. Operational states are kept as Enums to protect the cascading engine's strict logic, while expansible categories use parametric tables [6].

```mermaid
erDiagram
    %% ==========================================
    %% TOP LAYER: MULTI-TENANT (PROJECTS)
    %% ==========================================
    Project {
        int id PK
        string name "e.g. 'Impenetrable', 'Patagonia'"
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
        string auth_token "JWT token stored in secure storage (not LocalStorage). Expires in 7 days."
        timestamp token_expires_at
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
        enum skip_reason "null, GENERAL_PAUSE, INDIVIDUAL_PAUSE, CAPACITY_EXCEEDED, NOT_OFFERED"
        timestamp offer_sent_at
        timestamp response_deadline 
        timestamp resolved_at
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


--------------------------------------------------------------------------------
6. UI/UX Mockup Specifications (Google Stitch / Design Guidelines)
When generating UI components or screens, adhere strictly to the following constraints tailored for low-end Android devices and non-technical users.
6.1 Global Design Guidelines

    Visual & Accessible: Use high-contrast colors, extremely large buttons (wide touch areas), and highly legible typography. Use the colors of the Impenetrable Chaco: 
    Performance: The UI must be lightweight. Strictly avoid complex animations, heavy shadows, or overlapping elements that consume RAM on low-end phones.
    Navigation: Avoid complex hamburger menus or multi-step wizard flows. Keep actions flat and immediate.

6.2 Tourist Flow (Zero Friction Journey)

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

6.3 Entrepreneur Flow (Operational Journey)

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

6.4 Admin Impenetrable Flow (Management & Auditing)
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

