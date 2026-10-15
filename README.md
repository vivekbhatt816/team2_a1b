# BiteStream – Assignment 2 (Front End Design)

**Course:** CS6.302 – Software System Development  
**Team:** Team 2 (Assignment 1B)  
**Project:** P1 – BiteStream (food delivery: PostgreSQL + MongoDB)  
**Inherited from:** Assignment 1 Team 5 – [team5_a1](https://github.com/adimitt/team5_a1)  

---

## Metadata & Links

| Field | Value |
| :--- | :--- |
| **GitHub Repo URL** | `https://github.com/vivekbhatt816/team2_a1b`  |
| **Final Commit Hash** | `git rev-parse HEAD`  |
| **Demo Video (≤ 5 min)** | `docs/demo_video` |

---

## 1. Team Members & Contributions

| # | Name |
| :-: | :--- |
| 1 | Thejas Gowda |
| 2 | Vivek Bhatt |
| 3 | SreeLasya Muvva |
| 4 | Charmin Parmar |

### Contribution Breakdown

| Team Member | Design Contributions | Code Contributions | Verification / Integration |
| :--- | :--- | :--- | :--- |
| **Thejas Gowda** | Designed UI wireframes for screen layouts; contributed to interaction decisions. | Implemented backend integration and specific API feature routes. | Tested core workflows and resolved integration issues. |

| **Charmin Parmar** | Reviewed and refined wireframes; contributed to UI layout & responsive design. | Implemented `api/server.js` and integrated API endpoints with frontend. | Verified API responses, error handling, and application startup. |

| **SreeLasya Muvva** | Created wireframes for all 7 screens & UI preview; designed navigation layout. | Contributed `api/routes/audit.js`, `analytics.js`, `browse.js`, and `transactions.js`. | Checked route files and documented inherited system & design decisions. |

| **Vivek Bhatt** | Contributed to screen design, visual consistency, and UI workflow review. | Implemented frontend in `web/app.js`, `web/index.html`, and `web/styles.css`. | Tested UI workflows, captured screenshots, and verified final integration. |

#### Shared Responsibilities
* All members participated in reviewing UI design and discussing workflow usability.
* All members contributed code to their assigned implementation tasks.
* Team members reviewed integration and tested relevant workflows before submission.
* Contributions are recorded according to actual work completed by each member.

---

## 2. System Overview

**BiteStream** is a full-stack food delivery platform. 
* **Assignment 1** established the data layer using **PostgreSQL** (for transactions and analytics) and **MongoDB** (for flexible menus and geospatial tracking).
* **Assignment 2** introduces a browser-based front end and a unified API layer so that all core workflows can be executed seamlessly without running manual database scripts.

The databases perform the core logic (stored procedures, triggers, partial unique indexes, window functions, materialized views, and aggregation pipelines), while the API layer handles pass-through requests and JSON formatting.

### Core Workflows

| # | Workflow | Location / DB Object | UI Screen |
| :-: | :--- | :--- | :--- |
| **1** | **Place an order:** wallet debit, order creation, audit trigger, active order guard | `sp_execute_checkout`, `trg_wallet_audit`, `idx_active_user_order` | Checkout, Wallet Audit |
| **2** | **Revenue analytics:** 7-day moving average, `DENSE_RANK()`, materialized view | `sql/06_window_analytics.sql`, `mv_restaurant_performance` | Analytics |
| **3** | **Nearest active drivers:** drivers within 5 km | MongoDB `$geoNear` on `DriverPings` (`mongo/02_workflow3_geonear.js`) | Live Driver Map |
| **4** | **Review analytics & menus:** flexible menu documents and aggregated reviews | MongoDB `$facet` on `Reviews`, `Menus` collection | Reviews, Browse |

---

## 3. Users & Key Goals

| User Persona | Primary Goals & Capabilities |
| :--- | :--- |
| **Customer** | Select a restaurant, order using wallet balance, track balance changes, view wallet ledger entries, and check real-time order status. |
| **Restaurant Manager / Ops** | Monitor revenue trends & rankings, refresh performance metrics, observe nearby driver density, and inspect reviews/menu catalogs. |

*Wireframes for all 7 screens are available in SVG format under `docs/design/wireframes/`. A UI preview screenshot is located at `docs/design/ui-preview.png`.*

---

## 4. Tech Stack & Architecture Justification

| Layer | Technology | Selection Rationale |
| :--- | :--- | :--- |
| **Relational DB** | **PostgreSQL** | Inherited from A1. Supports ACID transactions, stored procedures, audit triggers, partial unique indexes, window functions, and materialized views. |
| **Document DB** | **MongoDB** | Inherited from A1. Features `2dsphere` indexes with `$geoNear`, `$facet` aggregation pipelines, flexible nested menu schemas, and TTL indexing for pings. |
| **API Layer** | **Node.js + Express** (ES Modules) | Lightweight, single-process server for serving both API routes (`pg`, `mongodb`) and static web assets without complex infrastructure. |
| **Frontend** | **Vanilla HTML5 / CSS3 / JS** (`web/`) | Zero-build setup; highly performant, accessible, and straightforward to run and debug across all 7 screens. |
| **Data Visualization** | **Chart.js 4.4.7** (CDN) | Clean, responsive line, bar, and doughnut charts for revenue analytics and review sentiment. |
| **Geospatial Mapping**| **Leaflet 1.9.4 + OpenStreetMap** | Open-source, lightweight interactive driver tracking map requiring no API keys. |
| **Data Generation** | **Python 3** (`psycopg3`, `pymongo`, `Faker`) | Reproducible database seeders with fixed random seed (`42`). |

---

## 5. Repository Structure

```text
bitestream/
├── README.md
├── docs/
│   ├── handover_note.md          # Handover details & system modification notes
│   ├── api_endpoints.md          # Complete API documentation
│   ├── design/
│   │   ├── wireframes/           # 7 SVG wireframe diagrams
│   │   └── ui-preview.png
│   ├── screenshots/              # Application screenshots
│   ├── relational_erd.png        # ER diagram (PostgreSQL)
│   └── mongo_schema_map.json     # MongoDB schema & index definitions
├── sql/                          # Schema DDL, indexes, triggers, stored procedures, materialized views, window queries
├── mongo/                        # Mongo scripts: collections, indexes, $geoNear, $facet
├── data_generation/              # Seeders: postgres_seeder.py, mongo_seeder.py, requirements.txt
├── performance/                  # EXPLAIN ANALYZE logs & Mongo executionStats
├── api/                          # Express API application
│   ├── server.js
│   ├── db/                       # Postgres & MongoDB connection setups
│   └── routes/                   # Endpoint handlers (browse, transactions, audit, analytics, mongo)
└── web/                          # Frontend assets (index.html, app.js, styles.css)
```

---

## 6. Setup and Installation Guide

### Prerequisites
* **PostgreSQL 14+** (with `psql` in system `PATH`)
* **MongoDB 6+** (with `mongosh`)
* **Node.js 18+** & `npm`
* **Python 3.10+** & `pip`

---

### Step 0: Environment Configuration (Optional)
Default connection parameters work if configured with default user credentials. Set environment variables if needed:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PGHOST` | `127.0.0.1` | PostgreSQL Host |
| `PGPORT` | `5432` | PostgreSQL Port |
| `PGDATABASE` | `bitestream` | Database Name |
| `PGUSER` | `bs` | PostgreSQL User |
| `PGPASSWORD` | `bs` | PostgreSQL Password |
| `MONGO_URI` | `mongodb://127.0.0.1:27017` | MongoDB Connection URI |
| `MONGO_DB` | `bitestream` | MongoDB Database Name |
| `PORT` | `5000` | API & Web Server Port |

---

### Step 1: Create Database & User
Run the following commands in PostgreSQL:
```bash
psql -U postgres -c "CREATE USER bs WITH PASSWORD 'bs' CREATEDB;"
psql -U postgres -c "CREATE DATABASE bitestream OWNER bs;"
```

---

### Step 2: Install Python Seeder Dependencies
```bash
python3 -m pip install -r data_generation/requirements.txt
```

---

### Step 3: Build & Seed PostgreSQL Database
*Run all commands from the repository root directory in sequence:*

```bash
# 1. Apply Schema DDL
psql -U bs -d bitestream -f sql/01_schema_ddl.sql

# 2. Add Triggers, Audit Guards, and Stored Procedures
psql -U bs -d bitestream -f sql/03_triggers_and_audit.sql
psql -U bs -d bitestream -f sql/04_stored_procedures.sql

# 3. Seed Relational Data (~50k users, ~1k restaurants, ~300k orders)
python3 data_generation/postgres_seeder.py
# Note: For a quick test run, use: python3 data_generation/postgres_seeder.py --scale 0.05

# 4. Build Indexes AFTER Seeding (prevents partial unique index conflicts during bulk load)
psql -U bs -d bitestream -f sql/02_indexes.sql

# 5. Build Materialized Views
psql -U bs -d bitestream -f sql/05_materialized_views.sql
```
*(Optional: Run analytics queries directly via `psql -U bs -d bitestream -f sql/06_window_analytics.sql`)*

---

### Step 4: Build & Seed MongoDB Database
*PostgreSQL must be seeded prior to MongoDB seed execution to map restaurant IDs and coordinates.*

```bash
# 1. Setup Mongo Collections, Schema Validation & Indexes
mongosh bitestream mongo/01_collections_and_indexes.js

# 2. Seed Document Data (~1k menus, ~200k reviews, ~500k+ driver pings)
python3 data_generation/mongo_seeder.py
# Note: For a quick test run, use: python3 data_generation/mongo_seeder.py --scale 0.05
```

> ⚠️ **Important Note on Driver Pings (TTL Expiration):**  
> `DriverPings` uses a 2-hour TTL index per spec. If driver map markers expire during testing or before a demo, refresh pings with:
> ```bash
> python3 data_generation/mongo_seeder.py --pings-only
> ```

---

### Step 5: Launch API & Frontend Application
```bash
cd api
npm install
npm start          # Or: npm run dev (for auto-restart mode)
```
* **Web Application:** Access at [http://localhost:5000](http://localhost:5000)
* **API Health Check:** Access at [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 7. Application Screens & Features

| Screen | Functionality & Features | Underlying Backend Logic / Endpoints |
| :--- | :--- | :--- |
| **Overview** | System-wide dashboard metrics (users, restaurants, total orders, revenue) and quick actions. | `/api/analytics/summary`, Browse endpoints |
| **Browse** | Server-side paginated tables for users, restaurants, and orders. Features live search, status filtering, and nested flexible menu documents. | `/api/users`, `/api/restaurants`, `/api/orders`, `/api/mongo/menus/:id` |
| **Checkout** *(Workflow 1)* | Order checkout modal with wallet debit logic. Displays pre/post balance, trigger-generated audit log, and error handling for active orders or insufficient funds. | `CALL sp_execute_checkout(...)` |
| **Wallet Audit** | Read-only financial ledger per user with date-range filters and calculated running balances. | `/api/users/:id/audit` |
| **Analytics** *(Workflow 2)* | Interactive 7-day revenue moving average chart (top 5 restaurants), `DENSE_RANK()` leaderboard, and on-demand materialized view refresh button. | Window queries, `mv_restaurant_performance`, `sp_refresh_restaurant_performance()` |
| **Live Driver Map** *(Workflow 3)* | Leaflet map displaying active drivers within a selectable radius (default 5 km) with distance sorting and ETA. Polls every 10s. | `$geoNear` aggregation pipeline |
| **Reviews** *(Workflow 4)* | Rating distributions, top 10 tag clouds, average sentiment breakdown, and monthly review trends. | `$facet` aggregation pipeline |

---

### Demo Helpers & Features
* **Actor Switcher:** Dropdown in top navigation bar allowing switching between active users (persisted in `localStorage`).
* **Order Status Pipeline:** Advance order states (`PREPARING` → `DELIVERING` → `DELIVERED`) via `sp_advance_order_status`. Demonstrates partial unique index enforcement (blocks concurrent active orders).

---

### Recommended 5-Minute Demo Script
1. **Overview → Browse:** Search for "delhi", inspect restaurant details and flexible menu items.
2. **Checkout Workflow:** Select user with valid balance → execute checkout → view updated balance & generated audit entry.
3. **Active Order Enforcement:** Attempt a second checkout for same user → observe system lock due to active order.
4. **Order State Advance:** Advance active order status to `DELIVERED` → perform checkout again to confirm success.
5. **Validation Error Test:** Attempt checkout exceeding wallet balance → confirm insufficient funds warning.
6. **Wallet Audit:** Filter audit log by date range.
7. **Analytics:** Review 7-day moving average chart, inspect rankings, and trigger materialized view refresh.
8. **Live Driver Map:** Choose restaurant, adjust search radius, inspect real-time driver ETAs.
9. **Reviews:** Explore tag aggregations and sentiment analytics charts.

---

## 8. API Endpoint Reference

*(Complete reference available in [`docs/api_endpoints.md`](docs/api_endpoints.md))*

| Method | Endpoint Path | Description / Operation |
| :-: | :--- | :--- |
| `GET` | `/api/users`, `/api/users/:id` | Paginated user list & detailed user profiles |
| `GET` | `/api/restaurants`, `/api/restaurants/:id` | Paginated restaurant list & detail views |
| `GET` | `/api/orders`, `/api/orders/:id` | Paginated order history with search & status filters |
| `POST` | `/api/checkout` | Executes checkout transaction (`sp_execute_checkout`) |
| `POST` | `/api/orders/:id/advance` | Advances order lifecycle status (`sp_advance_order_status`) |
| `GET` | `/api/users/:id/audit` | Retrieves user wallet audit trail with date range filters |
| `GET` | `/api/analytics/revenue` | Fetches 7-day moving average revenue data |
| `GET` | `/api/analytics/rankings` | Fetches `DENSE_RANK()` restaurant performance leaderboard |
| `GET` | `/api/analytics/summary` | Retrieves materialized view performance snapshot |
| `POST` | `/api/analytics/summary/refresh` | Triggers materialized view refresh procedure |
| `GET` | `/api/mongo/nearby` | Performs `$geoNear` query for drivers within radius |
| `GET` | `/api/mongo/reviews` | Executes `$facet` pipeline for aggregated review analytics |
| `GET` | `/api/mongo/menus/:restaurantId` | Retrieves nested MongoDB flexible menu document |
| `GET` | `/api/health` | Health check endpoint |

---

## 9. Handover Notes from Assignment 1

* The inherited database schema, stored procedures, python seeders, and MongoDB aggregation pipelines operate without modification.
* Verified that checkout procedures, window functions, materialized view refreshes, `$geoNear` (leveraging `ix_pings_geo` `2dsphere`), and `$facet` (leveraging `ix_reviews_restaurant_recent`) execute with optimal query execution plans (no `COLLSCAN`).
* Added `api/`, `web/`, and `docs/design/` layers to satisfy Assignment 2 requirements while leaving base database scripts intact.

---

## 10. System Assumptions

1. **User Persona Model:** Customer actors represent BiteStream users; switching actors mimics session login.
2. **Geospatial Reference Point:** Map searches originate relative to a selected restaurant (default 5 km radius).
3. **Active Order Lifecycle:** An active order is in state `PREPARING` or `DELIVERING`. `DELIVERED` marks terminal completion.
4. **Driver Ping Expiration:** Ping data uses a 2-hour TTL index; re-seeding is required prior to testing/demonstration.
5. **Chart Presentation:** The revenue chart focuses on the top 5 performing restaurants for readability.
6. **Review Window:** Aggregations analyze a 540-day historical window matching the seeded dataset.
7. **Currency Standard:** Financial values are rendered in Indian Rupees (₹ / INR).
8. **Real-time Polling:** Driver map updates every 10 seconds via background polling.

---

## 11. Known Limitations & Roadmap

* **Automated Unit/Integration Tests:** Test coverage for key workflows (e.g., checkout success/failure cases) 
* **Containerization:** Setup is currently manual; a `docker-compose.yml` environment can be added for automated orchestration.
* **Refresh Timestamping:** The Analytics summary displays `MAX(last_order_at)` from the materialized view rather than the exact execution time of `sp_refresh_restaurant_performance()`.
* **CDN Dependencies:** Front-end charts (Chart.js) and mapping (Leaflet) require internet connectivity to load assets from CDNs.
* **Mobile Responsiveness:** Base responsive styles are implemented with room for further mobile layout enhancements.
