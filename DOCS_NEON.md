# Neon Database Workflow (PostgreSQL v17)

This document outlines the workflow for managing the Neon PostgreSQL infrastructure for the project.

## 1. Initial Setup (From Scratch)

If you need to set up the database in a new Neon project:

1.  **Create Project**: Go to [Neon.tech](https://neon.tech), create a new project, and select **PostgreSQL 17**.
2.  **Configure Environment**: Create a `.env.neon` file in the monorepo root following the structure of `.env.example`:
    ```env
    DATABASE_URL="postgres://user:pass@host-pooler.region.neon.tech/neondb?sslmode=require"
    DIRECT_URL="postgres://user:pass@host.region.neon.tech/neondb?sslmode=require"
    ```
3.  **Deploy**: Run the initialization command:
    ```bash
    make db-migrate-neon
    ```
    *This will execute all pending migrations and automatically apply Advanced Patterns (Triggers & RLS).*

4.  **Seed Data (Optional)**: If you want to populate the database with initial mock users and data:
    ```bash
    make seed ENV_FILE=.env.neon
    ```

## 2. Making Modifications (Evolution)

When you need to change the schema (add tables, columns, etc.):

1.  **Modify Code**: Edit the files in `apps/backend/src/db/schema/*.ts`.
2.  **Generate Migration**: Create the SQL migration file with a professional name:
    ```bash
    make db-generate-neon NAME=add-new-feature
    ```
    *Drizzle will compare your code with the local migration snapshots and create a new file (e.g., `0001_add_new_feature.sql`) in `src/db/migrations`.*
3.  **Review**: (Optional but recommended) Review the newly generated `.sql` file to ensure it matches your expectations.
4.  **Apply**: Impact the changes in Neon:
    ```bash
    make db-migrate-neon
    ```

## 3. Local Development vs. Neon

To maintain consistency, use these commands depending on your target environment:

| Task | Local (Docker/Podman) | Neon (Cloud) |
| :--- | :--- | :--- |
| Fast Prototyping | `make db-push` | `make db-push-neon` |
| Generate SQL Migration | `make db-generate` | `make db-generate-neon` |
| Apply Migrations | `make db-migrate` | `make db-migrate-neon` |

## 4. Migration Files & Version Control

The files generated in `apps/backend/src/db/migrations/` are **critical** and must be committed to your repository:

- **`.sql` files**: These contain the actual database schema changes. They are used by the `migrate` command to update the database in production/Neon.
- **`meta/` folder**: Contains snapshots that Drizzle-Kit uses to track the schema state. Without these, Drizzle cannot accurately generate future migrations.

**Rule of thumb**: Always commit the entire `migrations/` directory. Never edit these files manually unless you are an advanced user.

## 5. Advanced Patterns (Automatic)

Thanks to the `db-setup-advanced.ts` script, the following features are applied automatically during `migrate`:

- **Audit Columns**: Automatic use of `zzz_created_at` and `zzz_updated_at`.
- **Triggers**: The PostgreSQL engine updates `zzz_updated_at` on every `UPDATE` without application intervention.
- **RLS**: Row Level Security enabled by default on sensitive tables.

## 6. Health Monitoring
You can verify the database connectivity and latency in real-time:
`GET /health` (Backend Endpoint)
