# BiteStream Assignment 1B API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/users` | Paginated/searchable users |
| GET | `/api/users/:id` | User detail |
| GET | `/api/restaurants` | Paginated/searchable restaurants |
| GET | `/api/restaurants/:id` | Restaurant detail |
| GET | `/api/orders` | Paginated/searchable/filterable orders |
| GET | `/api/orders/:id` | Order detail |
| POST | `/api/checkout` | Calls `sp_execute_checkout` |
| POST | `/api/orders/:id/advance` | Calls `sp_advance_order_status` |
| GET | `/api/users/:id/audit` | Read-only wallet audit with optional dates |
| GET | `/api/analytics/revenue` | 7-day moving-average revenue series |
| GET | `/api/analytics/rankings` | `DENSE_RANK()` leaderboard |
| GET | `/api/analytics/summary` | Materialized-view snapshot |
| POST | `/api/analytics/summary/refresh` | Calls MV refresh procedure |
| GET | `/api/mongo/nearby` | `$geoNear` active-driver search |
| GET | `/api/mongo/reviews` | `$facet` review analytics |
| GET | `/api/mongo/menus/:restaurantId` | Flexible menu/catalog document |
| GET | `/api/health` | API health check |
