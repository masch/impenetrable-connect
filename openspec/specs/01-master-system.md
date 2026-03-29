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
    *   The system uses a device Token (Local Storage) to recognize them for future requests [2].

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
1.  The engine looks up Ventures that belong *exclusively* to that project (e.g., Impenetrable) [5].
2.  Evaluates the rotation order, automatically skipping ventures with an active "General Pause" or those lacking the requested item ("Individual Pause") [5].
3.  Sends the offer and triggers a waiting Timeout (e.g., 30 minutes) [5].
4.  If the venture rejects the request or the timeout expires, the offer is automatically forwarded to the next venture in the rotation list for that project [5].

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
        boolean is_active
    }

    %% ==========================================
    %% SECURITY & ACCESS LAYER
    %% ==========================================
    Access_User {
        int id PK
        string email "Unique"
        string password_hash 
        enum system_role "ADMIN, ENTREPRENEUR"
        int entrepreneur_id FK "Nullable. Ref: Physical person"
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
        string device_token "Local Storage"
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
        int cascade_order "Isolated rotation per project"
        boolean general_pause "Default FALSE"
        boolean is_active
    }

    Catalog_Item {
        int id PK
        int project_id FK "Isolates catalog by region"
        jsonb name_i18n "e.g. {'es':'Guiso','en':'Stew'}"
        int category_id FK
        decimal price
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
        enum global_status "SEARCHING, CONFIRMED, COMPLETED, NO_SHOW"
        timestamp created_at
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
        enum skip_reason "null, GENERAL_PAUSE, INDIVIDUAL_PAUSE, NOT_OFFERED"
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

    Screen 1: Welcome & Access:
        Spec: No traditional login/signup forms.
        UI Elements: 
         - A single required input field, prominent text input asking for an "Alias" (e.g., "Gomez Family").
         - Optional secondaries inputs fields:
            - Whatsapp number.
            - First name.
            - Last name.
         - A massive "Start" button.
         - Without bottom navigation bar.
    Screen 2: Service Catalog:
        Spec: A simple list to request multiple activities or meals.
        UI Elements:
         - Visual cards for available dishes/activities. Hidden entirely if under an "Individual Pause" or "Global Pause".
         - When the user clicks on a card, a modal opens to :
            - Time of day: breakfast, lunch, snack, dinner.
            - Quantity of people.
            - A "Confirm" button.
         - With bottom navigation bar with the following tabs:
            - Home: Service Catalog (selected)
            - Orders: Orders Status
            - Settings: Settings
    Screen 3: Orders Status (Waiting Room):
        Spec: Interactive waiting screen while the cascading engine works on each order.
        UI Elements for each order:
            - Display the order details (date, time of day, quantity of people, items).
            - Display the status of the order (waiting for entrepreneur, accepted, rejected, timeout).
            - A "Cancel" button.
         - With bottom navigation bar with the following tabs:
            - Home: Service Catalog
            - Orders: Orders Status (selected)
            - Settings: Settings
    Screen 4: Settings:
        Spec: Settings screen for the tourist.
        UI Elements:
         - A single required input field, prominent text input asking for an "Alias" (e.g., "Gomez Family").
         - Optional secondaries inputs fields:
            - Whatsapp number.
            - First name.
            - Last name.
         - A button to save changes.
         - A "Logout" button.
         - With bottom navigation bar with the following tabs:
            - Home: Service Catalog
            - Orders: Orders Status
            - Settings: Settings (selected)

6.3 Entrepreneur Flow (Operational Journey)

    Navigation: Bottom tab bar with 3 large icons:
        - Orders: Order Reception Dashboard (selected by default)
        - Calendar: Daily Agenda
        - Settings: Availability & Profile

    Screen 0: Login:
        Spec: Secure access for entrepreneurs.
        UI Elements:
         - Email input field (keyboard type: email)
         - Password input field (with show/hide toggle)
         - "Remember me" checkbox
         - Large "Login" button
         - Error messages for invalid credentials or account disabled

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

    Screen 3: Settings & Availability Control Panel:
        Spec: Quick toggles for capacity, stock management, and profile.
        UI Elements:
         - Profile section:
             - Full name (read-only, from Entrepreneur record)
             - WhatsApp contact (editable, used for Morning Reminder)
             - Email (read-only)
         - General Pause: Large toggle switch at the top for "General Pause" (business full/closed). When active, shows a badge indicator on the bottom nav.
         - Individual Pause: List of Venture_Items with individual toggles for "Individual Pause" (out of stock). Each item shows the catalog item name.
         - Logout button at the bottom

6.4 Admin Impenetrable Flow (Management & Auditing)
This interface will be accessed primarily via Web (Desktop) but must remain uncluttered.

    Screen 1: Monthly Reporting Dashboard (KPIs):
        Spec: A bird's-eye view to audit the ecosystem without manual assignment intervention.
        UI Elements: Large metric cards at the top displaying core KPIs: Acceptance Rates, Timeouts, and Completed Services. Simple data tables filterable by Project.
    Screen 2: Master Catalog & Global Pause:
        Spec: Regional control over available activities and gastronomy.
        UI Elements: A list/table of all catalog items associated with a project. Each item must feature a prominent, high-contrast toggle switch for "Global Pause", allowing the admin to disable an item across the entire region instantly.
    Screen 3: Host Management:
        Spec: Simple onboarding interface for local hosts.
        UI Elements: A clean list of registered entrepreneurs with a clear "Enable" or "Disable" action to authorize their access to the platform.

