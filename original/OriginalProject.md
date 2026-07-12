# RetailForge

A full-stack e-commerce platform for a modern department store, built with the PERN stack (PostgreSQL, Express, React, Node.js). This project features a robust backend API, a beautiful React frontend, and a normalized SQL database. It supports user authentication, shopping cart, Stripe payments, product reviews, and a full admin dashboard.

---

## 📌 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture Highlights](#architecture-highlights)
- [Pages (with screenshots)](#pages-with-screenshots)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup-installation)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [CSV Export & Bulk Upload (Admin)](#csv-export-bulk-upload-admin)
- [Security & Best Practices](#security-best-practices)
- [Contributing](#contributing)
- [Planned Features](#planned-features)
- [Contact](#contact)

---

<a id="tech-stack"></a>

## 🧰 Tech Stack

- **Frontend**: React + Vite, React Router, Context API (auth/theme/cart/favorites)
- **Backend**: Node.js + Express (REST API)
- **Database**: PostgreSQL (normalized schema + migrations)
- **Payments**: Stripe (Elements)
- **Auth**: Session-based authentication (HTTP-only cookies)
- **Tooling**:
    - **Artillery** load-testing scenarios (browse/login/checkout)
    - **Kafka** (optional) for event-driven workflows (orders/auth/inventory)

---

<a id="features"></a>

## 🚀 Features

### 🎨 Theme

- **Light/Dark Mode Toggle**: Switch themes from the navbar
- **Persisted Preference**: Saves your choice in localStorage and respects system preference on first load

### 🛒 Customer Features

- **Modern Home Page Carousel**: Larger, readable product cards in a horizontal showcase (supports mouse drag-to-scroll) with favorites + rating and click-through to product details
- **Browse Products**: View, search, and filter products by department and category
- **Advanced Search (Compact)**: Collapsible filter panel with search + sort + order
- **Dependent Filters**: Category options depend on selected Department
- **Product Details (Modernized)**: Improved dark-mode visuals, fixed-size product image frame (shows full image), availability status based on stock, and description formatting that preserves paragraphs/newlines
- **Shopping CartPage**: Add, update, and remove items; persistent across sessions
- **Stock-Aware CartPage**: CartPage add/update prevents exceeding available stock and surfaces friendly errors when stock is insufficient
- **Checkout**: Secure Stripe payment integration
- **Stock-Safe Checkout**: Product stock is decremented atomically during checkout; checkout fails gracefully if stock is insufficient
- **Order Confirmation**: Receipt page after successful purchase
- **My Orders (Modernized)**: Browse past orders with pagination + advanced search; click an order card to open details
- **Order Details (Customer)**: Modern order details page with order summary + itemized line items and a consistent “Back to My Orders” button
- **My Favorites**: Save products you like and manage them from a dedicated page
- **Stable Favorites Page**: Fixed runtime crash and improved favorites rendering flow
- **My Reviews**: View, edit, and delete the reviews you’ve written
- **My Profile**: View and edit your account info, plus upload your own avatar image
- **User Registration & Login**: Secure session-based authentication
- **Leave Reviews**: Authenticated users can review products

### 🛠️ Admin/Manager Features

- **Admin Dashboard**: Manage departments, categories, products, users, and reviews
- **CRUD Operations**: Create, update, and delete all entities
- **Advanced Search Everywhere (Admin)**: Orders, Products, Users, Reviews, Departments, and Categories include Search + Sort + Order
- **Default Sort Order**: Search panels default to **Ascending** order for consistency
- **Admin Products UX Improvements**: Product rows are clickable to navigate to product details; description column removed from the list view while preserving Edit/Delete actions
- **Order Management (Modernized)**: View all orders in the system with customer email + avatar, search/filter by status, and inspect order details with product images
- **CSV Export (Admin)**: Download CSV exports from admin list pages (Departments, Categories, Products, Users, Reviews, Orders)
- **Bulk Upload (Admin)**: Upload CSV files to bulk-create Departments, Categories, Products, Users, and Reviews (includes preview + template download)
- **Orders: Details + Actions Columns**: View stays under Details; Edit/Delete are grouped under Actions
- **Order Status Edit Flow**: “Edit” opens details in edit mode for updating status
- **Modern Admin UI**: Icon-based action buttons and consistent spacing across admin tables
- **Role-Based Access**: Only managers/admins can access admin routes
- **Refresh-Safe Auth**: Admin pages remain accessible after refresh thanks to robust session hydration

### 🗄️ Database

- **PostgreSQL**: Normalized schema with migrations for all tables (users, products, orders, reviews, etc.)
- **Product Metadata**: Products support additional fields like `brand` and `rating`
- **Long Descriptions Supported**: `products.description` is stored as `TEXT` to support multi-paragraph descriptions
- **Secure Sessions**: Sessions stored in the database for persistence
- **Seed Data**: (Recommended) Add demo data for quick setup

---

<a id="architecture-highlights"></a>

## 🧠 Architecture Highlights

- **Consistent UI shell**: Sticky navbar + global footer across all routes
- **Modern list UX**: Responsive card grids + pagination + reusable advanced search panels
- **Stock correctness**: Checkout decrements stock atomically and prevents overselling under concurrency
- **Operational confidence**: Artillery load tests validate behavior under many concurrent sessions
- **Event visibility (optional)**: Kafka worker subscribes to order/auth/inventory topics and logs events

---

<a id="pages-with-screenshots"></a>

## 🗺️ Pages (with screenshots)

All pages share a consistent **sticky header (Navbar)** and **global footer** for navigation and theme toggling.

> Note: These screenshots are embedded using GitHub `user-attachments` links.

### Home (`/`)

**Purpose**

- Landing page for browsing and discovery.

**What you can do**

- See a modern product showcase carousel with quick actions (favorites + rating) and click-through to product details.
- Browse featured items quickly, in both light and dark modes.

**Screenshots**

Home (Not signed in):
<img width="959" height="457" alt="Home (not signed in)" src="https://github.com/user-attachments/assets/2d8306a9-2f5a-4b79-ad3f-d0e35f8a5579" />

<img width="959" height="454" alt="Home (not signed in) - showcase" src="https://github.com/user-attachments/assets/ccf6a85e-ae6e-49bd-b32b-cb4317541c3d" />

Home (Customer signed in):
<img width="959" height="457" alt="Home (signed in)" src="https://github.com/user-attachments/assets/3bab98e1-32e1-434a-bac9-24c37f94e192" />

---

### Login (`/login`)

**Purpose**

- Sign in to access customer features (favorites, orders, reviews, profile) and admin routes (for managers/admins).

**What you can do**

- Authenticate via session-based login.
- Redirect back to the page you originally tried to access.

**Screenshot**
<img width="959" height="453" alt="Login" src="https://github.com/user-attachments/assets/4b417ad1-7cd5-4690-aa34-9fe25c973103" />

---

### Register (`/register`)

**Purpose**

- Create a new customer account.

**What you can do**

- Register with profile details (name, email, password, phone, address).
- Redirect back to the page you originally tried to access.

**Screenshot**
<img width="957" height="455" alt="Register" src="https://github.com/user-attachments/assets/3bd3474b-f64b-4018-9872-7e1a1feb4fc7" />

---

### Products (`/products`)

**Purpose**

- Main shopping catalog.

**What you can do**

- Browse products in a responsive grid.
- Use advanced search (search + sort + order) and dependent Department → Category filtering.
- Paginate results (8 per page) to keep the UI fast and readable.

**Screenshots**
<img width="959" height="455" alt="Products - grid" src="https://github.com/user-attachments/assets/f4dde548-9dab-4239-8816-0dd75ca6e2f8" />

<img width="958" height="452" alt="Products - advanced search" src="https://github.com/user-attachments/assets/61ee4c17-d180-444f-a3fe-fb5b672ca619" />

---

### Product Details (`/products/:id`)

**Purpose**

- Product detail view for purchasing decisions.

**What you can do**

- See product image in a fixed-size frame (show full image without distortion).
- View stock/availability status and description formatting that preserves paragraphs/newlines.
- Favorite a product and leave reviews (authenticated users).

**Screenshots**
<img width="959" height="455" alt="Product details" src="https://github.com/user-attachments/assets/6af2373c-59c4-498e-ad07-916e38a8351e" />

<img width="959" height="458" alt="Product details - reviews" src="https://github.com/user-attachments/assets/9d3234d2-f138-451b-a689-4dd5e5b5b563" />

---

### Shopping CartPage (`/cart`)

**Purpose**

- Review items before checkout.

**What you can do**

- Add, update, and remove items.
- See stock-aware validations so quantities can’t exceed available inventory.

**Screenshot**
<img width="959" height="452" alt="Shopping cart" src="https://github.com/user-attachments/assets/8ca94b91-8ba6-4609-a896-19e76f04bb60" />

---

### Checkout (`/checkout`)

**Purpose**

- Secure payment flow.

**What you can do**

- Pay via Stripe Elements.
- Checkout is stock-safe: stock is decremented atomically and fails gracefully if inventory is insufficient.

**Screenshot**
<img width="958" height="452" alt="Checkout" src="https://github.com/user-attachments/assets/5351081e-e32c-46df-937c-191eb74a5669" />

---

### Order Confirmation (`/order-confirmation`)

**Purpose**

- Receipt page shown after successful payment.

**What you can do**

- Confirm purchase completion and see summary details.

**Screenshot**
<img width="960" height="455" alt="Order confirmation" src="https://github.com/user-attachments/assets/5b95378c-fb73-4d3f-8cd5-94185cdbcec8" />

---

### My Profile (`/my-profile`)

**Purpose**

- Manage your account.

**What you can do**

- View and edit account information.
- Upload and display a user avatar.

**Screenshot**
<img width="959" height="457" alt="My profile" src="https://github.com/user-attachments/assets/3a7c3cdf-ebe0-4875-b844-1f0f3f442d78" />

---

### My Orders (`/my-orders`)

**Purpose**

- View your order history.

**What you can do**

- Browse past orders with pagination and advanced search.
- Click an order card to open order details (items, quantities, totals).

**Screenshots**
<img width="959" height="458" alt="My orders" src="https://github.com/user-attachments/assets/35c85520-3b9f-45c7-bfac-2e89f368845a" />

<img width="960" height="457" alt="My orders - filters" src="https://github.com/user-attachments/assets/d1ef720c-38b3-40a6-ae1d-e2344da5715e" />

---

### Order Details (`/order-details/:id`)

**Purpose**

- View a single order in full detail.

**What you can do**

- Review key order metadata (status, total, date, shipping address).
- See itemized line items with product images and links to product pages.
- Return to **My Orders** using a consistent back button.

**Screenshot**
<img width="958" height="452" alt="My order details" src="https://github.com/user-attachments/assets/c80888ee-d09a-45e2-bf7d-5c252979a333" />

---

### My Reviews (`/my-reviews`)

**Purpose**

- Manage reviews you’ve written.

**What you can do**

- Search/filter your reviews and paginate results.
- Edit or delete your reviews.

**Screenshots**
<img width="959" height="455" alt="My reviews" src="https://github.com/user-attachments/assets/1bb7420f-64b7-4c9e-a291-9202e5b5c97d" />

<img width="959" height="455" alt="My reviews - filters" src="https://github.com/user-attachments/assets/77a582fc-1a77-439b-84e7-ef792fb6ced1" />

---

### My Favorites (`/my-favorites`)

**Purpose**

- Quick access to saved items.

**What you can do**

- View favorites in a responsive grid with pagination (8 per page).
- Navigate to product details or remove favorites.

**Screenshot**
<img width="958" height="457" alt="My favorites" src="https://github.com/user-attachments/assets/2a4acc67-8252-4fd0-97a7-b34107545ead" />

---

## 🔐 Admin / Manager Pages

Admin pages are restricted to **managers/admins** and are optimized for large datasets:

- Responsive **card grids** with pagination (6 per page)
- Advanced search panels (search + sort + order)
- Clickable cards where appropriate
- CSV export support

### Admin Departments (`/admin/departments`)

**What you can do**

- Create, edit, delete departments.
- Export as CSV.

**Screenshots**
<img width="956" height="451" alt="Admin departments" src="https://github.com/user-attachments/assets/578e4f07-0167-4dfa-897e-901988a593c5" />

Upsert Department (`/admin/departments/upsert`):
<img width="957" height="452" alt="Admin departments upsert" src="https://github.com/user-attachments/assets/d0c49269-e6d4-4cb1-b2c1-18896c4b195b" />

---

### Admin Categories (`/admin/categories`)

**What you can do**

- Create, edit, delete categories.
- Export as CSV.

**Screenshots**
<img width="959" height="457" alt="Admin categories" src="https://github.com/user-attachments/assets/d8eb007e-c049-4141-9fab-a9df1784f9c2" />

<img width="959" height="455" alt="Admin categories - filters" src="https://github.com/user-attachments/assets/f0f14b6c-2252-4ee4-ac06-986f16a8f5a3" />

Upsert Category (`/admin/categories/upsert`):
<img width="956" height="455" alt="Admin categories upsert" src="https://github.com/user-attachments/assets/2d3abfa8-cf1f-4131-a717-620365acee97" />

---

### Admin Products (`/admin/products`)

**What you can do**

- Manage the product catalog (create/edit/delete).
- Click a product card to navigate to product details.
- Export as CSV.

**Screenshots**
<img width="959" height="458" alt="Admin products" src="https://github.com/user-attachments/assets/94375a9d-c969-46d0-a217-88dd7fdbbc2f" />

<img width="959" height="455" alt="Admin products - filters" src="https://github.com/user-attachments/assets/b0081fd4-c2a3-4d21-b9ed-b078b4329078" />

Upsert Product (`/admin/products/upsert`):
<img width="959" height="455" alt="Admin products upsert" src="https://github.com/user-attachments/assets/ed54c680-e52b-4fdd-a2c4-526ffb7be91c" />

---

### Admin Users (`/admin/users`)

**What you can do**

- Create/edit/delete users with role-based access controls.
- Search/sort users and view avatar thumbnails.
- Export as CSV.

**Screenshots**
<img width="958" height="454" alt="Admin users" src="https://github.com/user-attachments/assets/0a15973f-8183-4c53-9006-e726f925c449" />

Upsert User (`/admin/users/upsert`):
<img width="958" height="455" alt="Admin users upsert" src="https://github.com/user-attachments/assets/5499d00a-09ad-4e0e-89b7-feb427910512" />

---

### Admin Reviews (`/admin/reviews`)

**What you can do**

- Moderate and manage reviews.
- View product + user images, star ratings, and key metadata.
- Export as CSV.

**Screenshots**
<img width="959" height="456" alt="Admin reviews" src="https://github.com/user-attachments/assets/235f78b2-1575-431c-94f4-25c1caf1dc9a" />

<img width="959" height="457" alt="Admin reviews - filters" src="https://github.com/user-attachments/assets/8c4d08f7-f155-46a4-85cf-f9748f8d1e37" />

Upsert Review (`/admin/reviews/upsert`):
<img width="959" height="455" alt="Admin reviews upsert" src="https://github.com/user-attachments/assets/f7c2df6b-63f0-44c5-b399-91ef07e8bbf0" />

---

### Admin Orders (`/admin/orders`)

**What you can do**

- View all store orders with customer email and avatar.
- Search orders and filter by status.
- Click an order card to open order details; edit status or delete.
- Export as CSV.

**Screenshots**
<img width="959" height="457" alt="Admin orders" src="https://github.com/user-attachments/assets/0b64312e-282b-423a-b6bc-62682cf5030a" />

<img width="959" height="458" alt="Admin orders - filters" src="https://github.com/user-attachments/assets/b6b99065-268f-4a58-af6a-bc154a18e53c" />

---

### Admin Order Details (`/admin/orders/:orderId`)

**Purpose**

- Inspect an individual customer order (admin view).

**What you can do**

- Review the full order summary and line items (with product images).
- Update order status and manage the order from the details view.
- Return to **Admin Orders** with a consistent back action.

**Screenshot**
<img width="958" height="455" alt="Admin order details" src="https://github.com/user-attachments/assets/1cca227f-46cb-4eb0-891e-e486cc3ac645" />

> Missing screenshot(s): If you want, add a screenshot for:
>
> - Admin Register (`/admin/register`) (manager-only user creation page)

---

<a id="project-structure"></a>

## 🏗️ Project Structure

```
RetailForge/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── db.js
│   │   └── server.js
│   └── package.json
├── database/
│   └── migrations/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── App.jsx
│   ├── public/
│   ├── index.html
│   └── package.json
└── README.md
```

---

<a id="setup-installation"></a>

## ⚙️ Setup & Installation

### 1. Clone the repository

```sh
git clone https://github.com/yourusername/RetailForge.git
cd RetailForge
```

### 2. Database Setup (PostgreSQL)

- Install PostgreSQL and create a database (e.g., `department_store1`)
- Run all SQL files in `database/migrations/` to create tables
- If you already created the DB earlier, make sure you also run the latest migrations:
    - `012_alter_products_description_to_text.sql`
- (Optional) Add seed data for demo users/products

### 3. Backend Setup

```sh
cd backend
npm install
# Copy .env.example to .env and fill in your DB, session, and Stripe keys
npm run dev
```

### 3a. (Optional) Kafka Setup (local dev)

Kafka is used for event-driven workflows. In this repo it publishes events for **orders**, **auth**, and **inventory**.

1. Start Kafka (Docker required):

```sh
cd RetailForge
docker compose -f docker-compose.kafka.yml up -d
```

2. Enable Kafka in the backend env:

- Copy [backend/.env.example](backend/.env.example) to `backend/.env`
- Set:

```
KAFKA_ENABLED=true
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_ORDERS=rf.orders
KAFKA_TOPIC_AUTH=rf.auth
KAFKA_TOPIC_INVENTORY=rf.inventory

# Inventory alerts (optional)
LOW_STOCK_THRESHOLD=5
```

3. Install the Kafka client library and run the consumer worker:

```sh
cd backend
npm install kafkajs
node src/workers/kafkaWorker.js
```

The worker subscribes to the configured topics and logs events as they arrive.

**Events published (best-effort):**

- Orders topic: `order.created`, `order.paid`, `order.status_updated`
- Auth topic: `user.logged_in`, `auth.login_failed`
- Inventory topic: `inventory.low_stock`, `inventory.out_of_stock`

`LOW_STOCK_THRESHOLD` controls when `inventory.low_stock` is emitted (defaults to `5`).

### 3b. Load Testing (Artillery)

This repo includes Artillery scenarios to load test the backend API with **many concurrent sessions**. The most important scenario is the checkout flow, which intentionally creates real contention for stock so you can verify:

- Session-based login works under concurrency
- Carts and checkout behave correctly with many requests in-flight
- Inventory is never oversold (stock decrements atomically; failures return `409`)
- Kafka events are emitted for auth/order/inventory (when Kafka is enabled)

#### Prerequisites

1. Backend API running:

```sh
cd backend
npm run dev
```

2. Database migrated and seeded with products that have non-zero `stock`.

3. (Optional, for event verification) Kafka + worker running:

```sh
docker compose -f docker-compose.kafka.yml up -d
cd backend
node src/workers/kafkaWorker.js
```

#### Scenarios & scripts

Run these from the `backend/` folder:

```sh
npm run load:browse
npm run load:login-failed
npm run load:checkout
```

- `load:browse`: basic GET traffic against products
- `load:login-failed`: intentionally invalid logins (useful to confirm `auth.login_failed` Kafka events)
- `load:checkout`: end-to-end checkout load test

#### Checkout test: what it simulates

Each virtual user (VU) runs a full flow:

1. `POST /api/auth/login` using credentials from `backend/artillery/data/users.example.csv`
2. `GET /api/cart/user/:userId` (get-or-create cart)
3. `GET /api/products` (select a product)
4. `POST /api/cart/item` (attempt to add quantity=1)
5. `POST /api/payment/complete-checkout` (only attempted when the add-to-cart step succeeds)

Because many VUs overlap in time, this creates real concurrency where multiple shoppers race to buy the same inventory.

#### How many users are “at the same time”?

In the default checkout scenario, Artillery uses an **arrival rate** (new users started per second) and a **duration**. Roughly:

$$\text{VUs created} \approx \text{arrivalRate} \times \text{duration}$$

For example, `arrivalRate: 2` for `duration: 60` seconds creates about `120` VUs.

Note: if your CSV contains only a few accounts, Artillery will reuse them across VUs. That still produces true concurrent API sessions, but it is not the same as 120 unique customer identities. If you want “one account per VU”, expand the CSV.

#### Interpreting results (this is the key)

In this test you should expect a mixture of success and contention:

- `201 Created` from `/api/payment/complete-checkout` means an order was created successfully.
- `409 Conflict` means **insufficient stock**. This is expected under load and is a good sign: it indicates your inventory rules are preventing overselling.
- Occasional `400` responses usually mean a business-rule rejection (e.g., missing fields or cart empty). With the current scenario, checkout is gated on add-to-cart success, so persistent `400`s are not expected.

The backend enforces stock correctness by using an atomic stock decrement in the database and wrapping checkout in a transaction; under concurrency this produces `409` responses rather than negative stock.

#### Kafka: what you should see

When Kafka is enabled and `node src/workers/kafkaWorker.js` is running, a successful checkout run should produce:

- Auth topic: `user.logged_in`
- Orders topic: `order.created`, `order.paid`
- Inventory topic (when thresholds are crossed): `inventory.low_stock`, `inventory.out_of_stock`

This gives you an end-to-end validation: HTTP requests create orders, inventory updates, and Kafka events observable by a worker.

### 4. Frontend Setup

```sh
cd ../frontend
npm install
# Copy .env.example to .env and set VITE_PUBLIC_STRIPE_KEY
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

<a id="environment-variables"></a>

## 🔑 Environment Variables

### Backend (`backend/.env`)

```
POSTGRES_DB=department_store1
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
SESSION_SECRET=your_session_secret
STRIPE_SECRET_KEY=your_stripe_secret

# Kafka (optional)
KAFKA_ENABLED=false
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=retailforge-backend
KAFKA_TOPIC_ORDERS=rf.orders
KAFKA_TOPIC_AUTH=rf.auth
KAFKA_TOPIC_INVENTORY=rf.inventory

# Inventory alerts
LOW_STOCK_THRESHOLD=5
```

### Frontend (`frontend/.env`)

```
VITE_PUBLIC_STRIPE_KEY=your_stripe_publishable_key
```

---

<a id="api-overview"></a>

## 📚 API Overview

- **Products**: `/api/products` (GET, POST, PUT, DELETE)
- **Products Bulk Create (admin/manager)**: `POST /api/products/bulk`
- **Categories/Departments**: `/api/categories`, `/api/departments`
- **Categories Bulk Create (admin/manager)**: `POST /api/categories/bulk`
- **Departments Bulk Create (admin/manager)**: `POST /api/departments/bulk`
- **Users/Auth**: `/api/users`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- **Users Bulk Create (admin/manager)**: `POST /api/users/bulk`
- **Current User Profile**:
    - `GET /api/users/me` (get signed-in user profile)
    - `PUT /api/users/me` (update signed-in user profile fields)
    - `PUT /api/users/me/avatar` (upload avatar image)
- **CartPage**: `/api/cart`, `/api/cart/item`
- **Orders**:
    - `/api/orders/my` (current user)
    - `/api/orders/user/:user_id` (admin)
    - `/api/orders/admin` (admin/manager: all orders with user email)
    - `/api/orders/admin/:id` (admin/manager: order details with user email and items)
- **Order Details**: `/api/order-details/order/:order_id`
- **Reviews**:
    - `/api/reviews` (admin + product review operations)
    - `GET /api/reviews/my` (current user)
    - `PUT /api/reviews/my/:id` (current user)
    - `DELETE /api/reviews/my/:id` (current user)
    - **Reviews Bulk Create (admin/manager)**: `POST /api/reviews/bulk`
- **Favorites**:
    - `GET /api/favorites/my/ids`
    - `GET /api/favorites/my`
    - `POST /api/favorites/toggle`
    - `POST /api/favorites`
    - `DELETE /api/favorites/:productId`

---

<a id="csv-export-bulk-upload-admin"></a>

## 📦 CSV Export & Bulk Upload (Admin)

### CSV Export

- Admin list pages include a **Download CSV** button (where applicable).

### Bulk Upload

- Bulk upload is available on the **“Add New …”** admin pages (not on edit pages).
- The bulk upload UI includes:
    - **Download Template** (headers-only CSV)
    - CSV file picker
    - Row preview
    - **Confirm Upload** to POST `{ rows: [...] }`

### CSV Schemas (important)

- CSV parsing is **strict**: headers must match the template exactly.
- Products CSV uses **category_name** (and optional **department_name**) instead of `category_id`.

**Products (`products.csv`) columns:**

- `name`, `brand`, `rating`, `description`, `price`, `stock`, `category_name`, `department_name` (optional), `image_path` (optional)

**Categories (`categories.csv`) columns:**

- `name`, `description`, `department_name`

**Users (`users.csv`) columns:**

- `first_name`, `last_name`, `email`, `password`, `role`, `phone_number`, `address`

**Reviews (`reviews.csv`) columns:**

- `product_id`, `user_id`, `rating`, `comment`

---

<a id="security-best-practices"></a>

## 🛡️ Security & Best Practices

- Passwords are hashed (bcrypt) and never returned from API responses
- Session cookies are HTTP-only and sent via `credentials: 'include'`
- For a production deployment, you should:
    - Ensure secrets (Stripe key, session secret, DB credentials) live in `.env` and are not committed
    - Enable HTTPS and set session cookies to `secure: true`

---

<a id="contributing"></a>

## 🧑‍💻 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

<a id="planned-features"></a>

## 🚧 Planned Features

These enhancements are in progress or coming soon:

### User Personal Pages

- **More profile options**: Password change, email verification, and stronger validation

### Admin Pages

- **More admin polish**: Continued UX improvements, consistency, and validations across all admin forms

### Whole Project

- **Modernize All Pages**: Refactor all UI to use modern React best practices
- **Refresh-Safe Auth**: All protected pages now wait for session hydration before redirecting, so admin and user pages are refresh-safe
- **Fix Project Title**: Update and standardize the project title across all pages

Want to contribute? Check the issues or project board for these features!

<a id="contact"></a>

## 📬 Contact

- [Your Name](mailto:your.email@example.com)
- [LinkedIn](https://www.linkedin.com/in/yourprofile)

---

> For interviewers: This repo emphasizes practical full-stack patterns (auth, payments, data modeling, admin tooling), strong UX consistency, and correctness under load.
