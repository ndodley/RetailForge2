# RF2_P2

`RF2_P2` is the current full-stack prototype for rebuilding the original RetailForge project with a modern React frontend, a Spring Boot backend, and PostgreSQL.

This repo now goes well beyond an initial storefront shell: it includes browsing/search, a backend-persisted cart, Stripe-powered checkout, order history, product reviews, favorites, a floating AI shopping/admin chat assistant, and full admin CRUD/bulk-upload flows for departments, categories, products, users, orders, and reviews. Authentication is backend-persisted via Spring Security and server-side sessions (Spring Session JDBC), replacing the earlier frontend-only auth prototype.

---

## 📌 Table of Contents

- [Current stack](#current-stack)
- [What is implemented now](#what-is-implemented-now)
- [What is still in progress](#what-is-still-in-progress)
- [Project structure](#project-structure)
- [Local requirements](#local-requirements)
- [Environment files](#environment-files)
- [Quick start](#quick-start)
- [App routes](#app-routes)
- [Auth](#auth)
- [AI chat assistant](#ai-chat-assistant)
- [Payments](#payments)
- [Media and image handling](#media-and-image-handling)
- [Database and migrations](#database-and-migrations)
- [Development commands](#development-commands)
- [Security / local dev notes](#security--local-dev-notes)
- [Related docs](#related-docs)
- [Notes before committing](#notes-before-committing)

---

## Current stack

### Frontend

- React 19
- TypeScript
- Vite 8
- React Router 7
- Axios
- MUI / Emotion
- Stripe.js / React Stripe.js (`@stripe/stripe-js`, `@stripe/react-stripe-js`)
- react-markdown / remark-gfm (renders AI chat responses)
- Bootstrap, styled-components

### Backend

- Spring Boot 4.1.0
- Spring Web MVC
- Spring Data JPA
- Spring Security (session-based auth, BCrypt password hashing)
- Spring Validation
- Flyway
- Spring Session JDBC
- Spring AI (Anthropic Claude + OpenAI starters, JDBC-backed chat memory)
- Stripe Java SDK (payments)
- PostgreSQL

### Infrastructure

- PostgreSQL 18.3 via `docker-compose.yml`
- Maven Wrapper for backend builds
- npm for frontend builds

## What is implemented now

### Storefront

- Home page with product showcase
- Merged authentication page with Login/Register tabs, now backed by real server sessions
- Product listing page with search, filters, sorting, and pagination
- Product detail page with reviews
- Product cards with image fallback handling and dedicated styling
- Server-persisted cart tied to the logged-in user (`/api/cart`)
- Stripe Elements checkout flow and order confirmation page
- Order history and order detail pages (`/my-orders`, `/order-details/:id`)
- Favorites (`/my-favorites`) backed by `/api/favorites`
- Customer profile page (`/my-profile`), including avatar upload
- Product reviews: view, create, edit, and delete your own reviews (`/my-reviews`)
- Floating AI chat widget available to both guests and logged-in users, with persistent chat history/sessions and multi-turn memory

### Admin

- Departments dashboard + create/update flow
- Categories dashboard + create/update flow
- Products dashboard + create/update flow
- Users dashboard + create/update flow, including avatar upload
- Orders dashboard + order detail/status update flow
- Reviews dashboard + create/update/delete flow
- CSV bulk upload for departments, categories, products, users, and reviews
- Optional multipart image upload for products and user avatars
- Filesystem-backed image serving through `/images/**`
- Admin routes guarded for `manager` and `employee` roles
- The AI chat assistant exposes extra admin-only tools (top sellers, inventory levels, out-of-stock/low-stock products, order status breakdown) in addition to the shopper tools (search, cart, favorites, orders, reviews)

### Backend API

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Departments**: `GET/POST/PUT/DELETE /api/departments`, `POST /api/departments/bulk`
- **Categories**: `GET/POST/PUT/DELETE /api/categories`, `POST /api/categories/bulk`
- **Products**: `GET/POST/PUT/DELETE /api/products` (multipart form data for create/update), `POST /api/products/bulk`
- **Users**: `GET/POST/PUT/DELETE /api/users`, `POST /api/users/bulk`, `PUT /api/users/{id}/avatar`
- **Cart**: `GET/POST/PATCH/DELETE /api/cart`, `/api/cart/items/{productId}`
- **Reviews**: `GET/POST/PUT/DELETE /api/reviews`, `/api/reviews/product/{id}`, `/api/reviews/user/{id}`, `POST /api/reviews/bulk`
- **Favorites**: `GET/POST/DELETE /api/favorites/user/{userId}`, `/api/favorites/user/{userId}/product/{productId}`
- **Orders (admin)**: `GET/POST/PUT/DELETE /api/admin/orders`, `/api/admin/orders/user/{id}`, `/api/admin/orders/status/{status}`, `PUT /api/admin/orders/{id}/status`
- **Order details**: `GET /api/order-details/order/{orderId}`
- **Payments**: `POST /api/payment/create-payment-intent`, `POST /api/payment/complete-checkout` (Stripe)
- **AI chat**: `POST /api/chat`, `POST/GET/DELETE /api/chat/sessions`, `/api/chat/sessions/{id}/messages`, `/api/chat/sessions/{id}/clear`

## What is still in progress

This repo is still a prototype. Some original RetailForge concepts are not fully rebuilt yet:

- Password reset / email verification flows
- Rate limiting on the public chat endpoint
- Production-hardened Stripe key management (see [Security / local dev notes](#security--local-dev-notes))
- Broader automated test coverage across the newer order/payment/chat flows
- Kafka-based event visibility and Artillery load-testing scenarios from the original project have not been rebuilt here yet

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
- `frontend/src/pages/mypages/` - customer account pages (profile, favorites, reviews, orders, order details)
- `frontend/src/components/` - shared UI (chat widget, navbar, product cards) and admin tables/layout
- `frontend/src/api/` - frontend API clients (cart, orders, favorites, reviews, chat, users, products)
- `frontend/src/context/` - auth and favorites provider state
- `frontend/src/hooks/` - shared hooks such as `useAuth`, `useChat`, `useFavorites`
- `frontend/src/routes/AppRoutes.tsx` - route table, including the Stripe `Elements` wrapper for checkout
- `backend/src/main/java/.../controllers/` - REST controllers (auth, cart, orders, payments, chat, etc.)
- `backend/src/main/java/.../services/` - service layer, including the chat tool implementations used by the AI assistant
- `backend/src/main/java/.../security/` - Spring Security config and session-based auth setup
- `backend/src/main/resources/db/migration/` - Flyway migrations
- `backend/media/` - local media storage for uploaded/shared product and avatar images

## Local requirements

- Docker Desktop / Docker Compose
- Node.js + npm
- Java 25

The backend `pom.xml` currently targets Java `25`, so use a matching JDK when running the Spring Boot app locally.

## Environment files

The repo includes:

- root example: `.env.example`
- frontend example: `frontend/.env.example`
- backend AI key template: `backend/application-secrets.properties.example`

### Root `.env.example`

- `POSTGRES_DB=rf2_p2`
- `POSTGRES_USER=rf2_user`
- `POSTGRES_PASSWORD=rf2_dev_password`
- `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5434/rf2_p2`
- `SPRING_DATASOURCE_USERNAME=rf2_user`
- `SPRING_DATASOURCE_PASSWORD=rf2_dev_password`

### Frontend `frontend/.env.example`

- `VITE_API_BASE_URL=http://localhost:8080`
- You will also need `VITE_STRIPE_PUBLISHABLE_KEY` set locally (not yet listed in `.env.example`) for the checkout page's Stripe Elements provider to initialize.

### Backend AI keys

- Copy `backend/application-secrets.properties.example` to `backend/application-secrets.properties` (gitignored) and set `spring.ai.openai.api-key` to a real key.
- The active chat provider is controlled by `spring.ai.model.chat` in `application.properties` (currently `openai`; can be switched to `anthropic` since both starters are on the classpath).

You can copy the root/frontend examples into local `.env` files if you want, but keep real local overrides uncommitted.

## Quick start

### 1. Start PostgreSQL

From the project root:

```powershell
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

Important: start the backend from the `backend` folder so `${user.dir}/media` resolves to `backend/media`. Make sure `application-secrets.properties` exists if you want the AI chat assistant to work locally.

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
- `/auth`, `/login`, `/register` - merged authentication page
- `/products` - storefront product listing
- `/products/:id` - product detail page
- `/cart` - server-persisted cart page
- `/checkout` - Stripe Elements checkout, wrapped in the Stripe `<Elements>` provider
- `/order-confirmation` - post-checkout confirmation/receipt page
- `/my-profile` - customer profile + avatar upload
- `/my-favorites` - saved favorite products
- `/my-reviews` - reviews you've written
- `/my-orders` - order history
- `/order-details/:id` - customer-facing order detail page
- `/admin/departments` - department management
- `/admin/categories` - category management
- `/admin/products` - product management
- `/admin/users` - user management
- `/admin/reviews` - review management
- `/admin/orders`, `/admin/orders/:id` - order management + order detail/status updates

## Auth

Authentication is now backend-persisted rather than frontend-local:

- Spring Security handles login/logout with BCrypt-hashed passwords
- Sessions are stored server-side via Spring Session JDBC (cookie-based; the frontend sends `credentials: include` and the backend CORS config allows `http://localhost:5173` with credentials)
- Roles: `CUSTOMER`, `MANAGER`, `EMPLOYEE` (`UserRole` enum) — the admin catalog routes require `MANAGER` or `EMPLOYEE`
- Demo users are seeded via the `V6__seed_demo_users.sql` Flyway migration
- Register signs the user in immediately after account creation, and the navbar switches between guest actions and an authenticated account menu

## AI chat assistant

A floating chat widget (`ChatWidget.tsx`) is available site-wide for both guests and logged-in users:

- Chat history is session-scoped and persisted server-side (`chat_sessions` table plus Spring AI's JDBC-backed chat memory tables)
- Guests get their own recent-chats list, scoped by a guest session key; logged-in users get theirs scoped by user id
- Shopper-facing tools: product search, cart/favorites management, order lookup, popular products, product reviews
- Admin-only extra tools (when logged in as `manager`/`employee`): top sellers, current inventory, out-of-stock/low-stock products, order status breakdown

## Payments

Checkout uses Stripe, similar to the original project:

- The frontend wraps `CheckoutPage` in Stripe's `<Elements>` provider using `VITE_STRIPE_PUBLISHABLE_KEY`
- The backend creates a PaymentIntent via `/api/payment/create-payment-intent` and finalizes the order (creating the order + order items) via `/api/payment/complete-checkout`

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
- `V5__create_users_table.sql`
- `V6__seed_demo_users.sql`
- `V7__create_carts_table.sql`
- `V8__create_cart_items_table.sql`
- `V9__create_orders_table.sql`
- `V10__create_order_items_table.sql`
- `V11__create_reviews_table.sql`
- `V12__create_favorites_table.sql`
- `V13__create_ai_chat_memory_tables.sql`
- `V14__create_chat_sessions_table.sql`

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

## Security / local dev notes

- CORS is restricted to `http://localhost:5173` with credentials enabled (required for session cookies) — this is tighter than the earlier "allow all localhost" prototype configuration
- Public (unauthenticated) reads are allowed for products/categories/departments/reviews and the chat endpoints; writes require authentication, and catalog admin writes require the `MANAGER` or `EMPLOYEE` role
- **Note:** `application.properties` currently contains hardcoded Stripe *test-mode* keys (`sk_test_...` / `pk_test_...`). These should be moved to `application-secrets.properties` (gitignored) or environment variables before this prototype moves toward production use, the same way the AI provider API keys are already handled
- Do not commit local `.env` or `application-secrets.properties` files with real secrets

## Related docs

- `docs/postgres-setup.md` - PostgreSQL + Docker setup details
- `docs/admin-products-media-setup.md` - product admin image/media setup notes
- `original/OriginalProject.md` - reference material from the original project

## Notes before committing

- Do not commit local `.env` files or `application-secrets.properties` with machine-specific secrets
- Do not commit generated output such as `frontend/dist/`, `frontend/node_modules/`, or `backend/target/`
- If Docker volumes already contain older database state, review `docs/postgres-setup.md` before resetting or recreating the database
