<div align="center">

# 🛒 RetailForge2

**A full-stack e-commerce platform — React + TypeScript on the front, Spring Boot + PostgreSQL on the back.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=for-the-badge)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev/)
[![Java](https://img.shields.io/badge/Java-25-ED8B00?logo=openjdk&logoColor=white&style=for-the-badge)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?logo=springboot&logoColor=white&style=for-the-badge)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white&style=for-the-badge)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Spring%20AI-412991?logo=openai&logoColor=white&style=for-the-badge)](https://spring.io/projects/spring-ai)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white&style=for-the-badge)](https://stripe.com/)
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-3.8-231F20?logo=apachekafka&logoColor=white&style=for-the-badge)](https://kafka.apache.org/)
[![Artillery](https://img.shields.io/badge/Artillery-Load%20Testing-FF4C4C?style=for-the-badge)](https://www.artillery.io/)

</div>

<div align="center">

<img width="1918" height="989" alt="RetailForge2 home page" src="https://github.com/user-attachments/assets/e047e9a5-df4f-442d-b9b2-40a1064c792c" />

*The storefront home page — see more in [Screenshots](#screenshots).*

</div>

`RetailForge2` is a full-stack e-commerce platform for a modern department store — a ground-up rebuild of the original RetailForge project on a new stack: **Spring Boot in place of Express.js**, and **TypeScript in place of JavaScript** on the frontend.

It covers the full customer journey — browsing/search, a backend-persisted cart, Stripe-powered checkout, order history, product reviews, and favorites — alongside a floating AI shopping/admin chat assistant and full admin CRUD/bulk-upload tooling for departments, categories, products, users, orders, and reviews. Authentication is backend-persisted via Spring Security and server-side sessions (Spring Session JDBC).

<div align="center">

|  | Original RetailForge | `RetailForge2` (this repo) |
|---|---|---|
| **Backend** | Node.js + Express | **Spring Boot** (Java) |
| **Frontend language** | JavaScript | **TypeScript** |
| **Database** | PostgreSQL | PostgreSQL |
| **Auth** | Session-based (HTTP-only cookies) | Session-based (Spring Security + Spring Session JDBC) |
| **Payments** | Stripe | Stripe |
| **AI assistant** | — | **New**: role-aware chat assistant (OpenAI via Spring AI) with separate shopper and admin tool sets |
| **Event streaming** | Kafka (order/auth/inventory events) | Kafka (same three event types), opt-in via `KAFKA_ENABLED` |

</div>

---

<a id="notable-improvements"></a>

## 🚀 Notable improvements over the original

Beyond the stack rewrite above, a few things are genuinely new or meaningfully better than the original RetailForge, not just re-implemented in a different language:

- **A real AI assistant, from scratch** — the original had no AI at all. RetailForge2's floating chat widget is role-gated server-side (shoppers and `manager`/`employee` sessions get different tool sets), keeps persisted, resumable chat history per user, and can answer questions like "what did I buy in my last order" with the actual purchased items, not just an order status.
- **One merged auth page instead of two** — Login and Register are now tabs on a single page backed by real backend sessions, rather than separate pages.
- **TypeScript across the whole frontend** — replacing the original's plain JavaScript, catching a category of bugs (typos in prop names, wrong argument types, null-unsafe access) at compile time instead of runtime.
- **A more refined admin experience** — clickable order cards instead of a separate "View Details" button, uncropped product images in a consistent frame instead of cropped thumbnails, and one shared CRUD shell (search, filter, pagination, CSV export, CSV bulk upload with template + row preview) reused across all six admin entities instead of built ad hoc per page.
- **A more structured backend** — Spring Security + Spring Data JPA + Flyway-managed schema in place of hand-rolled Express middleware, with sessions, cart, favorites, and chat history all persisted server-side in Postgres rather than leaning on `localStorage`.
- **Kafka event publishing and Artillery load testing, carried over from the original** — auth, order, and inventory events publish to Kafka (opt-in, off by default) and a logging listener proves the pipeline works end to end; a new Artillery suite load-tests browsing, repeated failed logins, and the full checkout flow. Running that suite is what surfaced — and got fixed — three real concurrency bugs in the checkout/cart-write code. See [Kafka events](#kafka-events) and [Load testing](#load-testing).

A few other original RetailForge concepts still haven't made the jump — see [Roadmap](#roadmap) for what's still ahead.

---

## 📌 Table of Contents

- [Notable improvements](#notable-improvements)
- [Current stack](#current-stack)
- [What is implemented now](#what-is-implemented-now)
- [Architecture highlights](#architecture-highlights)
- [Roadmap](#roadmap)
- [Project structure](#project-structure)
- [Local requirements](#local-requirements)
- [Environment files](#environment-files)
- [Quick start](#quick-start)
- [App routes](#app-routes)
- [Auth](#auth)
- [AI chat assistant](#ai-chat-assistant)
- [Payments](#payments)
- [Kafka events](#kafka-events)
- [Load testing](#load-testing)
- [Media and image handling](#media-and-image-handling)
- [Database and migrations](#database-and-migrations)
- [Development commands](#development-commands)
- [Security / local dev notes](#security--local-dev-notes)
- [Related docs](#related-docs)
- [Screenshots](#screenshots)

---

<a id="current-stack"></a>

## 🧰 Current stack

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
- Spring for Apache Kafka (`spring-kafka`) — opt-in event publishing/consumption
- PostgreSQL

### Infrastructure

- PostgreSQL, backend, and frontend via `docker-compose.yml`, each as its own container
- Apache Kafka 3.8.0 via `docker-compose.yml`, KRaft mode, opt-in via the `kafka` Compose profile
- Artillery (HTTP load testing, `load-testing/`)
- Maven Wrapper for backend builds
- npm for frontend builds

---

<a id="what-is-implemented-now"></a>

## ✅ What is implemented now

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

### Observability & load testing

- Kafka event publishing for auth, order, and inventory changes — opt-in, off by default — see [Kafka events](#kafka-events)
- Artillery HTTP load-testing suite covering anonymous browsing, repeated failed logins, and the full checkout flow — see [Load testing](#load-testing)

---

<a id="architecture-highlights"></a>

## 🧠 Architecture highlights

A few decisions worth calling out beyond the feature list above:

- **Server-persisted everything**: auth sessions, cart, favorites, and chat history all live in Postgres via Spring Session JDBC / JPA rather than `localStorage`, so state survives refreshes and works the same across tabs/devices.
- **Role-aware AI assistant**: the same floating chat widget serves shoppers and admins, but the backend only exposes admin tools (inventory levels, top sellers, order status breakdown) to `manager`/`employee` sessions — the tool set is gated server-side, not just hidden in the UI.
- **Consistent admin CRUD shell**: every admin entity (departments, categories, products, users, orders, reviews) shares the same dashboard pattern — searchable/filterable card grid, pagination, CSV export, and CSV bulk upload with a template download and row preview.
- **Stock-safe checkout**: Stripe's `<Elements>` flow creates a PaymentIntent first, then finalizes the order (and its line items) server-side via `/api/payment/complete-checkout`, keeping payment confirmation and order creation as separate, auditable steps.
- **One design language across pages**: content-hugging summary tiles (no oversized cells for short values), uncropped product thumbnails (`object-fit: contain` in a padded frame), and a shared "back to …" link pattern are used consistently across the customer account pages and admin detail pages.

---

<a id="roadmap"></a>

## 🚧 Roadmap

A few original RetailForge concepts haven't been carried over to this rebuild yet — they're next up:

- Password reset / email verification flows
- Rate limiting on the public chat endpoint
- Production-hardened Stripe key management (see [Security / local dev notes](#security--local-dev-notes))
- Broader automated test coverage across the newer order/payment/chat flows

---

<a id="project-structure"></a>

## 🏗️ Project structure

```text
RetailForge2/
├─ frontend/                 React + TypeScript app
├─ backend/                  Spring Boot app
├─ load-testing/             Artillery HTTP load-testing scenarios
├─ docs/                     setup notes and project-specific docs
├─ docker-compose.yml        PostgreSQL, backend, frontend, and optional Kafka services
└─ .env.example              root environment example
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
- `backend/src/main/java/.../config/` - Spring config, including Kafka producer/consumer and topic setup
- `backend/src/main/java/.../events/` - Kafka event record definitions (auth, order, inventory)
- `backend/src/main/resources/db/migration/` - Flyway migrations
- `backend/media/` - local media storage for uploaded/shared product and avatar images

---

<a id="local-requirements"></a>

## 🧩 Local requirements

- Docker Desktop / Docker Compose (runs PostgreSQL, backend, frontend, and optionally Kafka)
- Node.js + npm
- Java 25

The backend `pom.xml` currently targets Java `25`, so use a matching JDK when running the Spring Boot app locally.

---

<a id="environment-files"></a>

## 🔑 Environment files

The repo includes:

- root example: `.env.example`
- frontend example: `frontend/.env.example`
- backend AI key template: `backend/application-secrets.properties.example`

### Root `.env.example`

- `POSTGRES_DB=retailforge2`
- `POSTGRES_USER=retailforge2_user`
- `POSTGRES_PASSWORD=retailforge2_dev_password`
- `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5434/retailforge2`
- `SPRING_DATASOURCE_USERNAME=retailforge2_user`
- `SPRING_DATASOURCE_PASSWORD=retailforge2_dev_password`
- `KAFKA_ENABLED=false` (opt-in — see [Kafka events](#kafka-events))
- `KAFKA_BOOTSTRAP_SERVERS=kafka:9092`
- `KAFKA_CLIENT_ID=retailforge2-backend`
- `KAFKA_CONSUMER_GROUP_ID=retailforge2-backend`
- `KAFKA_TOPIC_ORDERS=rf2.orders`
- `KAFKA_TOPIC_AUTH=rf2.auth`
- `KAFKA_TOPIC_INVENTORY=rf2.inventory`
- `LOW_STOCK_THRESHOLD=5`

### Frontend `frontend/.env.example`

- `VITE_API_BASE_URL=http://localhost:8080`
- You will also need `VITE_STRIPE_PUBLISHABLE_KEY` set locally (not yet listed in `.env.example`) for the checkout page's Stripe Elements provider to initialize.

### Backend AI keys

- Copy `backend/application-secrets.properties.example` to `backend/application-secrets.properties` (gitignored) and set `spring.ai.openai.api-key` to a real key.
- The active chat provider is controlled by `spring.ai.model.chat` in `application.properties` (currently `openai`; can be switched to `anthropic` since both starters are on the classpath).

You can copy the root/frontend examples into local `.env` files if you want, but keep real local overrides uncommitted.

---

<a id="quick-start"></a>

## ⚙️ Quick start

### Full stack via Docker (recommended)

Copy `.env.example` to `.env` in the project root and fill in real values (see [Environment files](#environment-files)), then from the project root:

```powershell
docker compose up --build -d
```

This builds and starts PostgreSQL, the backend, and the frontend as containers:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5434`

Check everything came up healthy with `docker compose ps`. To also start Kafka (event publishing/consumption — see [Kafka events](#kafka-events)), set `KAFKA_ENABLED=true` in `.env` and add the `kafka` Compose profile:

```powershell
docker compose --profile kafka up --build -d
```

A plain `docker compose up --build -d` (no `--profile` flag) never starts the Kafka container, and the rest of the stack is unaffected by its presence or absence.

### Local development (without full Docker)

For faster iteration (hot reload) on the backend or frontend, run PostgreSQL only via Docker and the app processes directly:

**1. Start PostgreSQL**

```powershell
docker compose up -d postgres
```

By default, PostgreSQL is exposed on `localhost:5434` and uses the `retailforge2` database.

**2. Start the backend**

From the `backend` folder:

```powershell
Set-Location .\backend
.\mvnw.cmd spring-boot:run
```

Current backend defaults from `backend/src/main/resources/application.properties`:

- app port: `8080`
- datasource: `jdbc:postgresql://localhost:5434/retailforge2`
- media root: `${user.dir}/media`

Important: start the backend from the `backend` folder so `${user.dir}/media` resolves to `backend/media`. Make sure `application-secrets.properties` exists if you want the AI chat assistant to work locally. Kafka publishing stays off automatically unless you also start the `kafka` container and set `KAFKA_ENABLED=true`.

**3. Start the frontend**

From the `frontend` folder:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8080` unless `VITE_API_BASE_URL` is overridden.

---

<a id="app-routes"></a>

## 🗺️ App routes

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

---

<a id="auth"></a>

## 🔐 Auth

Authentication is now backend-persisted rather than frontend-local:

- Spring Security handles login/logout with BCrypt-hashed passwords
- Sessions are stored server-side via Spring Session JDBC (cookie-based; the frontend sends `credentials: include` and the backend CORS config allows `http://localhost:5173` with credentials)
- Roles: `CUSTOMER`, `MANAGER`, `EMPLOYEE` (`UserRole` enum) — the admin catalog routes require `MANAGER` or `EMPLOYEE`
- Demo users are seeded via the `V6__seed_demo_users.sql` Flyway migration
- Register signs the user in immediately after account creation, and the navbar switches between guest actions and an authenticated account menu

---

<a id="ai-chat-assistant"></a>

## 🤖 AI chat assistant

A floating chat widget (`ChatWidget.tsx`) is available site-wide for both guests and logged-in users, powered by **OpenAI through Spring AI** (Anthropic Claude is also wired up and can be swapped in via config — see [Environment files](#environment-files)):

- Chat history is session-scoped and persisted server-side (`chat_sessions` table plus Spring AI's JDBC-backed chat memory tables)
- Guests get their own recent-chats list, scoped by a guest session key; logged-in users get theirs scoped by user id, and can revisit or switch between past conversations from the widget's recent-chats panel
- Shopper-facing tools: product search, cart/favorites management, order lookup (including the items purchased in a given order), popular products, product reviews
- Admin-only extra tools (when logged in as `manager`/`employee`): top sellers, current inventory, out-of-stock/low-stock products, order status breakdown

See it in action in the [Screenshots](#screenshots) section below.

---

<a id="payments"></a>

## 💳 Payments

Checkout uses Stripe, similar to the original project:

- The frontend wraps `CheckoutPage` in Stripe's `<Elements>` provider using `VITE_STRIPE_PUBLISHABLE_KEY`
- The backend creates a PaymentIntent via `/api/payment/create-payment-intent` and finalizes the order (creating the order + order items) via `/api/payment/complete-checkout`

---

<a id="kafka-events"></a>

## 📡 Kafka events

RetailForge2 optionally publishes domain events to Kafka — off by default (`KAFKA_ENABLED=false`), so the app runs exactly the same with or without a broker present.

- **Auth events** (`rf2.auth`) — published on every login attempt (success or failure) and successful registration
- **Order events** (`rf2.orders`) — published when a checkout completes (`PaymentService.completeCheckout`)
- **Inventory events** (`rf2.inventory`) — published whenever a product's stock changes, whether from an admin create/update/bulk-upload or from a checkout decrementing stock; flags whether the new level is at or below `LOW_STOCK_THRESHOLD`

A `KafkaEventListener` subscribes to all three topics and logs what arrives, demonstrating the full publish → broker → consume pipeline end to end. Nothing else currently reacts to these events — they're a foundation for future consumers (an email alert, a dashboard, etc.), not a finished feature in their own right.

### Enabling Kafka

1. Set `KAFKA_ENABLED=true` in your `.env`
2. Start the stack with the `kafka` Compose profile:

   ```powershell
   docker compose --profile kafka up --build -d
   ```

3. Watch events arrive in the backend logs:

   ```powershell
   docker compose logs backend --tail=100 -f
   ```

See [Environment files](#environment-files) for the full list of `KAFKA_*` variables (bootstrap servers, client/group ids, topic names) and `LOW_STOCK_THRESHOLD`.

---

<a id="load-testing"></a>

## 🧪 Load testing

An [Artillery](https://www.artillery.io/) HTTP load-testing suite lives in `load-testing/`, covering three scenarios against a running backend:

| Command | Scenario |
|---|---|
| `npm run test:browse` | Anonymous catalog browsing |
| `npm run test:login-failed` | Repeated failed logins (verifies BCrypt's intentional slowness doesn't break under load) |
| `npm run test:checkout` | Full journey: register a fresh account → add to cart → create a Stripe payment intent → complete checkout |

`test:checkout` registers a brand-new account per virtual user (rather than sharing one login), so virtual users don't contend over a single cart. Each run adds one new row to the `users` table — fine for a local dev database, worth knowing before pointing this at anything shared.

### Running the suite

```powershell
Set-Location .\load-testing
npm install
npm run test:browse
npm run test:login-failed
npm run test:checkout
```

Requires the backend running and reachable at `http://localhost:8080` (see [Quick start](#quick-start)). This suite is what surfaced three real concurrency bugs in the checkout/cart-write paths under load — all fixed; see the commit history for details.

---

<a id="media-and-image-handling"></a>

## 🖼️ Media and image handling

Product/media setup uses the backend-level `media` folder:

- `backend/media/product_images/`
- `backend/media/other_images/`

The backend serves these as public files through:

- `/images/product_images/<filename>`
- `/images/other_images/<filename>`

The default fallback image path used by the frontend is:

- `/images/other_images/dummy_product.jpg`

See `docs/admin-products-media-setup.md` for the current media workflow and CSV image path rules.

---

<a id="database-and-migrations"></a>

## 🗄️ Database and migrations

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

---

<a id="development-commands"></a>

## 🛠️ Development commands

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

### Load testing

```powershell
Set-Location .\load-testing
npm install
npm run test:browse
npm run test:login-failed
npm run test:checkout
```

See [Load testing](#load-testing) for details.

---

<a id="security--local-dev-notes"></a>

## 🛡️ Security / local dev notes

- CORS is restricted to `http://localhost:5173` with credentials enabled (required for session cookies) — this is tighter than a permissive "allow all localhost" setup
- Public (unauthenticated) reads are allowed for products/categories/departments/reviews and the chat endpoints; writes require authentication, and catalog admin writes require the `MANAGER` or `EMPLOYEE` role
- **Note:** `application.properties` currently contains hardcoded Stripe *test-mode* keys (`sk_test_...` / `pk_test_...`). These should be moved to `application-secrets.properties` (gitignored) or environment variables before a production deployment, the same way the AI provider API keys are already handled
- Do not commit local `.env` or `application-secrets.properties` files with real secrets, or generated output such as `frontend/dist/`, `frontend/node_modules/`, `backend/target/`, or `load-testing/node_modules/`
- If Docker volumes already contain older database state, review `docs/postgres-setup.md` before resetting or recreating the database
- The `test:checkout` load-testing scenario registers a new account per virtual user, so repeated runs accumulate rows in the `users` table — fine for local dev, but don't point it at a shared/production database

---

<a id="related-docs"></a>

## 📚 Related docs

- `docs/postgres-setup.md` - PostgreSQL + Docker setup details
- `docs/admin-products-media-setup.md` - product admin image/media setup notes

---

<a id="screenshots"></a>

## 📸 Screenshots

Screenshots are grouped by who's looking at the app — a guest browsing without an account, a signed-in customer, and a signed-in admin/manager — plus a dedicated group showing the AI store assistant itself in action. Click a group to expand it.

<details open>
<summary><strong>🌐 Not signed in</strong></summary>

#### `HomePage.tsx` · `/`
The public landing page — a showcase of featured products and category entry points for visitors who haven't signed in yet.

<img width="1918" height="989" alt="image" src="https://github.com/user-attachments/assets/e047e9a5-df4f-442d-b9b2-40a1064c792c" />
<img width="1918" height="991" alt="image" src="https://github.com/user-attachments/assets/3611aa00-d6f4-4742-929a-9b02037f9d08" />
<img width="1914" height="990" alt="image" src="https://github.com/user-attachments/assets/557bf85a-f5ed-4c29-b894-db449a428df5" />

#### `ProductsPage.tsx` · `/products`
The storefront product listing, with search, category/department filters, sorting, and pagination — fully browsable as a guest.

<img width="1918" height="991" alt="image" src="https://github.com/user-attachments/assets/977c8312-f6a8-423c-ae38-0909c4b167ea" />
<img width="1919" height="995" alt="image" src="https://github.com/user-attachments/assets/f41f5990-7043-40e5-b175-a5db82834a69" />

#### `ProductInfoPage.tsx` · `/products/:id`
The product detail page, showing full product info alongside customer reviews for that product.

<img width="1917" height="989" alt="image" src="https://github.com/user-attachments/assets/956d6f0a-767c-4edc-9fc2-25e4dabc48e5" />
<img width="1917" height="991" alt="image" src="https://github.com/user-attachments/assets/af24d706-70b4-4f57-8168-c0315938d357" />

#### `AuthPage.tsx` — Login · `/login`
The merged authentication page's login tab, backed by real backend sessions rather than frontend-only auth.

<img width="1916" height="988" alt="image" src="https://github.com/user-attachments/assets/b8bd7e31-9556-450d-8af9-1302aa97b48a" />

#### `AuthPage.tsx` — Register · `/register`
The registration tab of the same page — creates an account and signs the user in immediately afterward.

<img width="1918" height="991" alt="image" src="https://github.com/user-attachments/assets/af3e40c4-b707-4dac-9016-138ff066ddec" />

</details>

<details>
<summary><strong>🙋 Customer signed in</strong></summary>

#### `HomePage.tsx` · `/`
The same landing page, now rendered for an authenticated customer — the navbar switches to an account menu and cart access.

<img width="1917" height="987" alt="image" src="https://github.com/user-attachments/assets/29dd15d3-f25f-4337-a2fd-ba7608206245" />
<img width="1916" height="992" alt="image" src="https://github.com/user-attachments/assets/c809ba33-e815-44f2-903b-8ebe983b8f83" />

#### `MyProfilePage.tsx` · `/my-profile`
The customer's account profile, including avatar upload and personal details.

<img width="1917" height="990" alt="image" src="https://github.com/user-attachments/assets/4ab10170-5211-464c-80b7-2e164cebd3cc" />

#### `MyOrdersPage.tsx` · `/my-orders`
Order history for the signed-in customer — past orders with status, date, and total at a glance.

<img width="1917" height="989" alt="image" src="https://github.com/user-attachments/assets/a865513f-8e0a-4d51-9065-0439f8d527ec" />
<img width="1916" height="991" alt="image" src="https://github.com/user-attachments/assets/0a22fada-e350-4cdc-9e5c-4d5a217c96c8" />

#### `OrderDetailsPage.tsx` · `/order-details/:id`
The full detail view for a single order, including purchased items with images, shipping address, and order status.

<img width="1919" height="989" alt="image" src="https://github.com/user-attachments/assets/9567bcab-2bc6-4467-b2ba-132a8968319c" />
<img width="1917" height="989" alt="image" src="https://github.com/user-attachments/assets/9beb9cda-379e-4f92-bb20-5165315755ad" />

#### `MyReviewsPage.tsx` · `/my-reviews`
Where customers can view, edit, or delete the reviews they've written for products they've purchased.

<img width="1917" height="991" alt="image" src="https://github.com/user-attachments/assets/f9f1b9ea-57ac-4227-b590-2585474ec51b" />
<img width="1915" height="990" alt="image" src="https://github.com/user-attachments/assets/56e3ef9e-9a08-4f18-938f-6ce3e0487778" />

#### `MyFavoritesPage.tsx` · `/my-favorites`
Saved/favorited products the customer has bookmarked for later.

<img width="1919" height="989" alt="image" src="https://github.com/user-attachments/assets/14d9d412-1c1e-4a3c-8c0b-88c31fdb7104" />
<img width="1916" height="992" alt="image" src="https://github.com/user-attachments/assets/da73496d-af27-491f-a366-56e9d97fa480" />

</details>

<details>
<summary><strong>🛠️ Admin (Manager) signed in</strong></summary>

#### `HomePage.tsx` · `/`
The landing page as seen by a manager/employee account — the navbar now exposes the Admin menu.

<img width="1916" height="988" alt="image" src="https://github.com/user-attachments/assets/10b6e445-5f06-4001-91c7-70671df3f0dd" />

#### `AdminDepartmentPage.tsx` — Dashboard · `/admin/departments`
Department management: a searchable, filterable, paginated list of all departments with edit/delete actions.

<img width="1918" height="989" alt="image" src="https://github.com/user-attachments/assets/6749e883-6f2c-4937-85c0-c17e53a02f9c" />
<img width="1917" height="992" alt="image" src="https://github.com/user-attachments/assets/77edc53c-3fdf-4204-bcf4-2f7bc44f0ed7" />

#### `AdminDepartmentPage.tsx` — Add Department · `/admin/departments`
The department creation form, plus CSV bulk upload for adding multiple departments at once.

<img width="1916" height="990" alt="image" src="https://github.com/user-attachments/assets/b39e8bc2-b4bc-4e22-8649-06b3cd2953eb" />

#### `AdminCategoriesPage.tsx` — Dashboard · `/admin/categories`
Category management dashboard, mirroring the department dashboard's search/filter/edit/delete flow.

<img width="1916" height="987" alt="image" src="https://github.com/user-attachments/assets/7eecbc22-cab0-4672-b24e-02638052972c" />
<img width="1919" height="987" alt="image" src="https://github.com/user-attachments/assets/8de6fc34-3272-4274-a484-f0964b4c66a9" />

#### `AdminCategoriesPage.tsx` — Add Category · `/admin/categories`
Category creation form with CSV bulk upload support.

<img width="1919" height="985" alt="image" src="https://github.com/user-attachments/assets/7352ce06-9b2b-403c-b5cf-4d7437252888" />

#### `AdminProductsPage.tsx` — Dashboard · `/admin/products`
Product management dashboard covering the full catalog, with search/filter and per-product image handling.

<img width="1919" height="989" alt="image" src="https://github.com/user-attachments/assets/2522713f-9b79-459c-acf0-40720f72851c" />
<img width="1916" height="989" alt="image" src="https://github.com/user-attachments/assets/672ba896-8cd7-40ba-9cf4-8993f882fc08" />

#### `AdminProductsPage.tsx` — Add Product · `/admin/products`
Product creation form supporting a multipart image upload alongside CSV bulk upload for adding many products at once.

<img width="1916" height="990" alt="image" src="https://github.com/user-attachments/assets/fed33bc8-ebb5-43ab-8cbc-d6dfbe43fef6" />
<img width="1919" height="991" alt="image" src="https://github.com/user-attachments/assets/29c691c2-3de4-4d2c-aa1f-2f2c5647a9f3" />

#### `AdminOrdersPage.tsx` · `/admin/orders`
Orders management dashboard — clickable order cards showing the customer, status, item count, and total for every order in the store.

<img width="1917" height="987" alt="image" src="https://github.com/user-attachments/assets/a57a24f0-463e-475d-bd24-d50f69d43b3f" />
<img width="1915" height="985" alt="image" src="https://github.com/user-attachments/assets/0e364a53-ea38-4ff8-b41a-7d8745e81bfa" />

#### `AdminOrderDetailPage.tsx` · `/admin/orders/:id`
The admin's order detail view — update order status, review purchased items, and export the order to CSV.

<img width="1918" height="988" alt="image" src="https://github.com/user-attachments/assets/a425fe30-fe57-40f1-a937-ad977f682c03" />

#### `AdminUsersPage.tsx` — Dashboard · `/admin/users`
User management dashboard listing every account, its role, and avatar, with edit/delete actions.

<img width="1918" height="987" alt="image" src="https://github.com/user-attachments/assets/c86326a4-1ad0-4f7c-951b-3e0a26edb2c3" />
<img width="1919" height="989" alt="image" src="https://github.com/user-attachments/assets/f6a0cc71-8169-4816-8961-1c6db8b44756" />

#### `AdminUsersPage.tsx` — Add User · `/admin/users`
User creation form including role assignment and avatar upload, plus CSV bulk upload.

<img width="1918" height="989" alt="image" src="https://github.com/user-attachments/assets/4f296ce5-1c98-448d-847d-d68ca41a96f4" />
<img width="1916" height="992" alt="image" src="https://github.com/user-attachments/assets/cf690eda-6823-47ce-b5df-5125c0182271" />

#### `AdminReviewsPage.tsx` — Dashboard · `/admin/reviews`
Review moderation dashboard covering every review left across the store, with edit/delete actions.

<img width="1918" height="986" alt="image" src="https://github.com/user-attachments/assets/ee54158b-eac5-4346-a666-1689df8a8679" />
<img width="1918" height="990" alt="image" src="https://github.com/user-attachments/assets/d348f53b-3c50-4319-b121-afad5d630391" />

#### `AdminReviewsPage.tsx` — Add Review · `/admin/reviews`
Form for an admin to add or edit a review on a customer's behalf, plus CSV bulk upload.

<img width="1917" height="990" alt="image" src="https://github.com/user-attachments/assets/80a1319c-570e-463d-9e32-ad564077dda3" />
<img width="1917" height="990" alt="image" src="https://github.com/user-attachments/assets/29713c74-2ea0-4d13-94c3-ff3c1f3c8d73" />

</details>

<details>
<summary><strong>🤖 AI store assistant in action</strong></summary>

#### `ChatWidget.tsx` — Admin/Manager session
Logged in as a manager, asking for sales and inventory insight — an admin-only tool the assistant only exposes because the backend recognizes the `manager`/`employee` role, not because the UI happens to hide a button.

<img width="1916" height="988" alt="image" src="https://github.com/user-attachments/assets/dcabd27e-a7b5-4eab-bd60-7153929a9113" />

#### `ChatWidget.tsx` — Customer session
Logged in as a shopper, asking about a recent order — the assistant pulls real order data, including status and every item purchased in it, straight from the database.

<img width="1917" height="991" alt="image" src="https://github.com/user-attachments/assets/1ba6a21f-4b6f-47f3-9a5f-ba125ab736be" />

#### `ChatWidget.tsx` — Recent chats panel
Past conversations are session-scoped and persisted server-side, so they're still there after a refresh or a return visit — for guests and logged-in users alike.

<img width="1917" height="989" alt="image" src="https://github.com/user-attachments/assets/c68319e8-c093-4eb9-812a-e8c3285af952" />

</details>

