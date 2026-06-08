# RF2_P2

`RF2_P2` is the current full-stack prototype for rebuilding the original RetailForge project with a modern React frontend, a Spring Boot backend, and PostgreSQL.

At the moment, this repo includes a working storefront shell, product browsing/detail pages, browser-local cart behavior, and admin CRUD/bulk upload flows for departments, categories, and products.

## Current stack

### Frontend

- React 19
- TypeScript
- Vite 8
- React Router 7
- Axios
- MUI / Emotion

### Backend

- Spring Boot 4.0.6
- Spring Web MVC
- Spring Data JPA
- Spring Security
- Spring Validation
- Flyway
- Spring Session JDBC
- PostgreSQL

### Infrastructure

- PostgreSQL 18.3 via `docker-compose.yml`
- Maven Wrapper for backend builds
- npm for frontend builds

## What is implemented now

### Storefront

- Home page
- Merged authentication page with Login/Register tabs
- Product listing page with search, filters, sorting, and pagination
- Product detail page
- Product cards with image fallback handling and improved dedicated styling
- Browser-local cart stored in `localStorage`

### Admin

- Departments dashboard + create/update flow
- Categories dashboard + create/update flow
- Products dashboard + create/update flow
- CSV bulk upload for departments, categories, and products
- Optional multipart image upload for products
- Filesystem-backed image serving through `/images/**`
- Admin routes guarded for `manager` and `employee` roles in the current frontend auth prototype

### Backend API

- `GET /api/departments`
- `GET /api/departments/{id}`
- `POST /api/departments`
- `POST /api/departments/bulk`
- `PUT /api/departments/{id}`
- `DELETE /api/departments/{id}`
- `GET /api/categories`
- `GET /api/categories/{id}`
- `POST /api/categories`
- `POST /api/categories/bulk`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products` (multipart form data)
- `POST /api/products/bulk`
- `PUT /api/products/{id}` (multipart form data)
- `DELETE /api/products/{id}`

## What is still in progress

This repo is still a prototype. Some original RetailForge concepts are not fully rebuilt yet.

Examples:

- backend-persisted authentication/session flows
- persistent server-side cart and checkout
- persistent favorites
- order history and reviews

The current cart is intentionally browser-local and lives in `frontend/src/api/cartStore.ts`.

The current auth implementation is also prototype-level and frontend-local:

- users and the active session are stored in browser `localStorage`
- roles currently supported in the frontend are `customer`, `manager`, and `employee`
- this is intended as a temporary bridge until the Spring Boot backend gets the full auth/session implementation

## Project structure

```text
RF2_P2/
├─ frontend/                 React + TypeScript app
├─ backend/                  Spring Boot app
├─ docs/                     setup notes and project-specific docs
├─ docker-compose.yml        local PostgreSQL service
├─ .env.example              root environment example
└─ original/                 archived original project/reference material
```

Important app folders:

- `frontend/src/pages/` - storefront and admin pages
- `frontend/src/components/` - shared UI and admin tables/layout
- `frontend/src/api/` - frontend API clients and local cart store
- `frontend/src/context/` - auth provider state
- `frontend/src/hooks/` - shared hooks such as `useAuth`
- `backend/src/main/java/` - controllers, services, entities, config, security
- `backend/src/main/resources/db/migration/` - Flyway migrations
- `backend/media/` - local media storage for uploaded/shared product images

## Local requirements

Verified from the current project files:

- Docker Desktop / Docker Compose
- Node.js + npm
- Java 25

The backend `pom.xml` currently targets Java `25`, so use a matching JDK when running the Spring Boot app locally.

## Environment files

The repo includes:

- root example: `.env.example`
- frontend example: `frontend/.env.example`

Current example values:

### Root `.env.example`

- `POSTGRES_DB=rf2_p2`
- `POSTGRES_USER=rf2_user`
- `POSTGRES_PASSWORD=rf2_dev_password`
- `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5434/rf2_p2`
- `SPRING_DATASOURCE_USERNAME=rf2_user`
- `SPRING_DATASOURCE_PASSWORD=rf2_dev_password`

### Frontend `frontend/.env.example`

- `VITE_API_BASE_URL=http://localhost:8080`

