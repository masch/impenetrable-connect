<h1 align="center">🌳<a href="https://impenetrable-connect.expo.app/">Impenetrable Connect</a>🌳</h1>

## Overview

Impenetrable Connect is a service reservation platform designed for local residents and entrepreneurs within conservation projects, starting with the IMPE (Impenetrable Chaco) region.

The platform's main goal is to manage requests for activities and gastronomic services using a fair and equitable rotation logic. It replaces manual assignment with an automated cascading routing engine, ensuring zero friction for tourists while transparently allocating orders to local ventures.

## Key Features

- **Tourist Access (Zero Friction):** Tourists request activities or services via a mobile application without cumbersome passwords. Access is granted instantly via aliases and browser fingerprints.
- **Entrepreneur Dashboard:** Local hosts manage their assigned ventures, pause items if they run out of stock (Individual Pause), close the venue for the day (General Pause), and track their daily agenda.
- **Automated Cascade Engine:** A strict routing algorithm iterates through ventures by order, evaluating capacities, schedules, and pauses. It supports timeouts and automatic re-assignment guarantees.
- **Unified Identity Model:** Both Tourists and Entrepreneurs map to a unified database structure with strict data projections for maximum frontend type safety.

## Tech Stack & Architecture (Frontend-First)

The project leverages a high-performance modern stack built around a **Bun Monorepo**, utilizing a "Frontend-First with Mocks" deployment strategy to validate UX iteratively.

- **Runtime & Tooling:** Bun (Workspaces)
- **Mobile / UI:** React Native via Expo, styled exclusively with NativeWind & Tailwind CSS.
- **State Management:** Zustand (powers the offline UX iteration mocks inside the client).
- **Shared Contracts:** `Zod` acts as the definitive Single Source of Truth inside `@repo/shared` for seamless End-to-End type safety.
- **Backend Engine:** Hono (API Framework) + Drizzle ORM.
- **Database:** PostgreSQL (with `JSONB` powering native i18n capabilities).

## Repository Structure

Built and orchestrated using a **Spec-Driven Development (SDD)** workflow.

- `/openspec/specs/`: Central repository definitions. Review `01-master-system.md` for unabridged business rules, ERD, and UI mock requirements.
- `/packages/shared/`: Data contracts, enumerators, and Zod schemas shared across the ecosystem.
- `/apps/mobile/`: The React Native/Expo frontend interface.
- `/apps/backend/`: The autonomous routing engine and backend API.

## Getting Started

1. Ensure [Bun](https://bun.sh/) is installed globally.
2. Clone the repository and install all dependencies:
   ```bash
   bun install
   ```
3. To understand the implementation roadmaps and business domain, read:
   `openspec/specs/01-master-system.md`
4. Spin up the development server:
   ```bash
   bun run dev
   ```

## Web Deployment

The Impenetrable Connect application is deployed to the web using Expo's EAS Hosting service.

**Live URL**: https://impenetrable-connect.expo.app/

### Automated Web Deployment

Web builds and deployments are automatically triggered on pushes to the `main` branch via GitHub Actions workflow (`.eas/workflows/deploy-web.yml`).

See the [Web Publishing Specification](openspec/specs/web-publishing.md) for detailed technical information.

# test
