# Spec: Venture Members (Backend)

## Requirements

### REQ-VM-01: Database Schema

The `venture_members` table MUST support the following schema:

| Column     | Type        | Constraints                 |
| ---------- | ----------- | --------------------------- |
| id         | serial      | Primary Key                 |
| venture_id | integer     | NOT NULL, FK → ventures.id  |
| user_id    | uuid        | NOT NULL, FK → users.id     |
| role       | varchar(50) | NOT NULL, default 'MANAGER' |
| created_at | timestamp   | NOT NULL, default now()     |
| updated_at | timestamp   | NOT NULL, default now()     |

### REQ-VM-02: GET /v1/ventures/user/:userId

Return ventures where the user has a membership record.

- **Auth**: Required (JWT middleware)
- **Method**: GET
- **Path**: `/v1/ventures/user/:userId`
- **Response 200**: Array of `Venture` objects (empty array if no memberships)
- **Response 401**: Missing or invalid JWT
- **Sorting**: Same as GET /v1/ventures (zzz_is_active DESC, name ASC)

### REQ-VM-03: Migration

A Drizzle migration MUST be generated that:

- Creates the `venture_members` table
- Adds foreign key constraints to `ventures.id` and `users.id`
- Adds the `auditColumns` (created_at, updated_at)

## Scenarios

### SC-VM-01: User has memberships

```
GET /v1/ventures/user/{userId}
Auth: valid JWT
→ 200 [{ id: 1, name: "Parador Don Esteban", ... }, { ... }]
```

### SC-VM-02: User has no memberships

```
GET /v1/ventures/user/{userId}
Auth: valid JWT
→ 200 []
```

### SC-VM-03: Missing auth

```
GET /v1/ventures/user/{userId}
Auth: none
→ 401 { error: "Unauthorized" }
```

### SC-VM-04: Invalid userId format

```
GET /v1/ventures/user/{invalidId}
Auth: valid JWT
→ 200 [] (empty result, no crash)
```

### SC-VM-05: Migration applies cleanly

```
make db-migrate
→ venture_members table created with FKs and audit columns
```