You can copy these into local `.env` files if you want, but keep real local overrides uncommitted.

## Quick start

### 1. Start PostgreSQL

From the project root:

```powershell
# from the repository root
docker compose up -d
```

By default, PostgreSQL is exposed on `localhost:5434` and uses the `rf2_p2` database.

### 2. Start the backend

From the `backend` folder:

```powershell
Set-Location .\backend
.\mvnw.cmd spring-boot:run
```

Current backend defaults from `backend/src/main/resources/application.properties`:

- app port: `8080`
- datasource: `jdbc:postgresql://localhost:5434/rf2_p2`
- media root: `${user.dir}/media`

Important: start the backend from the `backend` folder so `${user.dir}/media` resolves to `backend/media`.

### 3. Start the frontend

From the `frontend` folder:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8080` unless `VITE_API_BASE_URL` is overridden.

## App routes

Current frontend routes:

- `/` - home page
- `/auth?tab=login|register` - merged authentication page
- `/login` - compatibility route for the login tab
- `/register` - compatibility route for the register tab
- `/products` - storefront product listing
- `/products/:id` - product detail page
- `/cart` - browser-local cart page
- `/admin/departments` - department management
- `/admin/categories` - category management
- `/admin/products` - product management

## Current auth prototype behavior

The merged auth page follows the same overall login/register flow from the original project, but the initial implementation in this repo is frontend-local for now.

- Login and Register are now combined into a single tabbed page
- Register signs the user in immediately after account creation
- The navbar switches between guest actions and an authenticated account menu
- The admin catalog routes currently require `manager` or `employee`

For quick local testing, the frontend seeds demo accounts in browser storage:

- `cust1@dummy.com` / `password123` (`customer`)
- `manager@dummy.com` / `password123` (`manager`)
- `employee@dummy.com` / `password123` (`employee`)

## Media and image handling

Product/media setup for this prototype uses the backend-level `media` folder:

- `backend/media/product_images/`
- `backend/media/other_images/`

The backend serves these as public files through:

- `/images/product_images/<filename>`
- `/images/other_images/<filename>`

The default fallback image path used by the frontend is:

- `/images/other_images/dummy_product.jpg`

See `docs/admin-products-media-setup.md` for the current media workflow and CSV image path rules.

## Database and migrations

The backend uses Flyway migrations from:

- `backend/src/main/resources/db/migration/`

Current migration files in this repo:

- `V1__create_spring_session_tables.sql`
- `V2__create_departments_table.sql`
- `V3__create_categories_table.sql`
- `V4__create_products_table.sql`

JPA is configured with `spring.jpa.hibernate.ddl-auto=validate`, so the schema is expected to come from Flyway.

## Development commands

### Frontend

```powershell
Set-Location .\frontend
npm install
npm run dev
npm run build
npm run lint
```

### Backend

```powershell
Set-Location .\backend
.\mvnw.cmd spring-boot:run
.\mvnw.cmd test
```

## Security / local dev note

The current `SecurityConfig` is intentionally permissive for local development:

- all requests are currently permitted
- CORS allows `http://localhost:*` and `http://127.0.0.1:*`

That is useful while rebuilding the stack, but it should be tightened later if this prototype moves toward production-style auth.

## Related docs

- `docs/postgres-setup.md` - PostgreSQL + Docker setup details
- `docs/admin-products-media-setup.md` - product admin image/media setup notes
- `original/OriginalProject.md` - reference material from the original project

## Notes before committing

- Do not commit local `.env` files with machine-specific secrets
- Do not commit generated output such as `frontend/dist/`, `frontend/node_modules/`, or `backend/target/`
- If Docker volumes already contain older database state, review `docs/postgres-setup.md` before resetting or recreating the database

