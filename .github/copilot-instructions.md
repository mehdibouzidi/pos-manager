# POS Manager — Workspace Overview

## System Context

This is a **distributed point-of-sale system** designed to operate in both **online** and **offline** modes.
- **Online mode:** the POS UI communicates directly with the backend REST API using JWT authentication.
- **Offline mode:** the POS UI operates autonomously (local storage / service worker / cached data) and syncs with the backend when connectivity is restored. API Keys are used to authenticate POS terminals independently of user sessions.
- The system is **multi-tenant by POS terminal** (`pos_fk` on all business entities) — each point-of-sale terminal has its own isolated data scope.

---

This workspace contains three main modules:

## api/
**Backend** — Spring Boot REST API (Java/Maven).
Handles business logic, database access (Liquibase migrations), authentication, and exposes endpoints consumed by both UIs.

## ui/
**POS UI** — Point-of-sale frontend (Angular).
The cashier-facing interface used at the point of sale for day-to-day sales operations.

## ui-admin/
**Admin UI** — Administration frontend (Angular + Tailwind/Vex).
The back-office interface for managing products, users, reports, and configuration.

---

## Architecture Rules

### Security & Authorization
All endpoint authorization rules are defined in the backend at:
`api/src/main/java/com/mystore/manager/api/common/conf/SecurityConfig.java`

When adding a new endpoint, its access rules (permitted roles/authorities) **must** be declared in `SecurityConfig` inside the appropriate rules method (`adminRules()`, `businessSupplyRules()`, etc.).

### Frontend HTTP Requests (Bearer Token)
Both UIs maintain a static list of requests that require a JWT Bearer token:
- **UI:** `ui/src/backend/service/util/RequestsLists.ts` → `REQ_WITH_BEARER`
- **UI-ADMIN:** `ui-admin/src/app/backend/service/util/RequestsLists.ts` → `REQ_WITH_BEARER`

Whenever a new authenticated request is added to either frontend, it **must** be registered in the corresponding `REQ_WITH_BEARER` array in `RequestsLists.ts`. Requests that do not require authentication (e.g. login) go in `REQ_WITHOUT_BEARER`.

### Autocomplete & Multi-Autocomplete Dependencies

When declaring a new `findAll` or `findAllByCriteria` endpoint in `SecurityConfig`, check whether that endpoint is consumed as a data source by an autocomplete or multi-autocomplete component in any UI. If it is, the privilege protecting that UI component **must also be added** to the `hasAnyAuthority(...)` rule of this endpoint — so that users who hold that privilege can load the dropdown options correctly.

### New Business Entity Implementation

Before implementing a new entity, **analyze the existing file structure** to determine the correct location:
- **Backend:** place the entity under the `admin` package or the `business` package depending on its nature, following the same sub-package structure as existing entities.
- **Frontend:** place the entity in `ui` (POS interface) or `ui-admin` (administration interface) depending on which users it targets, following the same folder structure as existing entities.

When implementing a new business entity (backend or frontend), it **must** be modeled after an already existing entity in the project:
- **Backend:** follow the same class structure, inheritance (`extends`), annotations, and patterns used by existing entities.
- **Frontend:** replicate the same layout, colors, component structure, and conventions as existing entity screens.
- Do **not** introduce new patterns, abstractions, styles, or features beyond what is already established in the project.

When a new business entity requires a database table or schema change, a **new dedicated Liquibase changeset file** must be created. Never modify or append to existing Liquibase changesets to avoid migration conflicts. The changeset must:
- Be written in **SQL** wrapped in an **XML** changeset file
- Use `BEGIN` / `END` blocks
- Include an existence check before creating tables or columns (e.g. `IF NOT EXISTS`)
- Be registered at the end of the **master changelog** file
